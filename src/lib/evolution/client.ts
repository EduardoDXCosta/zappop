export interface EvolutionClientConfig {
  baseUrl: string;
  apiKey: string;
}

export type SendTextResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

// Why: Evolution API expects the number field without the leading '+'.
function toEvolutionNumber(phoneE164: string): string {
  return phoneE164.replace(/^\+/, '').replace(/[^\d]/g, '');
}

function joinUrl(baseUrl: string, path: string): string {
  const trimmed = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}${path}`;
}

function extractMessageId(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  const record = payload as Record<string, unknown>;
  const key = record.key;
  if (typeof key === 'object' && key !== null) {
    const id = (key as Record<string, unknown>).id;
    if (typeof id === 'string') return id;
  }
  const directId = record.id;
  if (typeof directId === 'string') return directId;
  return undefined;
}

export class EvolutionClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: EvolutionClientConfig) {
    if (!config.baseUrl || !config.apiKey) {
      throw new Error('EvolutionClient: baseUrl and apiKey are required');
    }
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async sendText(
    instance: string,
    toPhoneE164: string,
    text: string,
  ): Promise<SendTextResult> {
    const url = joinUrl(this.baseUrl, `/message/sendText/${encodeURIComponent(instance)}`);
    const body = {
      number: toEvolutionNumber(toPhoneE164),
      text,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        return {
          ok: false,
          error: `Evolution sendText ${res.status}: ${errorText || res.statusText}`,
        };
      }

      const payload: unknown = await res.json().catch(() => null);
      return { ok: true, messageId: extractMessageId(payload) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: `Evolution sendText network error: ${message}` };
    }
  }

  async sendTyping(
    instance: string,
    toPhoneE164: string,
    durationMs?: number,
  ): Promise<void> {
    const url = joinUrl(this.baseUrl, `/chat/sendPresence/${encodeURIComponent(instance)}`);
    const body = {
      number: toEvolutionNumber(toPhoneE164),
      presence: 'composing',
      delay: durationMs ?? 1500,
    };

    // Why: typing indicators are best-effort UX polish; never block the caller on failure.
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify(body),
      });
    } catch {
      // swallow
    }
  }
}

export function getEvolutionClient(): EvolutionClient {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'Evolution API credentials missing. Set EVOLUTION_API_URL and EVOLUTION_API_KEY in .env.local',
    );
  }

  return new EvolutionClient({ baseUrl, apiKey });
}
