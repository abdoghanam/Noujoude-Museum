import type { Metadata } from "next";

import { resolveLocale } from "@/domain/locale";
import { type RouteKey, routeDefinition } from "@/domain/routes";
import { DetailPage } from "@/ui/detail-page";
import { MuseumScene } from "@/ui/museum-scene";
import storyStyles from "@/ui/story-narrative.module.css";

import { State } from "@/ui/state";

const ROUTE: RouteKey = "story-detail";

export const metadata: Metadata = { title: routeDefinition(ROUTE).title };

export default async function StoryDetailPage({
  params,
}: {
  readonly params: Promise<{
    readonly locale?: string;
    readonly "story-slug": string;
  }>;
}) {
  const { locale, "story-slug": slug } = await params;
  const resolved = resolveLocale(locale);

  return (
    <DetailPage route={ROUTE} locale={resolved} slug={slug} kind="story">
      <MuseumScene scene="archive" title="Story Gallery">
        <div className={storyStyles.storyGallery}>
          <div className={storyStyles.narrativeChapter}>
            <span className={storyStyles.chapterNumber}>Chapter I</span>
            <h3 className={storyStyles.chapterHeadline}>Introduction</h3>
            <p className={storyStyles.chapterBody}>
              Story content is an Owner input. Until supplied, this page renders
              its structure only.
            </p>
          </div>
          <div className={storyStyles.narrativeChapter}>
            <span className={storyStyles.chapterNumber}>Chapter II</span>
            <h3 className={storyStyles.chapterHeadline}>Narrative</h3>
            <p className={storyStyles.chapterBody}>
              The story body, supporting images, and related records will appear
              here when story records are published.
            </p>
          </div>
          <div className={storyStyles.storyClosing}>
            <h3 className={storyStyles.chapterHeadline}>Reflection</h3>
            <p className={storyStyles.chapterBody}>
              More than a collection... it&apos;s a story.
            </p>
          </div>
        </div>
        <State
          kind="empty"
          title="No story records published"
          description="Title, introduction, body, country associations, related collections and related artifacts are Owner inputs. Until supplied, this page renders its structure only."
        />
      </MuseumScene>
    </DetailPage>
  );
}
