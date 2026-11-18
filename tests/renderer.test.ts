import { test, expect } from 'bun:test';
import { generateBackImage, CARD_WIDTH, CARD_HEIGHT, detectGroup } from '../src/index';
import { resolveColors } from '../src/theme';

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
