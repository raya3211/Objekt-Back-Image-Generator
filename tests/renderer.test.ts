import { test, expect } from 'bun:test';
import { generateBackImage, CARD_WIDTH, CARD_HEIGHT, detectGroup } from '../src/index';
import { resolveColors } from '../src/theme';
import { parseUnitMembers, formatUnitName } from '../src/constants';

test('auto-detects group correctly from member names', () => {
  expect(detectGroup('SeoAh')).toBe('tripleS');
  expect(detectGroup('HeeJin')).toBe('ARTMS');
  expect(detectGroup('KimLip')).toBe('ARTMS');
  expect(detectGroup('DoHun')).toBe('idntt');
  expect(detectGroup('Towa')).toBe('idntt');
});

test('generates authentic tripleS back image', async () => {
  const result = await generateBackImage({
    member: 'SeoAh',
    season: 'Cream02',
    className: 'Double',
    collectionNo: '372Z',
  }, { format: 'webp' });

  expect(result.width).toBe(CARD_WIDTH);
  expect(result.height).toBe(CARD_HEIGHT);
  expect(result.format).toBe('webp');
  expect(result.buffer.byteLength).toBeGreaterThan(10000);
});

test('generates authentic ARTMS back image with side logo', async () => {
  const result = await generateBackImage({
    member: 'HeeJin',
    group: 'ARTMS',
    season: 'Ever01',
    className: 'Double',
    collectionNo: '101Z',
  }, { format: 'webp' });

  expect(result.width).toBe(CARD_WIDTH);
  expect(result.height).toBe(CARD_HEIGHT);
  expect(result.format).toBe('webp');
  expect(result.buffer.byteLength).toBeGreaterThan(10000);
});

test('generates authentic idntt back image with side logo', async () => {
  const result = await generateBackImage({
    member: 'DoHun',
    group: 'idntt',
    season: 'Summer25',
    className: 'Basic',
    collectionNo: '101',
  }, { format: 'png' });

  expect(result.width).toBe(CARD_WIDTH);
  expect(result.height).toBe(CARD_HEIGHT);
  expect(result.format).toBe('png');
  expect(result.buffer.byteLength).toBeGreaterThan(10000);
});

test('parses unit member pairs (S-number order, smaller first)', () => {
  const expected = ['YooYeon', 'Sullin'];
  for (const input of ['S5 × S22', 'S22 x S5', 'S5xS22', '5x22', 'YooYeon × Sullin', 'Sullin x YooYeon']) {
    const pair = parseUnitMembers(input);
    expect(pair?.map((m) => m.name)).toEqual(expected);
  }
  expect(formatUnitName(parseUnitMembers('S22 x S5')!)).toBe('S5 × S22');
  expect(parseUnitMembers('YooYeon')).toBeNull();
  expect(parseUnitMembers('S5 × S99')).toBeNull();
  expect(detectGroup('S5 × S22')).toBe('tripleS');
  expect(detectGroup('DoHun × HeeJu')).toBe('idntt');
});

test('generates tripleS unit back image with two signatures', async () => {
  const result = await generateBackImage({
    member: 'S5 × S22',
    group: 'tripleS',
    season: 'Divine02',
    className: 'Unit',
    backgroundColor: '#FFD39C',
    textColor: '#444444',
  }, { format: 'png' });

  expect(result.width).toBe(CARD_WIDTH);
  expect(result.height).toBe(CARD_HEIGHT);
  expect(result.format).toBe('png');
  expect(result.buffer.byteLength).toBeGreaterThan(10000);
});
