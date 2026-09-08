import { createHash } from 'node:crypto';
import { ResultCache, WindowLimit } from './limits.js';

export function registerTranslation(app, { key, budget, fetch }) {
  const cache = new ResultCache(200, 86400000);
  const rate = new WindowLimit(3, 60000);
  app.post('/music/translate', { bodyLimit: 32000 }, async (req, reply) => {
    if (!key) return reply.code(503).send({ error: 'Translation is not configured' });
    const { lines, target } = req.body || {};
    if (!Array.isArray(lines) || !lines.length || lines.length > 200 || lines.some(line => typeof line !== 'string' || line.length > 1000) || typeof target !== 'string' || !/^[a-z]{2,3}(?:-[a-zA-Z]{2,4})?$/.test(target)) return reply.code(400).send({ error: 'Invalid translation request' });
    const characters = lines.reduce((sum, line) => sum + [...line].length, 0);
    if (characters > 10000) return reply.code(400).send({ error: 'Lyrics exceed 10,000 characters' });
    const hash = createHash('sha256').update(JSON.stringify([target, lines])).digest('hex');
    return cache.get(hash, async () => {
      rate.take(req.ip);
      budget.reserve(req.ip, characters);
      const nonempty = lines.map((text, index) => ({ text, index })).filter(line => line.text.trim());
      const translated = lines.map(() => '');
      const languages = [];
      for (let offset = 0; offset < nonempty.length; offset += 128) {
        const batch = nonempty.slice(offset, offset + 128);
        const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
          body: JSON.stringify({ q: batch.map(line => line.text), target, format: 'text', model: 'nmt' }),
          signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) throw Object.assign(new Error('Translation provider unavailable'), { statusCode: response.status === 429 ? 429 : 502 });
        const rows = (await response.json()).data?.translations;
        if (!Array.isArray(rows) || rows.length !== batch.length || rows.some(row => typeof row.translatedText !== 'string')) throw Object.assign(new Error('Invalid translation response'), { statusCode: 502 });
        rows.forEach((row, index) => {
          translated[batch[index].index] = row.translatedText;
          languages.push(row.detectedSourceLanguage);
        });
      }
      return { lines: translated, target, sourceLanguage: languages.find(Boolean) || 'unknown', sameLanguage: languages.length > 0 && languages.every(language => language === target) };
    });
  });
}
