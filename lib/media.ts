import media from "@/media.json";

export type MediaImage = { file: string; width: number; height: number; alt: string };
export type MediaVideo = { file: string; poster: string; width: number; height: number };

/** Public path of a downloaded media file (see scripts/download-media.mjs). */
export const mediaSrc = (file: string) => `/media/${file}`;

export const images = media.images as Record<keyof typeof media.images, MediaImage>;
export const videos = media.videos as Record<keyof typeof media.videos, MediaVideo>;
