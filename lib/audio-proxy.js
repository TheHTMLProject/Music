export function validVideoId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id);
}

export function validRange(range) {
  return range === undefined || (typeof range === 'string' && /^bytes=(?:\d+-\d*|-\d+)$/.test(range));
}

export async function proxyAudio(req, reply, { resolve, fetchAudio, invalidate }) {
  const { id } = req.query;
  if (!validVideoId(id)) return reply.code(400).send({ error: 'Invalid video id' });
  if (!validRange(req.headers.range)) return reply.code(416).send({ error: 'Only a single byte range is supported' });
  const controller = new AbortController();
  const disconnect = () => controller.abort();
  req.raw.on('aborted', disconnect);
  reply.raw.on('close', disconnect);
  let response;
  let lastError;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = await resolve(id);
        if (controller.signal.aborted) return;
        response = await fetchAudio(url, req.headers.range, controller.signal);
        if ([200, 206, 416].includes(response.status)) break;
        lastError = new Error(`Audio provider returned ${response.status}`);
        response.body?.destroy();
      } catch (error) {
        lastError = error;
      }
      invalidate(id);
      if (attempt < 2) await new Promise(resolveDelay => setTimeout(resolveDelay, 150 * (attempt + 1)));
    }
    if (!response) throw lastError || new Error('Audio provider unavailable');
    if (response.status === 416) {
      if (response.headers.has('content-range')) reply.header('Content-Range', response.headers.get('content-range'));
      response.body?.destroy();
      return reply.code(416).send();
    }
    if (![200, 206].includes(response.status)) {
      response.body?.destroy();
      return reply.code(502).send({ error: 'Audio provider unavailable' });
    }
    reply.code(response.status);
    for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
      if (response.headers.has(name)) reply.header(name, response.headers.get(name));
    }
    reply.header('Cache-Control', 'private, no-store');
    return reply.send(response.body);
  } catch (error) {
    response?.body?.destroy();
    console.error(`[Audio] ${id}:`, error.message || error);
    if (!controller.signal.aborted) return reply.code(502).send({ error: 'Audio unavailable; retry this track' });
  }
}
