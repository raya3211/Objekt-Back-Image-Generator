import { saveBackImage } from '../src/index';

async function main() {
  console.log('🚀 Running Objekt Back Image Demo...\n');

  const testCards = [
    { member: 'SeoAh', season: 'Cream02', className: 'Double', collectionNo: '372Z' },
    { member: 'Sullin', season: 'Cream02', className: 'First', collectionNo: '109Z' },
    { member: 'HyeRin', season: 'Atom01', className: 'Special', collectionNo: '201Z' },
  ];

  for (const card of testCards) {
    const filename = `./output/${card.season}-${card.member}-${card.collectionNo}.webp`;
    await saveBackImage(card, filename);
    console.log(`✅ Generated: ${filename}`);
  }

  console.log('\n🎉 Demo completed! Check the ./output folder.');
}

main().catch(console.error);
