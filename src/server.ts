import type { OutputFormat } from './index';
import { GROUPS, MEMBER_SIGNS } from './constants';
import { detectGroup } from './theme';
import { getCollectionSeries, getSeriesList, getSeasonsList } from './collections';
import JSZip from 'jszip';

let _generateBackImage: any = null;
async function getGenerateBackImage() {
  if (!_generateBackImage) {
    const mod = await import('./index');
    _generateBackImage = mod.generateBackImage;
  }
  return _generateBackImage;
}

const PORT = Number(process.env.PORT || 3001);

const htmlPlayground = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Objekt Back Image — tripleS, ARTMS & idntt</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090a0f;
      --card: #12141c;
      --border: #232738;
      --accent: #ff4880;
      --accent-glow: rgba(255, 72, 128, 0.25);
      --text: #f0f2f8;
      --text-muted: #8b92a8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 1.15rem 2rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(18, 20, 28, 0.85);
      backdrop-filter: blur(12px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -0.02em;
    }
    .badge {
      background: var(--accent-glow);
      color: var(--accent);
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid rgba(255, 72, 128, 0.3);
    }
    main {
      flex: 1;
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 2.25rem;
      padding: 2.25rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
    }
    .panel {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    .panel-title {
      font-size: 1.05rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    select, input[type="text"] {
      background: #181b26;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.7rem 0.85rem;
      border-radius: 0.65rem;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }
    select:focus, input[type="text"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
    }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }
    .btn-primary {
      background: linear-gradient(135deg, #ff4880, #7928ca);
      color: #fff;
      font-weight: 700;
      border: none;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      font-family: inherit;
      box-shadow: 0 4px 16px var(--accent-glow);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(255, 72, 128, 0.4);
    }
    .preview-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 2rem;
      min-height: 600px;
    }
    .card-preview {
      width: 100%;
      max-width: 360px;
      aspect-ratio: 1083 / 1673;
      border-radius: 16px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      object-fit: contain;
      background: #000;
    }
    .code-box {
      background: #08090d;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      color: #9cdcfe;
      overflow-x: auto;
      white-space: pre;
    }
    .series-info {
      font-size: 0.85rem;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
    }
    @media (max-width: 960px) {
      main { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>Objekt Back Image</span>
      <span class="badge">tripleS · ARTMS · idntt</span>
    </div>
    <div style="font-size: 0.85rem; color: var(--text-muted);">
      Powered by Bun & Skia Canvas
    </div>
  </header>

  <main>
    <div class="panel">
      <div class="panel-title">Collection Inspector</div>
      
      <div class="row-2">
        <div class="form-group">
          <label>Artist / Group</label>
          <select id="group">
            <option value="tripleS" selected>tripleS</option>
            <option value="ARTMS">ARTMS</option>
            <option value="idntt">idntt</option>
          </select>
        </div>
        <div class="form-group">
          <label>Season</label>
          <select id="season"></select>
        </div>
      </div>

      <div class="form-group">
        <label>Collection Series</label>
        <select id="collectionSeries">
          <option value="">Loading collections...</option>
        </select>
      </div>

      <div class="form-group">
        <label>Members in This Collection</label>
        <select id="member"></select>
      </div>

      <div class="row-2">
        <div class="form-group">
          <label>Format</label>
          <select id="format">
            <option value="webp" selected>WebP (Fast & Compact)</option>
            <option value="png">PNG (Lossless)</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
        <div class="form-group">
          <label>Class</label>
          <input type="text" id="className" value="Double" readonly style="opacity: 0.85;">
        </div>
      </div>

      <div class="form-group">
        <label>Custom Color Override (Optional)</label>
        <input type="text" id="bgColor" placeholder="Leave empty for authentic Modhaus palette">
      </div>

      <button class="btn-primary" id="btnRefresh">Refresh Preview</button>
      <div class="code-box" id="apiEndpoint">GET /api/batch?group=tripleS&season=Cream02&number=372Z</div>
    </div>

    <div class="preview-box">
      <div id="seriesInfo" class="series-info">Loading collection...</div>
      <img id="cardImg" class="card-preview" src="" alt="Back Image Preview">
      
      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.65rem; width: 100%;">
        <button id="btnDownload" class="btn-primary" style="width: 100%; max-width: 360px; font-size: 0.95rem;">
          Download Batch Collection (.zip)
        </button>
        <div id="downloadStatus" style="font-size: 0.8rem; color: var(--text-muted); min-height: 1.2rem; text-align: center;"></div>
      </div>
    </div>
  </main>

  <script>
    let currentSeriesData = [];
    let activeSeries = null;

    async function loadSeries() {
      const group = document.getElementById('group').value;
      const season = document.getElementById('season').value;

      const seriesSel = document.getElementById('collectionSeries');
      seriesSel.innerHTML = '<option value="">Loading collections...</option>';

      try {
        const res = await fetch('/api/series?group=' + group + '&season=' + season);
        const data = await res.json();
        currentSeriesData = Array.isArray(data) ? data : [];

        if (currentSeriesData.length === 0) {
          seriesSel.innerHTML = '<option value="">(No collections found)</option>';
          activeSeries = null;
          updateMembersDropdown();
          return;
        }

        // Populated sorted newest first
        seriesSel.innerHTML = currentSeriesData.map(s => {
          return '<option value=\"' + s.number + '\">' + s.season + ' ' + s.number + ' (' + s.totalMembers + ' members)</option>';
        }).join('');

        seriesSel.value = currentSeriesData[0].number;
        await onSeriesChange();
      } catch (err) {
        seriesSel.innerHTML = '<option value="">Error loading collections</option>';
      }
    }

    async function onSeriesChange() {
      const group = document.getElementById('group').value;
      const season = document.getElementById('season').value;
      const number = document.getElementById('collectionSeries').value;
      if (!number) return;

      try {
        const res = await fetch('/api/collections?group=' + group + '&season=' + season + '&number=' + encodeURIComponent(number));
        if (res.ok) {
          activeSeries = await res.json();
          document.getElementById('className').value = activeSeries.className || 'Double';
          updateMembersDropdown();
          updatePreview();
        }
      } catch {}
    }

    function updateMembersDropdown() {
      const memSel = document.getElementById('member');
      if (!activeSeries || !activeSeries.members || activeSeries.members.length === 0) {
        memSel.innerHTML = '<option value=\"\">No members</option>';
        return;
      }

      const total = activeSeries.members.length;
      let html = '<option value=\"all\" selected>All Members in ' + activeSeries.collectionNo + ' (' + total + ' Members — Batch)</option>';

      for (let i = 0; i < activeSeries.members.length; i++) {
        const m = activeSeries.members[i];
        html += '<option value=\"' + m.member + '\">' + (i + 1) + '. ' + m.member + '</option>';
      }

      memSel.innerHTML = html;
      memSel.value = 'all';
    }

    function updatePreview() {
      if (!activeSeries) return;

      const group = document.getElementById('group').value;
      const season = activeSeries.season;
      const number = activeSeries.collectionNo;
      const className = activeSeries.className || 'Double';
      const memberVal = document.getElementById('member').value;
      const format = document.getElementById('format').value;
      const bg = document.getElementById('bgColor').value.trim();

      const isBatch = memberVal === 'all';
      const previewMember = isBatch ? activeSeries.members[0]?.member : memberVal;
      if (!previewMember) return;

      const previewParams = new URLSearchParams({
        group,
        member: previewMember,
        season,
        class: className,
        number,
        format,
      });
      if (bg) previewParams.set('bg', bg);

      const previewUrl = '/api/generate?' + previewParams.toString() + '&_t=' + Date.now();
      document.getElementById('cardImg').src = previewUrl;

      // Series Info
      document.getElementById('seriesInfo').textContent =
        season + ' ' + number + ' (' + className + ') · ' + activeSeries.totalMembers + ' Members';

      // Download Button
      const btn = document.getElementById('btnDownload');
      if (isBatch) {
        btn.textContent = 'Download Batch: ' + activeSeries.totalMembers + ' Members (.zip)';
        const batchParams = new URLSearchParams({ group, season, number, class: className, format });
        if (bg) batchParams.set('bg', bg);
        btn.dataset.mode = 'batch';
        btn.dataset.url = '/api/batch?' + batchParams.toString();
        btn.dataset.filename = group + '-' + season + '-' + className + '-' + number + '-' + activeSeries.totalMembers + 'cards.zip';
        document.getElementById('apiEndpoint').textContent = 'GET ' + btn.dataset.url;
      } else {
        btn.textContent = 'Download ' + previewMember + ' (' + format.toUpperCase() + ')';
        btn.dataset.mode = 'single';
        btn.dataset.url = '/api/generate?' + previewParams.toString();
        btn.dataset.filename = group + '-' + previewMember + '-' + season + '-' + number + '.' + format;
        document.getElementById('apiEndpoint').textContent = 'GET ' + btn.dataset.url;
      }
    }

    async function populateSeasons(group) {
      const seaSel = document.getElementById('season');
      seaSel.innerHTML = '<option value="">Loading seasons...</option>';
      try {
        const res = await fetch('/api/seasons?group=' + encodeURIComponent(group));
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          seaSel.innerHTML = list.map(s => '<option value="' + s + '">' + s + '</option>').join('');
          seaSel.value = list[0];
        } else {
          seaSel.innerHTML = '<option value="Cream02">Cream02</option>';
        }
      } catch {
        seaSel.innerHTML = '<option value="Cream02">Cream02</option>';
      }
    }

    document.getElementById('group').addEventListener('change', async (e) => {
      await populateSeasons(e.target.value);
      await loadSeries();
    });

    document.getElementById('season').addEventListener('change', loadSeries);
    document.getElementById('collectionSeries').addEventListener('change', onSeriesChange);
    document.getElementById('member').addEventListener('change', updatePreview);
    document.getElementById('format').addEventListener('change', updatePreview);
    document.getElementById('btnRefresh').addEventListener('click', updatePreview);

    document.getElementById('btnDownload').addEventListener('click', async () => {
      const btn = document.getElementById('btnDownload');
      const status = document.getElementById('downloadStatus');
      const mode = btn.dataset.mode;
      const url = btn.dataset.url;
      const filename = btn.dataset.filename;
      if (!url) return;

      if (mode === 'single') {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        return;
      }

      const originalText = btn.textContent;
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.textContent = 'Generating cards...';
      status.textContent = 'Generating ' + (activeSeries?.totalMembers || '') + ' cards with Skia & creating ZIP...';

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Batch generation failed: ' + res.statusText);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
        status.textContent = 'Download complete! (' + filename + ')';
        setTimeout(() => { status.textContent = ''; }, 4000);
      } catch (err) {
        alert('Batch download error: ' + err.message);
        status.textContent = 'Error during download.';
      } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.textContent = originalText;
      }
    });

    // Initial load
    (async () => {
      await populateSeasons('tripleS');
      await loadSeries();
    })();
  </script>
</body>
</html>`;

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

    // 1. Interactive Web Playground
    if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/api' || url.pathname === '/api/index') {
      return new Response(htmlPlayground, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // 2. Seasons List API: /api/seasons (sorted newest release first)
    if (url.pathname === '/api/seasons') {
      const group = url.searchParams.get('group') || 'tripleS';
      try {
        const seasons = await getSeasonsList(group);
        return new Response(JSON.stringify(seasons), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Seasons failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. Series List API: /api/series (sorted newest release first)
    if (url.pathname === '/api/series') {
      const group = url.searchParams.get('group') || 'tripleS';
      const season = url.searchParams.get('season') || undefined;

      try {
        const seriesList = await getSeriesList({ group, season });
        const summary = seriesList.map((s) => ({
          number: s.collectionNo,
          season: s.season,
          className: s.className,
          totalMembers: s.totalMembers,
        }));

        return new Response(JSON.stringify(summary), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Series failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. Collection Info API: /api/collections
    if (url.pathname === '/api/collections') {
      const group = url.searchParams.get('group') || 'tripleS';
      const season = url.searchParams.get('season') || 'Cream02';
      const number = url.searchParams.get('number') || url.searchParams.get('collectionNo') || '372Z';

      try {
        const series = await getCollectionSeries(group, season, number);
        if (!series) {
          return new Response(JSON.stringify({ error: 'Collection series not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(series), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Collection failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. Direct Single Generator API: /api/generate
    if (url.pathname === '/api/generate' || url.pathname === '/generate') {
      const explicitGroup = url.searchParams.get('group') || undefined;
      const member = url.searchParams.get('member') || 'SeoAh';
      const group = detectGroup(member, explicitGroup);

      const season = url.searchParams.get('season') || undefined;
      const className = url.searchParams.get('class') || url.searchParams.get('className') || undefined;
      const collectionNo = url.searchParams.get('number') || url.searchParams.get('collectionNo') || '';
      const format = (url.searchParams.get('format') || 'webp').toLowerCase() as OutputFormat;
      const quality = Number(url.searchParams.get('quality') || '88');
      const backgroundColor = url.searchParams.get('bg') || undefined;
      const textColor = url.searchParams.get('text') || undefined;

      try {
        const generateBackImage = await getGenerateBackImage();
        const result = await generateBackImage(
          {
            member,
            group,
            season,
            className,
            collectionNo,
            backgroundColor,
            textColor,
          },
          { format, quality }
        );

        return new Response(result.buffer, {
          headers: {
            'Content-Type': result.mimeType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Objekt-Group': group,
            'X-Objekt-Member': member,
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Render failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 5. Collection Batch Generator API: /api/batch
    if (url.pathname === '/api/batch' || url.pathname === '/batch') {
      const explicitGroup = url.searchParams.get('group') || 'tripleS';
      const season = url.searchParams.get('season') || 'Cream02';
      const collectionNo = url.searchParams.get('number') || url.searchParams.get('collectionNo') || '372Z';
      const format = (url.searchParams.get('format') || 'webp').toLowerCase() as OutputFormat;
      const quality = Number(url.searchParams.get('quality') || '88');
      const customBg = url.searchParams.get('bg') || undefined;
      const customText = url.searchParams.get('text') || undefined;

      try {
        const series = await getCollectionSeries(explicitGroup, season, collectionNo);
        const group = series?.group || detectGroup(undefined, explicitGroup);
        const className = series?.className || url.searchParams.get('class') || 'Double';

        let membersToRender: Array<{ member: string; bg?: string; text?: string }> = [];

        if (series && series.members.length > 0) {
          membersToRender = series.members.map((m) => ({
            member: m.member,
            bg: customBg || m.backgroundColor,
            text: customText || m.textColor,
          }));
        } else {
          const signMembers = Object.entries(MEMBER_SIGNS)
            .filter(([_, info]) => info.group === group)
            .map(([name]) => name);
          membersToRender = signMembers.map((m) => ({ member: m, bg: customBg, text: customText }));
        }

        const generateBackImage = await getGenerateBackImage();
        const cards = await Promise.all(
          membersToRender.map((m) =>
            generateBackImage(
              {
                member: m.member,
                group,
                season,
                className,
                collectionNo,
                backgroundColor: m.bg,
                textColor: m.text,
              },
              { format, quality }
            )
          )
        );

        const zip = new JSZip();
        for (let i = 0; i < membersToRender.length; i++) {
          const m = membersToRender[i].member;
          const filename = `${String(i + 1).padStart(2, '0')}-${m}.${format}`;
          zip.file(filename, cards[i].buffer);
        }

        const zipBuffer = await zip.generateAsync({
          type: 'uint8array',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        const zipFilename = `${group}-${season}-${className}-${collectionNo}-${membersToRender.length}cards.zip`;

        return new Response(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipFilename}"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Objekt-Group': group,
            'X-Card-Count': String(membersToRender.length),
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Batch render failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 6. Health Check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', uptime: process.uptime() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
}

// Start local HTTP server if executed directly in Bun runtime
if (typeof Bun !== 'undefined' && (import.meta as any).main) {
  console.log(`\n🎴 Objekt Back Image Server starting on http://localhost:${PORT}...\n`);
  Bun.serve({
    port: PORT,
    fetch: handleRequest,
  });
}
