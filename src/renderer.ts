import { createCanvas, GlobalFonts, loadImage, type Canvas, type SKRSContext2D } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import {
  ASSETS_DIR,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_CORNER_RADIUS,
  GROUPS,
  MEMBER_SIGNS,
  SEASON_OUTLINE_STARTS,
} from './constants';
import { resolveColors, detectGroup } from './theme';

let fontsLoaded = false;

export function ensureFontsLoaded(customAssetsDir?: string) {
  if (fontsLoaded) return;
  const baseDir = customAssetsDir || ASSETS_DIR;
  const fontsPath = path.join(baseDir, 'fonts');

  const fontFiles = [
    { file: 'CardMedium.otf', family: 'CardMedium' },
    { file: 'CardBold.otf', family: 'CardBold' },
    { file: 'CardOutline.otf', family: 'CardOutline' },
    { file: 'CardSerial.ttf', family: 'CardSerial' },
    { file: 'CardNumber.ttf', family: 'CardNumber' },
  ];

  for (const { file, family } of fontFiles) {
    const fullPath = path.join(fontsPath, file);
    if (fs.existsSync(fullPath)) {
      GlobalFonts.registerFromPath(fullPath, family);
    }
  }
  fontsLoaded = true;
}

export interface RenderCardOptions {
  member: string;
  season?: string;
  className?: string;
  collectionNo?: string;
  group?: string; // 'tripleS' | 'ARTMS' | 'idntt'
  backgroundColor?: string;
  textColor?: string;
  showSignature?: boolean;
  showTopLogo?: boolean;
  showRibbon?: boolean;
  assetsDir?: string;
}

function round(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function tint(image: any, color: string): Canvas {
  const c = createCanvas(image.width, image.height);
  const x = c.getContext('2d');
  x.drawImage(image, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

function imageFit(ctx: SKRSContext2D, image: any, x: number, y: number, w: number, h: number) {
  const iw = image.width || w;
  const ih = image.height || h;
  const s = Math.min(w / iw, h / ih);
  ctx.drawImage(image, x, y + (h - ih * s) / 2, iw * s, ih * s);
}

function text(
  ctx: SKRSContext2D,
  value: string | number | null | undefined,
  x: number,
  y: number,
  size: number,
  max: number,
  font = 'CardMedium',
  align: 'left' | 'right' | 'center' = 'left'
) {
  const v = value == null ? '' : String(value);
  if (!v) return;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const weight = font === 'CardBold' ? 700 : 500;
  ctx.font = `${weight} ${size}px ${font}, sans-serif`;
  const measured = ctx.measureText(v).width;
  if (measured > max) {
    ctx.font = `${weight} ${Math.max(12, (size * max) / measured)}px ${font}, sans-serif`;
  }
  ctx.fillText(v, x, y, max);
  ctx.restore();
}

function drawSeason(
  ctx: SKRSContext2D,
  value: string | number | null | undefined,
  outlineStart: number | null | undefined,
  x: number,
  y: number,
  max = 782
) {
  ctx.save();
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const str = value == null ? '' : String(value);
  const splitIdx = outlineStart == null || outlineStart < 0 ? 5 : outlineStart;
  const solidText = str.slice(0, splitIdx);
  const outlineText = str.slice(splitIdx);

  const runs = [
    { text: solidText, font: 'CardMedium', width: 0 },
    { text: outlineText, font: 'CardOutline', width: 0 },
  ].filter((r) => r.text);

  for (const r of runs) {
    ctx.font = `500 126px ${r.font}, sans-serif`;
    r.width = ctx.measureText(r.text).width;
  }
  const total = runs.reduce((s, r) => s + r.width, 0);
  const scale = total > 0 ? Math.min(1, max / total) : 1;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  let dx = 0;
  for (const r of runs) {
    ctx.font = `500 126px ${r.font}, sans-serif`;
    ctx.fillText(r.text, dx, 0);
    dx += r.width;
  }
  ctx.restore();
}

function drawNumbering(
  ctx: SKRSContext2D,
  number: string | null | undefined,
  serial?: string | number | null
) {
  const numStr = number == null ? '' : String(number).trim();
  const serStr =
    serial == null || String(serial).trim() === ''
      ? ''
      : '#' + String(serial).replace(/^#/, '').padStart(6, '0');
  if (!numStr && !serStr) return;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const runs = [
    { text: numStr, font: `700 ${serStr ? 54 : 56}px CardNumber, sans-serif`, width: 0 },
    { text: serStr, font: `400 60px CardSerial, sans-serif`, width: 0 },
  ].filter((r) => r.text);

  for (const r of runs) {
    ctx.font = r.font;
    r.width = ctx.measureText(r.text).width;
  }
  const gap = runs.length === 2 ? (1479 / 2) * 0.025 : 0;
  const total = runs.reduce((s, r) => s + r.width, 0) + gap;
  const scale = Math.min(1, 440 / total);

  ctx.translate(739.5, 59);
  ctx.scale(scale, scale);
  let x = -total / 2;
  for (const r of runs) {
    ctx.font = r.font;
    const m = ctx.measureText(r.text);
    const ascent = m.actualBoundingBoxAscent ?? 22;
    const descent = m.actualBoundingBoxDescent ?? 0;
    const yOffset = (ascent - descent) / 2;
    ctx.fillText(r.text, x, yOffset);
    x += r.width + gap;
  }
  ctx.restore();
}

function sidebar(
  ctx: SKRSContext2D,
  card: { member: string; group: string; collectionNo?: string; fg: string; sideLogo?: any }
) {
  ctx.save();
  ctx.translate(983, 97);
  ctx.rotate(Math.PI / 2);

  ctx.fillStyle = card.fg;
  const cardNumText = card.collectionNo || '';
  const hasNumbering = !!cardNumText;

  // 1. Member name: local (52, 33)
  text(ctx, card.member, 52, 33, 56, hasNumbering ? 430 : 650, 'CardBold');

  // 2. Center Numbering
  if (hasNumbering) {
    drawNumbering(ctx, cardNumText, null);
  }

  // 3. Group Wordmark (sideLogo or text fallback)
  if (card.sideLogo) {
    const s = Math.min(1, 290 / card.sideLogo.width, 60 / card.sideLogo.height);
    const sw = card.sideLogo.width * s;
    const sh = card.sideLogo.height * s;
    const t = tint(card.sideLogo, card.fg);
    ctx.drawImage(t, 1427 - sw, (118 - sh) / 2, sw, sh);
  } else {
    text(ctx, card.group, 1427, 33, 56, hasNumbering ? 410 : 650, 'CardBold', 'right');
  }

  ctx.restore();
}

/**
 * Renders an authentic Modhaus Objekt back photocard onto a native Skia Canvas.
 * Supports tripleS, ARTMS, and idntt.
 */
export async function renderCardToCanvas(options: RenderCardOptions): Promise<Canvas> {
  const assets = options.assetsDir || ASSETS_DIR;
  ensureFontsLoaded(assets);

  const group = detectGroup(options.member, options.group);
  const groupConfig = GROUPS[group] || GROUPS.tripleS;

  const season = options.season || groupConfig.defaultSeason;
  const className = options.className || groupConfig.defaultClass;
  const normalizedClass = className.toLowerCase();

  const colors = await resolveColors({
    group,
    season,
    member: options.member,
    className,
    collectionNo: options.collectionNo,
    backgroundColor: options.backgroundColor,
    textColor: options.textColor,
  });

  // 1. Resolve Logos
  const topLogoPath = path.join(assets, groupConfig.topLogo);
  const sideLogoPath = groupConfig.sideLogo ? path.join(assets, groupConfig.sideLogo) : null;

  // 2. Resolve Signature
  const signInfo = MEMBER_SIGNS[options.member];
  let signPath: string | null = null;
  if (signInfo?.sign) {
    signPath = path.join(assets, signInfo.sign);
    if (!fs.existsSync(signPath)) {
      // Check flat signs folder fallback
      signPath = path.join(assets, 'signs', path.basename(signInfo.sign));
    }
  }

  // 3. Resolve Texture (Special, Premier, Unit)
  let texturePath: string | null = null;
  if (normalizedClass === 'special') {
    texturePath = path.join(assets, 'textures', groupConfig.id, 'special/back.png');
    if (!fs.existsSync(texturePath)) texturePath = path.join(assets, 'textures/special-back.png');
  } else if (normalizedClass === 'premier') {
    texturePath = path.join(assets, 'textures', groupConfig.id, 'premier/back.png');
    if (!fs.existsSync(texturePath)) texturePath = path.join(assets, 'textures/premier-back.png');
  } else if (normalizedClass === 'unit') {
    texturePath = path.join(assets, 'textures', groupConfig.id, 'unit/back.png');
  }

  const [topLogo, sideLogo, signature, backTexture] = await Promise.all([
    fs.existsSync(topLogoPath) && options.showTopLogo !== false ? loadImage(topLogoPath).catch(() => null) : null,
    sideLogoPath && fs.existsSync(sideLogoPath) ? loadImage(sideLogoPath).catch(() => null) : null,
    signPath && fs.existsSync(signPath) && options.showSignature !== false ? loadImage(signPath).catch(() => null) : null,
    texturePath && fs.existsSync(texturePath) ? loadImage(texturePath).catch(() => null) : null,
  ]);

  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 1. Outer White base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 2. Clipped Colored inner card
  ctx.save();
  round(ctx, -48, 97, 1034, 1479, 48);
  ctx.clip();
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 97, 986, 1479);
  if (backTexture) {
    ctx.drawImage(backTexture, 0, 0, CARD_WIDTH, CARD_HEIGHT);
  }
  ctx.restore();

  // 3. Top Logo
  ctx.fillStyle = colors.textColor;
  if (topLogo) {
    const s = Math.min(1, 550 / topLogo.width, 140 / topLogo.height);
    const t = tint(topLogo, colors.textColor);
    imageFit(ctx, t, 57, 151, Math.min(550, topLogo.width) * s, Math.min(140, topLogo.height) * s);
  } else {
    text(ctx, groupConfig.name, 57, 178, 64, 720, 'CardBold');
  }

  // 4. Rows (NAME, CLASS, SEASON)
  const rows = [
    ['NAME', options.member, 357],
    ['CLASS', className, 579],
    ['SEASON', season, 799],
  ];

  const digitIndex = season.search(/\d/);
  const outlineStart = SEASON_OUTLINE_STARTS[season.toLowerCase()] ?? (digitIndex !== -1 ? digitIndex : 5);

  for (const [label, val, y] of rows) {
    ctx.fillStyle = colors.textColor;
    ctx.fillRect(57, y as number, 771, 3);
    text(ctx, label, 57, (y as number) + 16, 40, 700, 'CardBold');
    if (label === 'SEASON') {
      drawSeason(ctx, val, outlineStart, 50, (y as number) + 79, 782);
    } else {
      text(ctx, val, 50, (y as number) + 79, 126, 782);
    }
  }

  // Horizontal separators
  ctx.fillStyle = colors.textColor;
  ctx.fillRect(57, 1018, 771, 3);
  ctx.fillRect(57, 1331, 771, 3);

  // 5. Signature
  if (signature && signInfo) {
    const t = tint(signature, colors.textColor);
    ctx.drawImage(t, signInfo.position[0], signInfo.position[1], signature.width, signature.height);
  }

  // 6. Right Vertical Ribbon
  if (options.showRibbon !== false) {
    sidebar(ctx, {
      member: options.member,
      group: groupConfig.name,
      collectionNo: options.collectionNo,
      fg: colors.textColor,
      sideLogo,
    });
  }

  // 7. Subtle Border Rim
  ctx.save();
  round(ctx, 1.5, 1.5, CARD_WIDTH - 3, CARD_HEIGHT - 3, CARD_CORNER_RADIUS);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();
  ctx.restore();

  return canvas;
}
