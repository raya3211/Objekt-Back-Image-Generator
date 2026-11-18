import fs from 'fs';
import path from 'path';
import { renderCardToCanvas, type RenderCardOptions, ensureFontsLoaded } from './renderer';
import { resolveColors, detectGroup, type CardColors } from './theme';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_CORNER_RADIUS,
  OBJEKT_ASPECT_RATIO,
  GROUPS,
  MEMBER_SIGNS,
  TRIPLE_S_MEMBER_SIGNS,
  CANONICAL_MEMBER_NAMES,
  SEASON_OUTLINE_STARTS,
  DEFAULT_SEASON_COLORS,
} from './constants';

export type OutputFormat = 'webp' | 'png' | 'jpeg';

export interface EncodeOptions {
  format?: OutputFormat;
  quality?: number; // 1 - 100 (default 88)
}

export interface GeneratedImageResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: OutputFormat;
  mimeType: string;
}

/**
 * Generates an authentic Objekt back image as a Buffer.
 * Supports tripleS, ARTMS, and idntt with WebP, PNG, and JPEG encoding.
 */
export async function generateBackImage(
  options: RenderCardOptions,
  encodeOptions: EncodeOptions = {}
): Promise<GeneratedImageResult> {
  const canvas = await renderCardToCanvas(options);
  const format = encodeOptions.format || 'webp';
  const quality = encodeOptions.quality ?? 88;

  let buffer: Buffer;
  let mimeType = 'image/webp';

  if (format === 'png') {
    buffer = await canvas.encode('png');
    mimeType = 'image/png';
  } else if (format === 'jpeg') {
    buffer = await canvas.encode('jpeg', quality);
    mimeType = 'image/jpeg';
  } else {
    buffer = await canvas.encode('webp', quality);
    mimeType = 'image/webp';
  }

  return {
    buffer,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    format,
    mimeType,
  };
}

/**
 * Generates and saves an authentic Objekt back image directly to disk.
 */
export async function saveBackImage(
  options: RenderCardOptions,
  outputPath: string,
  encodeOptions: EncodeOptions = {}
): Promise<string> {
  const result = await generateBackImage(options, encodeOptions);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, result.buffer);
  return outputPath;
}

export {
  renderCardToCanvas,
  resolveColors,
  detectGroup,
  ensureFontsLoaded,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_CORNER_RADIUS,
  OBJEKT_ASPECT_RATIO,
  GROUPS,
  MEMBER_SIGNS,
  TRIPLE_S_MEMBER_SIGNS,
  CANONICAL_MEMBER_NAMES,
  SEASON_OUTLINE_STARTS,
  DEFAULT_SEASON_COLORS,
  type RenderCardOptions,
  type CardColors,
};
