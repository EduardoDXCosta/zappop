export function normalizePhone(raw: string): string {
  if (typeof raw !== 'string') {
    throw new TypeError('normalizePhone: input must be a string');
  }
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/\D+/g, '');
  if (digits.length === 0) {
    throw new Error('normalizePhone: no digits found');
  }

  if (hasPlus) {
    return `+${digits}`;
  }

  // Why: Brazilian mobile/landline numbers are 10 or 11 digits (DDD + number).
  // Without an explicit country code, default to +55.
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function phoneToE164(raw: string): string {
  return normalizePhone(raw);
}

export function phoneFromWhatsAppJid(jid: string): string {
  if (typeof jid !== 'string') {
    throw new TypeError('phoneFromWhatsAppJid: input must be a string');
  }
  if (jid.endsWith('@g.us')) {
    throw new Error('phoneFromWhatsAppJid: group JIDs have no phone number');
  }
  const at = jid.indexOf('@');
  const raw = at === -1 ? jid : jid.slice(0, at);
  const digits = raw.replace(/\D+/g, '');
  if (digits.length === 0) {
    throw new Error('phoneFromWhatsAppJid: no digits found in JID');
  }
  return `+${digits}`;
}
