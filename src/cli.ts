#!/usr/bin/env bun
import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { generateBackImage, saveBackImage, detectGroup, type OutputFormat } from './index';
import { getCollectionSeries, getSeriesList, getMissingStats } from './collections';

const program = new Command();

program
  .name('objekt-back-image')
  .description('Authentic Modhaus Objekt back photocard generator (tripleS, ARTMS & idntt)')
  .version('1.1.0');

// Command: generate single card
program
  .command('generate')
  .description('Generate an authentic back image for a single Objekt photocard')
  .requiredOption('-m, --member <name>', 'Member name (e.g. SeoAh, HeeJin, DoHun)')
  .option('-s, --season <season>', 'Season (e.g. Cream02, Ever01, Summer25)')
  .option('-c, --class <class>', 'Class (e.g. First, Double, Special, Basic, Unit)')
  .option('-n, --number <number>', 'Collection number (e.g. 372Z, 101Z, 101)', '')
  .option('-g, --group <group>', 'Group (tripleS, ARTMS, or idntt; auto-detected from member if omitted)')
  .option('-o, --out <path>', 'Output file path (e.g. ./output.webp)', './objekt-back.webp')
  .option('-f, --format <format>', 'Format (webp, png, jpeg)', 'webp')
  .option('-q, --quality <quality>', 'Compression quality (1-100)', '88')
  .option('--bg <hex>', 'Custom background hex color (optional)')
  .option('--text <hex>', 'Custom text hex color (optional)')
  .action(async (opts) => {
    const group = detectGroup(opts.member, opts.group);
    console.log(`\n🎴 Generating authentic back image for [${group}] ${opts.member}...`);
    const t0 = performance.now();

    try {
      const result = await generateBackImage(
        {
          member: opts.member,
          group,
          season: opts.season,
          className: opts.class,
          collectionNo: opts.number,
          backgroundColor: opts.bg,
          textColor: opts.text,
        },
        {
          format: opts.format as OutputFormat,
          quality: Number(opts.quality),
        }
      );

      const outPath = path.resolve(process.cwd(), opts.out);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outPath, result.buffer);

      const elapsed = (performance.now() - t0).toFixed(1);
      const sizeKb = (result.buffer.byteLength / 1024).toFixed(1);
      console.log(`✅ Saved: ${outPath} (${sizeKb} KB in ${elapsed}ms)\n`);
    } catch (err: any) {
      console.error(`❌ Error generating card:`, err.message);
      process.exit(1);
    }
  });

// Command: batch generate
program
  .command('batch')
  .description('Generate a batch of cards from a JSON file')
  .requiredOption('-i, --input <file>', 'Input JSON file containing card array')
  .option('-o, --out-dir <dir>', 'Output directory for generated images', './output')
  .option('-f, --format <format>', 'Format (webp, png, jpeg)', 'webp')
  .action(async (opts) => {
    const inputPath = path.resolve(process.cwd(), opts.input);
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      process.exit(1);
    }

    const cards = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    if (!Array.isArray(cards)) {
      console.error('❌ Input JSON must be an array of card objects');
      process.exit(1);
    }

    const outDir = path.resolve(process.cwd(), opts.outDir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    console.log(`\n🎴 Processing batch of ${cards.length} cards...`);
    const t0 = performance.now();
    let success = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const member = card.member || card.name?.split(' ')[1] || 'SeoAh';
      const group = detectGroup(member, card.group);
      const season = card.season;
      const className = card.className || card.class;
      const number = card.collectionNo || card.number || '';
      const filename = `${group}-${season || 'default'}-${member}-${number || i + 1}.${opts.format}`;
      const dest = path.join(outDir, filename);

      try {
        await saveBackImage(
          {
            member,
            group,
            season,
            className,
            collectionNo: number,
            backgroundColor: card.backgroundColor,
            textColor: card.textColor,
          },
          dest,
          { format: opts.format as OutputFormat }
        );
        success++;
      } catch (err: any) {
        console.error(`❌ Failed card ${member} ${number}:`, err.message);
      }

      if ((i + 1) % 10 === 0 || i === cards.length - 1) {
        process.stdout.write(`\r⏳ Progress: ${i + 1}/${cards.length} (${success} completed)`);
      }
    }

    const totalTime = ((performance.now() - t0) / 1000).toFixed(1);
    console.log(`\n🎉 Batch completed in ${totalTime}s! Saved to: ${outDir}\n`);
  });

// Command: inspect missing collections
program
  .command('inspect')
  .description('Inspect real Modhaus Objekt collections and list missing back images')
  .option('-g, --group <group>', 'Group (tripleS, ARTMS, idntt)', 'tripleS')
  .option('-s, --season <season>', 'Season filter (optional, e.g. Cream02)')
  .option('--missing', 'Show only series with missing back images', true)
  .action(async (opts) => {
    console.log(`\n🔍 Scanning real collections for [${opts.group}] via objekt.top API...`);
    const stats = await getMissingStats(opts.group);
    console.log(`\n📊 Status Summary for ${opts.group}:`);
    console.log(`   - Total Cards: ${stats.totalCards.toLocaleString()}`);
    console.log(`   - Missing Back Images: ${stats.missingCards.toLocaleString()} cards`);
    console.log(`   - Total Collection Series: ${stats.totalSeries}`);
    console.log(`   - Series with Missing Cards: ${stats.missingSeries}\n`);

    const series = await getSeriesList({
      group: opts.group,
      season: opts.season,
      onlyMissing: Boolean(opts.missing),
    });

    console.log(`Found ${series.length} collection series${opts.season ? ` in ${opts.season}` : ''}:`);
    for (const s of series.slice(0, 20)) {
      const tag = s.missingCount > 0 ? `⚠️ ${s.missingCount}/${s.totalMembers} missing` : `✅ complete`;
      console.log(`   - ${s.season} ${s.collectionNo} (${s.className}): ${tag} [Members: ${s.members.map((m) => m.member).join(', ')}]`);
    }
    if (series.length > 20) {
      console.log(`   ... and ${series.length - 20} more series.`);
    }
    console.log(`\nTip: Run 'bun run cli recover -g ${opts.group} -s <season> -n <number>' to batch generate authentic back images for any collection.\n`);
  });

// Command: recover a real collection batch
program
  .command('recover')
  .description('Batch recover and generate authentic back images for a real collection series')
  .requiredOption('-s, --season <season>', 'Season (e.g. Cream02)')
  .requiredOption('-n, --number <number>', 'Collection number (e.g. 372Z)')
  .option('-g, --group <group>', 'Group (tripleS, ARTMS, idntt)', 'tripleS')
  .option('-o, --out-dir <dir>', 'Output directory', './output')
  .option('-f, --format <format>', 'Format (webp, png, jpeg)', 'webp')
  .action(async (opts) => {
    console.log(`\n🎴 Looking up real collection [${opts.group}] ${opts.season} ${opts.number}...`);
    const series = await getCollectionSeries(opts.group, opts.season, opts.number);

    if (!series) {
      console.error(`❌ Collection series ${opts.season} ${opts.number} not found in database.`);
      process.exit(1);
    }

    console.log(`✅ Found real collection: ${series.season} ${series.collectionNo} (${series.className})`);
    console.log(`   Total Members: ${series.totalMembers} | Missing Back Images: ${series.missingCount}`);
    console.log(`   Members: ${series.members.map((m) => m.member).join(', ')}`);

    const outDir = path.resolve(process.cwd(), opts.outDir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    console.log(`\n⏳ Generating ${series.totalMembers} authentic back images in parallel...`);
    const t0 = performance.now();

    await Promise.all(
      series.members.map(async (m, i) => {
        const dest = path.join(
          outDir,
          `${String(i + 1).padStart(2, '0')}-${m.member}.${opts.format}`
        );
        await saveBackImage(
          {
            member: m.member,
            group: opts.group,
            season: series.season,
            className: series.className,
            collectionNo: series.collectionNo,
            backgroundColor: m.backgroundColor,
            textColor: m.textColor,
          },
          dest,
          { format: opts.format as OutputFormat }
        );
      })
    );

    const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
    console.log(`🎉 Successfully recovered ${series.totalMembers} cards in ${elapsed}s! Saved to: ${outDir}\n`);
  });

// Command: start HTTP server
program
  .command('serve')
  .description('Start the local HTTP API microservice & web playground')
  .option('-p, --port <port>', 'Port to listen on', '3001')
  .action((opts) => {
    process.env.PORT = opts.port;
    import('./server');
  });

program.parse(process.argv);
