import fs from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

export function limitValue(value, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const number = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid quota configuration');
  return Math.min(number, maximum);
}

export function limited(message = 'Request limit reached', retryAfter = 60) {
  return Object.assign(new Error(message), { statusCode: 429, status: 429, retryAfter });
}

export class WindowLimit {
  constructor(max, windowMs, capacity = 5000) {
    Object.assign(this, { max, windowMs, capacity, entries: new Map() });
  }
  take(key, now = Date.now()) {
    for (const [id, entry] of this.entries) if (entry.until <= now) this.entries.delete(id);
    let entry = this.entries.get(key);
    if (!entry) {
      if (this.entries.size >= this.capacity) throw limited();
      entry = { count: 0, until: now + this.windowMs };
      this.entries.set(key, entry);
    }
    if (entry.count >= this.max) throw limited('Request limit reached', Math.ceil((entry.until - now) / 1000));
    entry.count++;
  }
}

export class Budget {
  constructor(path, { daily, monthly, perClientDaily = daily }) {
    Object.assign(this, { path, daily, monthly, perClientDaily });
  }
  reserve(client, amount = 1, now = new Date()) {
    const day = now.toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    fs.mkdirSync(dirname(this.path), { recursive: true });
    const lock = `${this.path}.lock`;
    let fd;
    try {
      fd = fs.openSync(lock, 'wx');
      let state = { month, day, monthUsed: 0, dayUsed: 0, clients: {} };
      try {
        const stored = JSON.parse(fs.readFileSync(this.path, 'utf8'));
        if (!Number.isSafeInteger(stored.monthUsed) || stored.monthUsed < 0 || !Number.isSafeInteger(stored.dayUsed) || stored.dayUsed < 0 || !stored.clients || typeof stored.clients !== 'object') throw new Error('Invalid quota ledger');
        if (stored.month === month) state = stored;
        if (state.day !== day) Object.assign(state, { day, dayUsed: 0, clients: {} });
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      const key = createHash('sha256').update(client).digest('hex');
      const used = state.clients[key] || 0;
      if (state.monthUsed + amount > this.monthly || state.dayUsed + amount > this.daily || used + amount > this.perClientDaily) throw limited('Daily or monthly allowance reached', 3600);
      state.monthUsed += amount;
      state.dayUsed += amount;
      state.clients[key] = used + amount;
      const temporary = `${this.path}.tmp`;
      fs.writeFileSync(temporary, JSON.stringify(state), { mode: 0o600, flush: true });
      fs.renameSync(temporary, this.path);
    } catch (error) {
      if (error.status === 429) throw error;
      throw Object.assign(new Error('Usage protection unavailable; requests are disabled'), { status: 503, statusCode: 503 });
    } finally {
      if (fd !== undefined) { fs.closeSync(fd); fs.unlinkSync(lock); }
    }
  }
}

export class ResultCache {
  constructor(limit = 200, ttl = 3600000) {
    Object.assign(this, { limit, ttl, values: new Map(), pending: new Map() });
  }
  async get(key, loader) {
    const hit = this.values.get(key);
    if (hit?.until > Date.now()) return hit.value;
    if (this.pending.has(key)) return this.pending.get(key);
    if (this.pending.size >= 20) throw limited('Too many active requests');
    const task = Promise.resolve().then(loader).then(value => {
      if (this.values.size >= this.limit) this.values.delete(this.values.keys().next().value);
      this.values.set(key, { value, until: Date.now() + this.ttl });
      return value;
    }).finally(() => this.pending.delete(key));
    this.pending.set(key, task);
    return task;
  }
}
