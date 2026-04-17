import type {
  EvolutionIncomingMessage,
  EvolutionParsedEvent,
  EvolutionRawEvent,
} from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function coerceRaw(raw: unknown): EvolutionRawEvent {
  if (!isRecord(raw)) return {};
  const event = asString(raw.event) ?? undefined;
  const instance = asString(raw.instance) ?? undefined;
  return { event, instance, data: raw.data };
}

function extractText(message: unknown): string | null {
  if (!isRecord(message)) return null;
  const conversation = asString(message.conversation);
  if (conversation) return conversation;
  const extended = message.extendedTextMessage;
  if (isRecord(extended)) {
    const text = asString(extended.text);
    if (text) return text;
  }
  return null;
}

// Why: Evolution sends JIDs like '5511999999999@s.whatsapp.net'; we normalize to E.164.
function normalizePhone(remoteJid: string): string {
  const digits = remoteJid.split('@')[0]?.replace(/[^\d]/g, '') ?? '';
  return `+${digits}`;
}

function ignored(reason: string, raw: EvolutionRawEvent): EvolutionParsedEvent {
  return { event: 'ignored', reason, raw };
}

export function parseEvolutionEvent(raw: unknown): EvolutionParsedEvent {
  const evt = coerceRaw(raw);

  if (evt.event !== 'messages.upsert') {
    return ignored('non-message event', evt);
  }

  if (!isRecord(evt.data)) {
    return ignored('missing data payload', evt);
  }

  const data = evt.data;
  const key = data.key;
  if (!isRecord(key)) {
    return ignored('missing message key', evt);
  }

  const fromMe = key.fromMe === true;
  if (fromMe) {
    return ignored('own outgoing message', evt);
  }

  const remoteJid = asString(key.remoteJid);
  if (!remoteJid) {
    return ignored('missing remoteJid', evt);
  }

  // Why: group chats (@g.us) are out of scope for the 1:1 attendant in FASE 2.
  if (remoteJid.endsWith('@g.us')) {
    return ignored('group message', evt);
  }

  const messageId = asString(key.id);
  if (!messageId) {
    return ignored('missing message id', evt);
  }

  const text = extractText(data.message);
  if (!text) {
    return ignored('non-text message', evt);
  }

  const instance = evt.instance;
  if (!instance) {
    return ignored('missing instance', evt);
  }

  const pushName = asString(data.pushName);
  const timestamp = asNumber(data.messageTimestamp) ?? Math.floor(Date.now() / 1000);

  const result: EvolutionIncomingMessage = {
    event: 'messages.upsert',
    instance,
    messageId,
    fromMe: false,
    remoteJid,
    phoneE164: normalizePhone(remoteJid),
    pushName,
    text,
    timestamp,
  };
  return result;
}
