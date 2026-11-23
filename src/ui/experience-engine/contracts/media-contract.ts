// Media Contract — Noujoude Experience Engine
// Defines the contract for the Exhibition/Media Engine.

export interface MediaAsset {
  readonly id: string;
  readonly type: "image" | "video" | "3d-texture" | "audio";
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
  readonly credit?: string;
  readonly rightsStatus: string;
  readonly width?: number;
  readonly height?: number;
}

export interface ExhibitionEngine {
  loadAsset(assetId: string): Promise<MediaAsset>;
  unloadAsset(assetId: string): void;
  getAsset(assetId: string): MediaAsset | undefined;
  preloadAssets(assetIds: readonly string[]): Promise<void>;
  dispose(): void;
}

export interface MediaCapabilities {
  readonly intersectionObserver: boolean;
  readonly lazyLoading: boolean;
  readonly responsiveImages: boolean;
  readonly videoAutoplay: boolean;
}
