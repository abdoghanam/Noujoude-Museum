// Motion Contract — Noujoude Experience Engine
// Defines the contract for the Web Motion Engine.

export type MotionSequenceId = string;

export interface MotionSequence {
  readonly id: MotionSequenceId;
  readonly target: HTMLElement | null;
  readonly properties: Readonly<Record<string, unknown>>;
  readonly duration: number;
  readonly easing: string;
  readonly delay?: number;
}

export interface MotionEngine {
  play(sequenceId: MotionSequenceId): Promise<void>;
  cancel(sequenceId: MotionSequenceId): void;
  cancelAll(): void;
  setReducedMotion(enabled: boolean): void;
  isReducedMotion(): boolean;
  getActiveSequences(): readonly MotionSequenceId[];
}

export interface MotionCapabilities {
  readonly webAnimationsApi: boolean;
  readonly cssAnimations: boolean;
  readonly requestAnimationFrame: boolean;
  readonly prefersReducedMotion: boolean;
}