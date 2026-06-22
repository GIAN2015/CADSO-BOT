const cheerio = require('cheerio');

const REFERENCE_URLS = [
  'https://help.solidworks.com/2024/spanish/Installation/install_guide/c_introduction.htm',
  'https://help.solidworks.com/2024/spanish/Installation/install_guide/r_system_requirements.htm',
  'https://help.solidworks.com/2024/spanish/Installation/install_guide/c_installing_individual.htm',
  'https://help.solidworks.com/2024/spanish/Installation/install_guide/r_installation_error_1603.htm',
  'https://help.solidworks.com/2024/spanish/Installation/install_guide/c_license_activation.htm',
];

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

async function fetchPage(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.text;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CADSO-Bot/1.0' },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    $('script, style, nav, header, footer, iframe, noscript').remove();

    const text = $('main, article, .content, #content, body')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    if (text.length > 50) {
      cache.set(url, { text, time: Date.now() });
      return text;
    }
    return null;
  } catch {
    return null;
  }
}

async function searchDocs(query) {
  const results = await Promise.allSettled(
    REFERENCE_URLS.map(url => fetchPage(url))
  );

  const pages = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  if (pages.length === 0) return null;

  const queryWords = query.toLowerCase().split(/\s+/);
  const scored = pages
    .map(text => {
      const lower = text.toLowerCase();
      const score = queryWords.filter(w => lower.includes(w)).length;
      return { text, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

  const relevant = scored.slice(0, 2).map(p => p.text);
  return relevant.length > 0 ? relevant.join('\n\n---\n\n') : pages[0];
}

module.exports = { searchDocs, REFERENCE_URLS };
