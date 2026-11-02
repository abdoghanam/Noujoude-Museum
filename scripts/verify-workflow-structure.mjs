#!/usr/bin/env node
/**
 * scripts/verify-workflow-structure.mjs — structural contract check for .github/workflows/ci.yml.
 *
 * Plain Node, no dependencies: `node scripts/verify-workflow-structure.mjs [path]`. The project has
 * no `node_modules` yet (that is Owner decision OD-2) and this host has no YAML parser of any kind —
 * `python -c "import yaml"`, `perl -MYAML`, `ruby -e "require 'yaml'"` and `ConvertFrom-Yaml` all fail
 * (measured 1 Nov 2026), and no cached container image carries one. So the claim this file supports is
 * deliberately narrow, and the claim it does NOT support is stated in its own output line:
 *
 *   IT IS NOT A YAML CONFORMANCE PARSER. It parses the block-subset that this repository's workflow
 *   actually uses — nested mappings, sequences, block scalars, flow scalars quoted or plain — and it
 *   reports a structural defect when a file deviates from that subset. What it genuinely buys is the
 *   defect classes that a human read of a 370-line YAML file cannot hold in working memory:
 *
 *     W1  the byte-level facts: no tabs in indentation, no CR bytes, valid UTF-8, file ends with \n
 *     W2  root shape: a mapping, top-level keys from the GitHub-Actions set, `jobs` non-empty
 *     W3  indentation: dedent must land on a column that opens a block; no duplicate key in one mapping;
 *           every line must be neither deeper nor shallower than its own block's column
 *     W4  job shape: `name`, `runs-on`, and exactly one of `steps` / `uses`, with a non-empty `steps`
 *     W5  step shape: a `run:` step carries a `name:`; a `uses:` ref is `owner/repo@ref`; no empty block
 *     W6  the job DAG: every `needs:` names a real job and the graph is acyclic
 *     W7  every script a `run:` block executes — `node`/`sh`/`bash` followed by a file argument — is
 *         a path that exists in this workspace
 *     W8  every `pnpm <name>` CI invokes is a script this `package.json` declares
 *     W9  the gate list CI runs and the list `pnpm test:gates` chains have not drifted apart
 *     W10 no literal secret value appears anywhere — neither assigned in a `run:` block nor set as the
 *         value of an `env:` key whose name contains PASSWORD / SECRET / TOKEN / KEY
 *
 * W7–W9 are the ones that matter here: a CI file can stay green-looking for months while it calls a
 * script that was renamed, a pnpm script that was deleted, or a suite that exists only in one of the
 * two places. Those are the classes that have already moved under this project's own feet (the
 * count-drift class in IMPLEMENTATION_PLAN §0), and none of them is visible to a reader.
 *
 * Exit 0 = clean. Exit 1 = at least one defect. Reads only: no writes, no network, no runner.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DEFAULT_TARGET = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const TARGET = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_TARGET;

const ALLOWED_ROOT_KEYS = new Set([
  'name', 'on', 'permissions', 'concurrency', 'env', 'jobs', 'defaults', 'run-name',
]);

// pnpm's own subcommands: these are not project scripts and must not be reported as missing.
const PNPM_BUILTINS = new Set([
  'install', 'i', 'add', 'remove', 'rm', 'run', 'dlx', 'exec', 'x', 'audit', 'list', 'ls',
  'store', 'init', 'link', 'unlink', 'prune', 'rebuild', 'up', 'why', 'doctor', 'deploy',
  'patch', 'workspace', 'workspaces', 'import', 'setup', 'help', 'license', 'find-cycles',
  'hb', 'ping', 'server', 'create', 'get', 'update', 'outdated', 'funding',
]);

const SECRET_NAME = /(PASSWORD|SECRET|TOKEN|API_KEY|ACCESS_KEY|PRIVATE_KEY)/i;

const defects = [];
function add(code, message, line) {
  defects.push({ code, message, line: Number.isInteger(line) ? line : null });
}

class Struct extends Error {
  constructor(message, line) {
    super(message);
    this.line = line;
  }
}

const KEY_RE = /^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_.-]+)):(?:[ \t]+(.*))?$/;

/**
 * A deliberately small block-style reader. It understands exactly the forms this repository's
 * workflow files use, and raises Struct on anything else rather than guessing — a guess is how a
 * mis-indented file passes a check that was supposed to catch mis-indentation.
 */
function parse(text) {
  const lines = text.split('\n');
  const open = [];            // stack of indents of the blocks currently open (W3 dedent rule)

  const blank = (i) => i < lines.length && lines[i].trim() === '';
  const comment = (i) => i < lines.length && lines[i].trim().startsWith('#');
  function next(i) {
    let k = i;
    while (k < lines.length && (blank(k) || comment(k))) k += 1;
    return k;
  }
  function indentOf(i) {
    const raw = lines[i];
    let n = 0;
    while (raw[n] === ' ') n += 1;
    if (raw[n] === '\t') throw new Struct('tab character used for indentation', i + 1);
    return n;
  }

  function isSeq(i) { return /^-(\s|$)/.test(lines[i].slice(indentOf(i))); }

  function node(i, indent) {
    open.push(indent);
    try {
      return isSeq(i) ? seq(i, indent) : map(i, indent);
    } finally {
      open.pop();
    }
  }

  function dedentCheck(i) {
    const ind = indentOf(i);
    if (!open.includes(ind)) {
      throw new Struct(
        `line indents to column ${ind}, which opens no enclosing block (expected one of ` +
        `${open.join(', ')})`, i + 1);
    }
  }

  function seq(i, indent) {
    const items = [];
    let cur = i;
    for (;;) {
      const k = next(cur);
      if (k >= lines.length) { cur = k; break; }
      const ind = indentOf(k);
      if (ind < indent) { dedentCheck(k); cur = k; break; }
      if (ind > indent) throw new Struct('sequence item is indented past its sequence', k + 1);
      const itemContent = lines[k].slice(ind);
      if (!isSeq(k)) throw new Struct('mapping key inside a sequence block', k + 1);
      const head = /^-(\s+|$)/.exec(itemContent)[0];
      const col = ind + head.length;
      const rest = itemContent.slice(head.length);
      if (rest.trim() === '') {
        const k2 = next(k + 1);
        if (k2 < lines.length && indentOf(k2) > indent) {
          const r = node(k2, indentOf(k2));
          items.push(r.node);
          cur = r.next;
        } else {
          items.push({ kind: 'null', line: k + 1 });
          cur = k + 1;
        }
      } else {
        const saved = lines[k];
        lines[k] = ' '.repeat(col) + rest;
        let r;
        try {
          r = node(k, col);
        } finally {
          lines[k] = saved;
        }
        items.push(r.node);
        cur = r.next;
      }
    }
    return { node: { kind: 'seq', items, line: i + 1 }, next: cur };
  }

  function map(i, indent) {
    const entries = [];
    const seen = new Map();
    let cur = i;
    for (;;) {
      const k = next(cur);
      if (k >= lines.length) { cur = k; break; }
      const ind = indentOf(k);
      if (ind < indent) { dedentCheck(k); cur = k; break; }
      if (ind > indent) throw new Struct('key is indented past its mapping', k + 1);
      if (isSeq(k)) { cur = k; break; }
      const content = lines[k].slice(ind);
      const m = KEY_RE.exec(content);
      if (!m) throw new Struct(`line is neither a "key: value" pair nor a sequence item: "${lines[k].trim()}"`, k + 1);
      const key = m[1] ?? m[2] ?? m[3];
      if (seen.has(key)) {
        throw new Struct(`duplicate key "${key}" in one mapping (also at line ${seen.get(key)}); YAML would `
          + 'silently keep the later value', k + 1);
      }
      seen.set(key, k + 1);
      const rawVal = m[4];
      let valueNode = { kind: 'null', line: k + 1 };
      let nextCur = k + 1;

      if (rawVal === undefined || rawVal === '') {
        const k2 = next(k + 1);
        if (k2 < lines.length && indentOf(k2) > indent) {
          const r = node(k2, indentOf(k2));
          valueNode = r.node;
          nextCur = r.next;
        }
      } else if (/^[|>][-+0-9]*\s*(#.*)?$/.test(rawVal)) {
        const body = [];
        let j = k + 1;
        let firstBodyIndent = null;
        for (; j < lines.length; j += 1) {
          if (blank(j)) { body.push(''); continue; }
          const bi = indentOf(j);
          if (bi <= indent) break;
          if (firstBodyIndent === null) firstBodyIndent = bi;
          else if (bi < firstBodyIndent) throw new Struct('block scalar body dedents below its first line', j + 1);
          body.push(lines[j].slice(firstBodyIndent));
        }
        while (body.length && body[body.length - 1] === '') body.pop();
        if (!body.join('').trim()) throw new Struct('block scalar has no content', k + 1);
        valueNode = { kind: 'block', text: body.join('\n'), line: k + 1 };
        nextCur = j;
      } else {
        valueNode = { kind: 'scalar', text: rawVal.trim(), line: k + 1 };
      }
      entries.push({ key, value: valueNode, line: k + 1 });
      cur = nextCur;
    }
    return { node: { kind: 'map', entries, line: i + 1 }, next: cur };
  }

  const first = next(0);
  if (first >= lines.length) throw new Struct('the file has no content lines', 1);
  const r = node(first, indentOf(first));
  const trailing = next(r.next);
  if (trailing < lines.length) throw new Struct('content follows the root block at the same or a lower column', trailing + 1);
  return r.node;
}

// ── helpers over the parsed tree ────────────────────────────────────────────────────────────────
const get = (n, key) => (n && n.kind === 'map' ? n.entries.find((e) => e.key === key)?.value : undefined);
const keysOf = (n) => (n && n.kind === 'map' ? n.entries.map((e) => e.key) : []);
const itemsOf = (n) => (n && n.kind === 'seq' ? n.items : []);
const scalarText = (n) => {
  if (!n) return '';
  if (n.kind === 'scalar') return n.text;
  if (n.kind === 'block') return n.text;
  if (n.kind === 'seq') return itemsOf(n).map(scalarText).join('\n');
  return '';
};

function runBlocks(jobsNode) {
  const out = [];
  for (const job of jobsNode.entries) {
    const jobName = job.key;
    for (const step of itemsOf(get(job.value, 'steps'))) {
      const run = get(step, 'run');
      if (!run) continue;
      out.push({ jobName, step, run, stepLine: step.line, runLine: run.line });
    }
  }
  return out;
}

// ── the checks ──────────────────────────────────────────────────────────────────────────────────
// package.json is an input to W8/W9, so it is read before the checks that use it. A missing or
// unparsable package.json is reported as its own defect rather than crashing the gate.
const declaredScripts = new Map();
try {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  for (const [k, v] of Object.entries(pkg.scripts ?? {})) declaredScripts.set(k, String(v));
} catch {
  add('W8', 'package.json is missing or unreadable, so the `pnpm <script>` references cannot be checked');
}

const raw = readFileSync(TARGET, 'utf8');
const bytes = readFileSync(TARGET);

// W1 — byte-level facts.
if (bytes.includes(0x0d)) add('W1', 'carriage-return byte: the workflow must stay LF, like every other file here');
{
  const indentedTabs = raw.split('\n').map((l, i) => [l, i + 1])
    .filter(([l]) => /^[ ]*\t/.test(l));
  for (const [, n] of indentedTabs) add('W1', 'tab used in indentation', n);
}
if (bytes.length && bytes[bytes.length - 1] !== 0x0a) add('W1', 'file does not end with a newline');
if (raw.includes('\uFFFD')) add('W1', 'the file does not decode as UTF-8');

// Parse, then the shape rules.
let root;
try {
  root = parse(raw);
} catch (err) {
  if (err instanceof Struct) {
    add('W3', `structure: ${err.message}`, err.line);
  } else {
    throw err;
  }
}

if (root) {
  if (root.kind !== 'map') {
    add('W2', 'the root of a workflow must be a mapping');
  } else {
    const topKeys = keysOf(root);
    for (const k of topKeys) if (!ALLOWED_ROOT_KEYS.has(k)) add('W2', `unexpected top-level key "${k}"`);
    if (!topKeys.includes('jobs')) add('W2', 'no `jobs:` block — the workflow defines nothing');
    if (!topKeys.includes('on')) add('W2', 'no `on:` trigger block');

    const jobs = get(root, 'jobs');
    if (jobs && jobs.kind === 'map' && jobs.entries.length) {
      const jobNames = jobs.entries.map((e) => e.key);

      // W4 / W5 — job and step shape.
      for (const job of jobs.entries) {
        if (job.value?.kind !== 'map') { add('W4', `job "${job.key}" is not a mapping`, job.line); continue; }
        if (!get(job.value, 'name')) add('W4', `job "${job.key}" has no \`name:\``, job.line);
        if (!get(job.value, 'runs-on')) add('W4', `job "${job.key}" has no \`runs-on:\``, job.line);
        const hasSteps = Boolean(get(job.value, 'steps'));
        const hasUses = Boolean(get(job.value, 'uses'));
        if (hasSteps && hasUses) add('W4', `job "${job.key}" declares both \`steps:\` and \`uses:\``, job.line);
        if (!hasSteps && !hasUses) add('W4', `job "${job.key}" declares neither \`steps:\` nor \`uses:\``, job.line);
        const steps = itemsOf(get(job.value, 'steps'));
        if (hasSteps && !steps.length) add('W4', `job "${job.key}" has an empty \`steps:\``, job.line);
        for (const step of steps) {
          const uses = get(step, 'uses');
          const run = get(step, 'run');
          if (uses && run) add('W5', `a step in "${job.key}" declares both \`uses:\` and \`run:\``, step.line);
          if (!uses && !run) add('W5', `a step in "${job.key}" has neither \`uses:\` nor \`run:\``, step.line);
          if (run && !get(step, 'name')) add('W5', `a \`run:\` step in "${job.key}" has no \`name:\``, step.line);
          if (uses && !/^[^/\s]+\/[^@\s]+@[^@\s]+$/.test(scalarText(uses).trim())) {
            add('W5', `\`uses:\` ref "${scalarText(uses)}" is not owner/repo@ref`, uses.line);
          }
        }

        // W6 — the job DAG.
        const needs = get(job.value, 'needs');
        const wanted = needs
          ? (needs.kind === 'seq' ? itemsOf(needs).map(scalarText) : [scalarText(needs)])
          : [];
        for (const w of wanted) {
          const name = w.trim().replace(/^['"]|['"]$/g, '');
          if (!jobNames.includes(name)) add('W6', `job "${job.key}" needs "${name}", which is not a job`, job.line);
        }
      }

      // W6 — cycles. A cycle is a workflow that never starts, and GitHub's own error for it arrives
      // long after the file looked harmless.
      {
        const deps = new Map(jobs.entries.map((e) => [e.key,
          (() => {
            const n = get(e.value, 'needs');
            if (!n) return [];
            const list = n.kind === 'seq' ? itemsOf(n).map(scalarText) : [scalarText(n)];
            return list.map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter((x) => jobNames.includes(x));
          })()]));
        const visit = (name, seen) => {
          if (seen.includes(name)) { add('W6', `needs-cycle: ${seen.join(' -> ')} -> ${name}`); return; }
          for (const d of deps.get(name) ?? []) visit(d, [...seen, name]);
        };
        for (const n of deps.keys()) visit(n, []);
      }

      // W7 / W8 / W10 over every run block.
      const blocks = runBlocks(jobs);
      for (const { jobName, run } of blocks) {
        const text = scalarText(run);
        const reported = new Set();
        // Only real invocations are checked — a runner keyword followed by a file argument. A path
        // that merely appears inside prose, an echo, or an existence probe (`if [ -f … ]`) is not a
        // command, and the `armed` step in db-privileges deliberately tests for a file that does not
        // exist yet. Globs (`scripts/db/*.sh`) are skipped: a pattern is not one path.
        for (const m of text.matchAll(/(?:^|[\s;|(])(node|sh|bash)\s+([A-Za-z0-9_.@/-]+\.[A-Za-z]{2,4})\b/gm)) {
          const relPath = m[2];
          if (relPath.includes('*') || reported.has(relPath)) continue;
          reported.add(relPath);
          if (!existsSync(path.join(ROOT, relPath))) {
            add('W7', `job "${jobName}" runs \`${m[1]} ${relPath}\`, which does not exist in this workspace`, run.line);
          }
        }
        for (const [, script] of text.matchAll(/\bpnpm\s+([a-zA-Z0-9:_-]+)/g)) {
          if (PNPM_BUILTINS.has(script)) continue;
          if (!declaredScripts.has(script)) {
            add('W8', `job "${jobName}" runs \`pnpm ${script}\`, which package.json does not declare`, run.line);
          }
        }
        for (const m of text.matchAll(/\b([A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|API_KEY|ACCESS_KEY|PRIVATE_KEY)[A-Z0-9_]*)\s*=\s*([^\s]+)\b/g)) {
          const value = m[2].replace(/^['"]|['"]$/g, '');
          if (!value) continue;
          if (value.startsWith('$') || value.startsWith('${') || value.startsWith('``')) continue;
          if (/^(\$\{\{|\$[(])/u.test(value)) continue;
          add('W10', `job "${jobName}" assigns a literal value to ${m[1]}; secrets are generated per run or `
            + 'referenced through the runner secret store, never written into this file', run.line);
        }
      }

      // W10 also covers the mapping form, which is where a hard-coded credential actually lands in a
      // workflow: an `env:` block (job or step) whose key names a secret and whose value is a literal
      // string. Expansion syntax — `${{ secrets.X }}`, `$VAR`, `$(cmd)` — and an empty value are not
      // literals, and must not be reported as if they were.
      function eachMapping(n, visit) {
        if (!n || typeof n !== 'object') return;
        if (n.kind === 'map') {
          for (const e of n.entries) { visit(e); eachMapping(e.value, visit); }
        } else if (n.kind === 'seq') {
          for (const it of n.items) eachMapping(it, visit);
        }
      }
      const isLiteralSecret = (n) => {
        const s = scalarText(n).trim().replace(/^['"]|['"]$/g, '');
        if (!s) return false;
        if (s.startsWith('$')) return false;
        if (s.startsWith('{{')) return false;
        return true;
      };
      eachMapping(root, (e) => {
        if (SECRET_NAME.test(e.key) && e.value?.kind === 'scalar' && isLiteralSecret(e.value)) {
          add('W10', `\`${e.key}:\` on line ${e.line} carries a literal value. CI credentials are generated`
            + ' per run or read from the runner secret store; Standard §4.2 and the no-secrets-in-artifacts'
            + ' rule make a literal here a finding even in a local pipeline', e.line);
        }
      });

      // W9 — CI and `pnpm test:gates` must not drift apart. This is a repository-level statement, so
      // it reads the real package.json when the real workflow is under test. A fixture may not see it:
      // the fixture's own steps would otherwise be accused of omitting the repository's suites. The
      // regression suite supplies the expected list through NDM_EXPECT_SUITES instead, which is the
      // only way this rule can be shown red without editing the committed files.
      const injected = process.env.NDM_EXPECT_SUITES;
      if (TARGET === DEFAULT_TARGET || injected !== undefined) {
        let chained;
        if (injected !== undefined) {
          chained = injected.split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          const gateList = declaredScripts.get('test:gates') ?? '';
          chained = (gateList.match(/(?:^|&&\s*)node\s+(scripts\/tests\/[A-Za-z0-9_.-]+\.mjs)/g) ?? [])
            .map((s) => s.replace(/^(?:&&\s*)?node\s+/, ''));
        }
        const inCi = new Set(
          runBlocks(jobs).map(({ run }) => scalarText(run))
            .flatMap((t) => t.match(/scripts\/tests\/[A-Za-z0-9_.-]+\.mjs/g) ?? []),
        );
        for (const rel of chained) {
          if (!inCi.has(rel)) {
            add('W9', `\`pnpm test:gates\` chains ${rel} but no step in this workflow runs it — the local gate `
              + 'list and the pipeline have drifted apart, which is the failure the suites themselves exist '
              + 'to prevent');
          }
        }
      }
    } else if (jobs && jobs.kind === 'map') {
      add('W2', '`jobs:` is present but empty');
    }
  }
}

const rel = path.relative(ROOT, TARGET).replace(/\\/g, '/');
if (defects.length) {
  for (const d of defects) {
    console.log(`[${d.code}] ${rel}${d.line ? `:${d.line}` : ''}: ${d.message}`);
  }
  console.log(`FAIL: ${defects.length} workflow-structure defect(s) in ${rel}`);
  process.exit(1);
}
console.log(`OK: ${rel} parses as block YAML and its ${keysOf(get(root, 'jobs') ?? { kind: 'map', entries: [] }).length} jobs `
  + `name every step, reference real jobs, invoke scripts that exist, agree with pnpm test:gates, `
  + `and carry no literal secret (10 rules)`);
console.log('NOTE: this is a structural contract check, not a YAML conformance parser and not a CI run.');
process.exit(0);
