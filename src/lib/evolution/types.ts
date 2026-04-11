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

export interface EvolutionInstanceSummary {
  instanceName: string;
  instanceId: string | null;
  owner: string | null;
  profileName: string | null;
  profilePictureUrl: string | null;
  profileStatus: string | null;
  status: string | null;
  serverUrl: string | null;
}

export interface EvolutionConnectionState {
  instanceName: string;
  state: string | null;
}

export interface EvolutionQrPayload {
  pairingCode: string | null;
  code: string | null;
  count: number | null;
}

export interface EvolutionWebhookConfig {
  enabled: boolean;
  url: string | null;
  events: string[];
}
