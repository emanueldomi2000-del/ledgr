// Vercel Edge Middleware — intercepts social bot scrapers on /tipster
// to serve dynamic Open Graph meta tags with real tipster data.
// Human visitors return undefined (pass-through) and hit the static rewrite normally.

const BOT_UA = /twitterbot|facebookexternalhit|facebot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|vkShare|Pinterestbot|Applebot/i;

const API  = 'https://ledgr-backend-production-c132.up.railway.app';
const SITE = 'https://getledgr.bet';
const IMG  = SITE + '/assets/logo/ledgr-logo.png';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

export async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return; // human visitor — pass through to static rewrite

  const { searchParams } = new URL(request.url);
  // Sanitise username to alphanumeric + common handle chars
  const username = (searchParams.get('u') || '').replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, 64);

  let title = username ? `@${username} — LEDGR` : 'LEDGR — Verified Tipster Profile';
  let desc  = 'Verified pick history, ROI and win rate. No deleted losses. No fake records. — getledgr.bet';

  if (username) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(`${API}/rankings/${username}`, { signal: ctrl.signal });
      clearTimeout(timer);

      if (r.ok) {
        const d     = await r.json();
        const picks = parseInt(d.totalPicks, 10) || 0;
        const roi   = d.roi     != null ? parseFloat(d.roi)                          : null;
        const wr    = d.winRate != null ? Math.round(parseFloat(d.winRate) * 100)    : null;

        title = `@${username} — LEDGR Tipster`;

        if (picks >= 20 && roi != null) {
          const roiStr = (roi >= 0 ? '+' : '') + roi.toFixed(1) + '%';
          desc = `Record verificato · ROI ${roiStr} · ${picks} pick${wr != null ? ' · Win rate ' + wr + '%' : ''} su LEDGR`;
        } else if (picks >= 10) {
          desc = `Record in costruzione · ${picks} pick verificati su LEDGR`;
        } else {
          desc = picks > 0
            ? `Record in costruzione · ${picks} pick su LEDGR`
            : 'Record in costruzione su LEDGR';
        }
      }
    } catch (_) {
      // backend timeout or error — serve generic fallback, do not crash
    }
  }

  const pageUrl = `${SITE}/tipster?u=${encodeURIComponent(username)}`;

  const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<meta property="og:title"       content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image"       content="${IMG}">
<meta property="og:url"         content="${esc(pageUrl)}">
<meta property="og:type"        content="website">
<meta property="og:site_name"   content="LEDGR">
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image"       content="${IMG}">
</head><body></body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type':  'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

export const config = {
  matcher: '/tipster',
};
