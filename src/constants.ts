import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function findAssetsDir(): string {
  // 1. Check current working directory (Vercel serverless root / local repo root)
  const cwdAssets = path.resolve(process.cwd(), 'assets');
  if (fs.existsSync(cwdAssets)) {
    return cwdAssets;
  }

  // 2. Check relative to source file (local dev / dist)
  try {
    const metaAssets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets');
    if (fs.existsSync(metaAssets)) return metaAssets;
  } catch {}

  try {
    if (typeof __dirname !== 'undefined') {
      const dirAssets = path.resolve(__dirname, '../assets');
      if (fs.existsSync(dirAssets)) return dirAssets;
    }
  } catch {}

  return cwdAssets;
}

export const ASSETS_DIR = findAssetsDir();

export const CARD_WIDTH = 1083;
export const CARD_HEIGHT = 1673;
export const CARD_CORNER_RADIUS = 48;
export const OBJEKT_ASPECT_RATIO = CARD_WIDTH / CARD_HEIGHT; // ~0.6473

export interface MemberSignInfo {
  sign?: string | null;
  position: [number, number];
  group: string;
}

export interface GroupConfig {
  id: string;
  name: string;
  topLogo: string;
  topLogoBounds?: { x: number; y: number; width?: number; height: number };
  sideLogo: string | null;
  defaultSeason: string;
  defaultClass: string;
}

export const GROUPS: Record<string, GroupConfig> = {
  tripleS: {
    id: 'group-6',
    name: 'tripleS',
    topLogo: 'logos/group-6/top_logo.png',
    topLogoBounds: { x: 55, y: 147, width: 99, height: 160 },
    sideLogo: null, // tripleS renders text 'tripleS' in CardBold font
    defaultSeason: 'Cream02',
    defaultClass: 'Double',
  },
  ARTMS: {
    id: 'group-0',
    name: 'ARTMS',
    topLogo: 'logos/group-0/top_logo.png',
    topLogoBounds: { x: 57, y: 195, height: 55 },
    sideLogo: 'logos/group-0/side_logo.png',
    defaultSeason: 'Ever01',
    defaultClass: 'Double',
  },
  idntt: {
    id: 'group-3',
    name: 'idntt',
    topLogo: 'logos/group-3/top_logo.png',
    topLogoBounds: { x: 57, y: 195, height: 55 },
    sideLogo: 'logos/group-3/side_logo.png',
    defaultSeason: 'Summer25',
    defaultClass: 'Basic',
  },
};

/**
 * Authentic signature file paths & exact canvas coordinate positions
 * for tripleS (24 members), ARTMS (5 members), and idntt (15 members).
 */
export const MEMBER_SIGNS: Record<string, MemberSignInfo> = {
  // === tripleS (S1 - S24) ===
  SeoYeon: { sign: 'signs/group-6/SeoYeon.png', position: [29, 996], group: 'tripleS' },
  HyeRin: { sign: 'signs/group-6/HyeRin.png', position: [0, 1028], group: 'tripleS' },
  JiWoo: { sign: 'signs/group-6/JiWoo.png', position: [32, 1026], group: 'tripleS' },
  ChaeYeon: { sign: 'signs/group-6/ChaeYeon.png', position: [1, 982], group: 'tripleS' },
  YooYeon: { sign: 'signs/group-6/YooYeon.png', position: [74, 1025], group: 'tripleS' },
  SooMin: { sign: 'signs/group-6/SooMin.png', position: [0, 985], group: 'tripleS' },
  NaKyoung: { sign: 'signs/group-6/NaKyoung.png', position: [0, 1040], group: 'tripleS' },
  YuBin: { sign: 'signs/group-6/YuBin.png', position: [19, 1034], group: 'tripleS' },
  Kaede: { sign: 'signs/group-6/Kaede.png', position: [24, 1034], group: 'tripleS' },
  DaHyun: { sign: 'signs/group-6/DaHyun.png', position: [39, 1029], group: 'tripleS' },
  Kotone: { sign: 'signs/group-6/Kotone.png', position: [29, 1030], group: 'tripleS' },
  YeonJi: { sign: 'signs/group-6/YeonJi.png', position: [0, 993], group: 'tripleS' },
  Nien: { sign: 'signs/group-6/Nien.png', position: [54, 1033], group: 'tripleS' },
  SoHyun: { sign: 'signs/group-6/SoHyun.png', position: [0, 1035], group: 'tripleS' },
  Xinyu: { sign: 'signs/group-6/Xinyu.png', position: [0, 1030], group: 'tripleS' },
  Mayu: { sign: 'signs/group-6/Mayu.png', position: [46, 984], group: 'tripleS' },
  Lynn: { sign: 'signs/group-6/Lynn.png', position: [57, 1030], group: 'tripleS' },
  JooBin: { sign: 'signs/group-6/JooBin.png', position: [78, 1042], group: 'tripleS' },
  HaYeon: { sign: 'signs/group-6/HaYeon.png', position: [36, 1088], group: 'tripleS' },
  ShiOn: { sign: 'signs/group-6/ShiOn.png', position: [158, 1030], group: 'tripleS' },
  ChaeWon: { sign: 'signs/group-6/ChaeWon.png', position: [60, 1048], group: 'tripleS' },
  Sullin: { sign: 'signs/group-6/Sullin.png', position: [38, 1068], group: 'tripleS' },
  SeoAh: { sign: 'signs/group-6/SeoAh.png', position: [48, 1037], group: 'tripleS' },
  JiYeon: { sign: 'signs/group-6/JiYeon.png', position: [61, 1052], group: 'tripleS' },

  // === ARTMS ===
  HeeJin: { sign: 'signs/group-0/HeeJin.png', position: [35, 1070], group: 'ARTMS' },
  KimLip: { sign: 'signs/group-0/KimLip.png', position: [57, 1025], group: 'ARTMS' },
  JinSoul: { sign: 'signs/group-0/JinSoul.png', position: [48, 1037], group: 'ARTMS' },
  Choerry: { sign: 'signs/group-0/Choerry.png', position: [43, 953], group: 'ARTMS' },
  HaSeul: { sign: 'signs/group-0/HaSeul.png', position: [58, 1054], group: 'ARTMS' },

  // === idntt ===
  DoHun: { sign: 'signs/group-3/DoHun.png', position: [55, 1022], group: 'idntt' },
  HeeJu: { sign: 'signs/group-3/HeeJu.png', position: [55, 1022], group: 'idntt' },
  TaeIn: { sign: 'signs/group-3/TaeIn.png', position: [55, 1022], group: 'idntt' },
  JaeYoung: { sign: 'signs/group-3/JaeYoung.png', position: [55, 1022], group: 'idntt' },
  JuHo: { sign: 'signs/group-3/JuHo.png', position: [55, 1022], group: 'idntt' },
  JiWoon: { sign: 'signs/group-3/JiWoon.png', position: [55, 1022], group: 'idntt' },
  HwanHee: { sign: 'signs/group-3/HwanHee.png', position: [55, 1022], group: 'idntt' },
  CheongMyeong: { sign: 'signs/group-3/CheongMyeong.png', position: [55, 1022], group: 'idntt' },
  Towa: { sign: 'signs/group-3/Towa.png', position: [55, 1022], group: 'idntt' },
  KyuHyuk: { sign: 'signs/group-3/KyuHyuk.png', position: [55, 1022], group: 'idntt' },
  NuRi: { sign: 'signs/group-3/NuRi.png', position: [55, 1022], group: 'idntt' },
  SeongJun: { sign: 'signs/group-3/SeongJun.png', position: [55, 1022], group: 'idntt' },
  YeJoon: { sign: 'signs/group-3/YeJoon.png', position: [55, 1022], group: 'idntt' },
  GyeongBeen: { sign: 'signs/group-3/GyeongBeen.png', position: [55, 1022], group: 'idntt' },
  EunSoo: { sign: 'signs/group-3/EunSoo.png', position: [55, 1022], group: 'idntt' },
};

/** Backward compatibility alias */
export const TRIPLE_S_MEMBER_SIGNS = Object.fromEntries(
  Object.entries(MEMBER_SIGNS).filter(([_, info]) => info.group === 'tripleS')
);

export const CANONICAL_MEMBER_NAMES = Object.keys(MEMBER_SIGNS);

/** Season outline start indices (character index where outline font begins) */
export const SEASON_OUTLINE_STARTS: Record<string, number> = {
  // tripleS & ARTMS
  atom01: 4, // "Atom" (4) + "01" (outline)
  atom02: 4,
  binary01: 6, // "Binary" (6) + "01" (outline)
  binary02: 6,
  cream01: 5, // "Cream" (5) + "01" (outline)
  cream02: 5,
  divine01: 6, // "Divine" (6) + "01" (outline)
  ever01: 4, // "Ever" (4) + "01" (outline)

  // idntt
  spring25: 6, // "Spring" (6) + "25" (outline)
  summer25: 6, // "Summer" (6) + "25" (outline)
  autumn25: 6, // "Autumn" (6) + "25" (outline)
  winter26: 6, // "Winter" (6) + "26" (outline)
  spring26: 6,
  summer26: 6,
  autumn26: 6,
};

/** Fallback presets when online metadata is unavailable */
export const DEFAULT_SEASON_COLORS: Record<string, { background: string; textColor: string }> = {
  // tripleS / ARTMS
  'atom01-first': { background: '#FFDD00', textColor: '#000000' },
  'atom01-special': { background: '#E70680', textColor: '#FFFFFF' },
  'atom01-double': { background: '#FFDD00', textColor: '#000000' },
  'atom01': { background: '#FFDD00', textColor: '#000000' },

  'binary01-first': { background: '#00FF00', textColor: '#000000' },
  'binary01-special': { background: '#E70680', textColor: '#FFFFFF' },
  'binary01-double': { background: '#B0E635', textColor: '#000000' },
  'binary01': { background: '#00FF00', textColor: '#000000' },

  'cream01-first': { background: '#FF7477', textColor: '#000000' },
  'cream01-special': { background: '#F4EFFF', textColor: '#000000' },
  'cream01-double': { background: '#FF9A70', textColor: '#000000' },
  'cream01': { background: '#FF7477', textColor: '#000000' },

  'cream02-first': { background: '#FF7477', textColor: '#000000' },
  'cream02-special': { background: '#F4EFFF', textColor: '#000000' },
  'cream02-double': { background: '#C0846B', textColor: '#000000' },
  'cream02': { background: '#FF7477', textColor: '#000000' },

  'divine01-first': { background: '#B301FE', textColor: '#FFFFFF' },
  'divine01-special': { background: '#E70680', textColor: '#FFFFFF' },
  'divine01-double': { background: '#D05CFF', textColor: '#FFFFFF' },
  'divine01-premier': { background: '#111111', textColor: '#FFFFFF' },
  'divine01': { background: '#B301FE', textColor: '#FFFFFF' },

  'ever01-first': { background: '#33ECFD', textColor: '#000000' },
  'ever01-special': { background: '#F4EFFF', textColor: '#000000' },
  'ever01-double': { background: '#5FE6FF', textColor: '#000000' },
  'ever01-premier': { background: '#111111', textColor: '#FFFFFF' },
  'ever01': { background: '#33ECFD', textColor: '#000000' },

  // idntt
  'spring25-event': { background: '#2D3379', textColor: '#FFFFFF' },
  'spring25': { background: '#2D3379', textColor: '#FFFFFF' },

  'summer25-basic': { background: '#7698F7', textColor: '#000000' },
  'summer25-special': { background: '#EBEBEB', textColor: '#000000' },
  'summer25-unit': { background: '#EBEBEB', textColor: '#000000' },
  'summer25': { background: '#7698F7', textColor: '#000000' },

  'autumn25-basic': { background: '#A24059', textColor: '#FFFFFF' },
  'autumn25-special': { background: '#EBEBEB', textColor: '#000000' },
  'autumn25-unit': { background: '#EBEBEB', textColor: '#000000' },
  'autumn25': { background: '#A24059', textColor: '#FFFFFF' },

  'winter26-basic': { background: '#C6C6C6', textColor: '#000000' },
  'winter26-special': { background: '#EBEBEB', textColor: '#000000' },
  'winter26-unit': { background: '#EBEBEB', textColor: '#000000' },
  'winter26': { background: '#C6C6C6', textColor: '#000000' },

  // Common classes
  'welcome': { background: '#F1F2F2', textColor: '#000000' },
  'zero': { background: '#000000', textColor: '#FFFFFF' },
};
