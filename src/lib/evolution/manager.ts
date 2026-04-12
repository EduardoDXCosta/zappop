import {
  EvolutionConnectionState,
  EvolutionInstanceSummary,
  EvolutionQrPayload,
  EvolutionWebhookConfig,
} from './types';

const DEFAULT_WEBHOOK_EVENTS = [
  'MESSAGES_UPSERT',
  'QRCODE_UPDATED',
  'CONNECTION_UPDATE',
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function normalizeBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/manager$/i, '');
}

function getAdminConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'Evolution admin credentials missing. Set EVOLUTION_API_URL and EVOLUTION_API_KEY in .env.local'
    );
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    apiKey,
  };
}

async function evolutionAdminFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { baseUrl, apiKey } = getAdminConfig();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(
      `Evolution admin request failed (${res.status}) ${path}: ${errorText || res.statusText}`
    );
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

function mapInstance(value: unknown): EvolutionInstanceSummary | null {
  const root = asRecord(value);
  const instance = asRecord(root?.instance) ?? root;
  if (!instance) return null;

  // Evolution API v2 usa `name`, versões anteriores usavam `instanceName`.
  const instanceName = asString(instance.instanceName) || asString(instance.name);
  if (!instanceName) return null;

  const stateStr = asString(instance.status) || asString(instance.connectionStatus);

  return {
    instanceName,
    instanceId: asString(instance.instanceId) || asString(instance.id),
    owner: asString(instance.owner) || asString(instance.ownerJid),
    profileName: asString(instance.profileName),
    profilePictureUrl: asString(instance.profilePictureUrl) || asString(instance.profilePicUrl),
    profileStatus: asString(instance.profileStatus),
    status: stateStr ? (stateStr.toLowerCase() as EvolutionConnectionState['state']) : 'close',
    serverUrl: asString(instance.serverUrl),
  };
}

function mapConnectionState(payload: unknown): EvolutionConnectionState | null {
  const root = asRecord(payload);
  const instance = asRecord(root?.instance);
  const instanceName = asString(instance?.instanceName);
  if (!instanceName) return null;

  return {
    instanceName,
    state: asString(instance?.state),
  };
}

export async function fetchInstanceByName(
  instanceName: string
): Promise<EvolutionInstanceSummary | null> {
  try {
    const payload = await evolutionAdminFetch<unknown>(
      `/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`
    );
    
    const elementsToCheck = Array.isArray(payload) 
      ? payload 
      : Array.isArray(asRecord(payload)?.response) 
        ? asRecord(payload)?.response as unknown[]
        : [payload];

    for (const item of elementsToCheck) {
      if (!item) continue;
      const mapped = mapInstance(item);
      if (mapped?.instanceName === instanceName) return mapped;
    }

    return null;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('(404)')) {
      return null;
    }
    throw error;
  }
}

export async function createInstance(input: {
  instanceName: string;
  webhookUrl: string;
}): Promise<EvolutionInstanceSummary | null> {
  try {
    await evolutionAdminFetch<unknown>('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName: input.instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        reject_call: true,
        msg_call: 'No momento não atendemos chamadas por voz.',
        groups_ignore: true,
        always_online: true,
        read_messages: true,
        read_status: true,
        syncFullHistory: false,
        webhook: {
          url: input.webhookUrl,
          enabled: true,
          webhookByEvents: false,
          base64: false,
          events: DEFAULT_WEBHOOK_EVENTS,
        },
      }),
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes('403') || err.message.includes('already in use'))) {
      console.warn(`[Evolution] Instância '${input.instanceName}' originou erro 403 "Fantasma". Usando fallback para acionar QR Code diretamente sem recriar.`);
    } else {
      throw err;
    }
  }

  const fetched = await fetchInstanceByName(input.instanceName);
  
  if (!fetched) {
    // Retorno de fallback caso ela continue dando 404 no "Fetch" mas esteja lá com status 403 no "Create"
    return {
      instanceName: input.instanceName,
      instanceId: input.instanceName,
      owner: null,
      profileName: null,
      profilePictureUrl: null,
      profileStatus: null,
      status: 'connecting',
      serverUrl: null,
    };
  }

  return fetched;
}

export async function deleteInstance(instanceName: string): Promise<void> {
  try {
    await evolutionAdminFetch<unknown>(
      `/instance/delete/${encodeURIComponent(instanceName)}`,
      { method: 'DELETE' }
    );
  } catch (e: unknown) {
    console.warn(`[Evolution] Falha ignorada ao deletar instância limpa:`, e);
  }
}

export async function connectInstance(
  instanceName: string
): Promise<EvolutionQrPayload> {
  const payload = await evolutionAdminFetch<unknown>(
    `/instance/connect/${encodeURIComponent(instanceName)}`
  );
  const root = asRecord(payload) ?? {};
  return {
    pairingCode: asString(root.pairingCode),
    code: asString(root.code),
    count: asNumber(root.count),
  };
}

export async function getConnectionState(
  instanceName: string
): Promise<EvolutionConnectionState | null> {
  try {
    const payload = await evolutionAdminFetch<unknown>(
      `/instance/connectionState/${encodeURIComponent(instanceName)}`
    );
    return mapConnectionState(payload);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('(404)')) {
      return null;
    }
    throw error;
  }
}

export async function getWebhookConfig(
  instanceName: string
): Promise<EvolutionWebhookConfig | null> {
  try {
    const payload = await evolutionAdminFetch<unknown>(
      `/webhook/find/${encodeURIComponent(instanceName)}`
    );
    const root = asRecord(payload);
    if (!root) return null;

    return {
      enabled: root.enabled === true,
      url: asString(root.url),
      events: asStringArray(root.events),
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('(404)')) {
      return null;
    }
    throw error;
  }
}

export async function setWebhook(input: {
  instanceName: string;
  webhookUrl: string;
}): Promise<EvolutionWebhookConfig | null> {
  await evolutionAdminFetch<unknown>(
    `/webhook/set/${encodeURIComponent(input.instanceName)}`,
    {
      method: 'POST',
      body: JSON.stringify({
        webhook: {
          url: input.webhookUrl,
          enabled: true,
          webhookByEvents: false,
          base64: false,
          events: DEFAULT_WEBHOOK_EVENTS,
        }
      }),
    }
  );

  return getWebhookConfig(input.instanceName);
}

export async function logoutInstance(instanceName: string): Promise<void> {
  await evolutionAdminFetch<unknown>(
    `/instance/logout/${encodeURIComponent(instanceName)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function ensureInstanceReady(input: {
  instanceName: string;
  webhookUrl: string;
}): Promise<{
  instance: EvolutionInstanceSummary;
  state: EvolutionConnectionState | null;
  webhook: EvolutionWebhookConfig | null;
}> {
  let instance = await fetchInstanceByName(input.instanceName);
  if (!instance) {
    instance = await createInstance(input);
  }
  if (!instance) {
    throw new Error('Failed to create or fetch Evolution instance');
  }

  const webhook = await setWebhook(input);
  const state = await getConnectionState(input.instanceName);

  return { instance, state, webhook };
}

