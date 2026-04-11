export type EvolutionEventType =
  | 'messages.upsert'
  | 'messages.update'
  | 'connection.update'
  | 'qrcode.updated'
  | 'send.message'
  | 'unknown';

export interface EvolutionRawEvent {
  event?: string;
  instance?: string;
  data?: unknown;
}

export interface EvolutionIncomingMessage {
  event: 'messages.upsert';
  instance: string;
  messageId: string;
  fromMe: boolean;
  remoteJid: string;
  phoneE164: string;
  pushName: string | null;
  text: string;
  timestamp: number;
}

export type EvolutionParsedEvent =
  | EvolutionIncomingMessage
  | { event: 'ignored'; reason: string; raw: EvolutionRawEvent };
