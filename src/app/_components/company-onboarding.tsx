'use client';

import { FormEvent, useState, useTransition } from 'react';
import { ConnectTenant, EvolutionConnectPanel } from './evolution-connect-panel';

interface CompanyOnboardingProps {
  initialTenant: ConnectTenant | null;
}

interface TenantCreateResponse {
  tenant: ConnectTenant;
}

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'Hipercard'];
const VOUCHER_BRANDS = ['Alelo', 'Sodexo', 'VR', 'Ticket'];
const WEEKDAYS = [
  { dayOfWeek: 1, label: 'Segunda' },
  { dayOfWeek: 2, label: 'Terça' },
  { dayOfWeek: 3, label: 'Quarta' },
  { dayOfWeek: 4, label: 'Quinta' },
  { dayOfWeek: 5, label: 'Sexta' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 0, label: 'Domingo' },
];

type HoursFormRow = {
  dayOfWeek: number;
  enabled: boolean;
  opensAt: string;
  closesAt: string;
};

export function CompanyOnboarding({ initialTenant }: CompanyOnboardingProps) {
  const [tenant, setTenant] = useState<ConnectTenant | null>(initialTenant);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    cnpj: '',
    logoUrl: '',
    whatsappCustomerNumber: '',
    whatsappAdminNumber: '',
    addrStreet: '',
    addrNumber: '',
    addrNeighborhood: '',
    addrZip: '',
    addrCity: '',
    addrState: '',
    deliveryEnabled: true,
    deliveryFee: '0',
    deliveryFarNeighborhoods: false,
    deliveryNeighborhoods: '',
    waitingTimeMinutes: '30',
    acceptsCard: true,
    cardBrands: ['Visa', 'Mastercard'],
    acceptsVoucher: false,
    voucherBrands: [] as string[],
    issuesNfCpf: false,
    pixKey: '',
    hours: WEEKDAYS.map<HoursFormRow>((item, index) => ({
      dayOfWeek: item.dayOfWeek,
      enabled: index < 6,
      opensAt: '11:00',
      closesAt: '22:00',
    })),
  });

  function toggleArrayValue(field: 'cardBrands' | 'voucherBrands', value: string) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  }

  function updateHour(dayOfWeek: number, patch: Partial<HoursFormRow>) {
    setForm((current) => ({
      ...current,
      hours: current.hours.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, ...patch } : item
      ),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch('/api/onboarding/tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            deliveryFee: Number(form.deliveryFee),
            waitingTimeMinutes: Number(form.waitingTimeMinutes),
            deliveryNeighborhoods: form.deliveryNeighborhoods
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            hours: form.hours
              .filter((item) => item.enabled)
              .map((item) => ({
                dayOfWeek: item.dayOfWeek,
                opensAt: item.opensAt,
                closesAt: item.closesAt,
              })),
          }),
        });

        const payload = (await res.json()) as TenantCreateResponse | { error: string };

        if (!res.ok) {
          throw new Error('error' in payload ? payload.error : 'Falha ao cadastrar restaurante');
        }

        setTenant((payload as TenantCreateResponse).tenant);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  if (tenant) {
    return <EvolutionConnectPanel tenant={tenant} />;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,_rgba(255,196,89,0.24),_transparent_26%),linear-gradient(160deg,rgba(16,18,27,0.94),rgba(8,10,16,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] opacity-60" />
      <div className="relative grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/75">
              Etapa 1 · Cadastro da empresa
            </p>
            <h1 className="font-[family:var(--font-display)] text-4xl leading-none text-white sm:text-5xl">
              Primeiro vamos cadastrar o restaurante.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Preencha os dados principais da empresa. Depois disso, o sistema abre automaticamente
              a etapa para conectar o WhatsApp por QR Code.
            </p>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-5 text-sm text-slate-200 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Fluxo do cliente</p>
              <p className="mt-2">1. Cadastrar a empresa</p>
              <p>2. Revisar pagamento, entrega e horário</p>
              <p>3. Gerar o QR Code do WhatsApp</p>
            </div>
            <div className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
              Você não precisa preencher nada técnico. O nome interno da instância será criado automaticamente.
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-black/20 p-5 backdrop-blur"
        >
          {error ? (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Nome completo do restaurante
              </span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex: ZapFood Centro" className="h-12 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-amber-300/45 focus:bg-white/12" required />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">CPF</span>
              <input value={form.cpf} onChange={(event) => setForm({ ...form, cpf: event.target.value })} placeholder="000.000.000-00" className="h-12 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-amber-300/45 focus:bg-white/12" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">CNPJ</span>
              <input value={form.cnpj} onChange={(event) => setForm({ ...form, cnpj: event.target.value })} placeholder="00.000.000/0001-00" className="h-12 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-amber-300/45 focus:bg-white/12" />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Logotipo (URL)</span>
              <input value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} placeholder="https://.../logo.png" className="h-12 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-amber-300/45 focus:bg-white/12" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">WhatsApp do atendimento</span>
              <input value={form.whatsappCustomerNumber} onChange={(event) => setForm({ ...form, whatsappCustomerNumber: event.target.value })} placeholder="5511999999999" className="h-12 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-amber-300/45 focus:bg-white/12" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">WhatsApp do dono</span>
              <input value={form.whatsappAdminNumber} onChange={(event) => setForm({ ...form, whatsappAdminNumber: event.target.value })} placeholder="5511988888888" className="h-12 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-amber-300/45 focus:bg-white/12" />
            </label>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-4 sm:grid-cols-2">
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Endereço de retirada · Rua</span>
              <input value={form.addrStreet} onChange={(event) => setForm({ ...form, addrStreet: event.target.value })} placeholder="Rua Principal" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Número</span>
              <input value={form.addrNumber} onChange={(event) => setForm({ ...form, addrNumber: event.target.value })} placeholder="123" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bairro</span>
              <input value={form.addrNeighborhood} onChange={(event) => setForm({ ...form, addrNeighborhood: event.target.value })} placeholder="Centro" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">CEP</span>
              <input value={form.addrZip} onChange={(event) => setForm({ ...form, addrZip: event.target.value })} placeholder="00000-000" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Cidade</span>
              <input value={form.addrCity} onChange={(event) => setForm({ ...form, addrCity: event.target.value })} placeholder="São Paulo" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Estado</span>
              <input value={form.addrState} onChange={(event) => setForm({ ...form, addrState: event.target.value })} placeholder="SP" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
            </label>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Formas de pagamento</p>
                <p className="text-sm text-slate-400">Configure cartão, vale, nota fiscal e chave PIX.</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Aceita cartão</p>
                <p className="text-xs text-slate-400">Marque as bandeiras aceitas.</p>
              </div>
              <button type="button" onClick={() => setForm((current) => ({ ...current, acceptsCard: !current.acceptsCard }))} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${form.acceptsCard ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white'}`}>
                {form.acceptsCard ? 'Sim' : 'Não'}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {CARD_BRANDS.map((brand) => {
                const selected = form.cardBrands.includes(brand);
                return (
                  <button key={brand} type="button" disabled={!form.acceptsCard} onClick={() => toggleArrayValue('cardBrands', brand)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${selected ? 'bg-amber-300 text-zinc-950' : 'bg-black/20 text-slate-300'} disabled:cursor-not-allowed disabled:opacity-50`}>
                    {brand}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Aceita vale alimentação</p>
                <p className="text-xs text-slate-400">Marque as bandeiras de vale.</p>
              </div>
              <button type="button" onClick={() => setForm((current) => ({ ...current, acceptsVoucher: !current.acceptsVoucher }))} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${form.acceptsVoucher ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white'}`}>
                {form.acceptsVoucher ? 'Sim' : 'Não'}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {VOUCHER_BRANDS.map((brand) => {
                const selected = form.voucherBrands.includes(brand);
                return (
                  <button key={brand} type="button" disabled={!form.acceptsVoucher} onClick={() => toggleArrayValue('voucherBrands', brand)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${selected ? 'bg-amber-300 text-zinc-950' : 'bg-black/20 text-slate-300'} disabled:cursor-not-allowed disabled:opacity-50`}>
                    {brand}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Nota fiscal com CPF</p>
                </div>
                <button type="button" onClick={() => setForm((current) => ({ ...current, issuesNfCpf: !current.issuesNfCpf }))} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${form.issuesNfCpf ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white'}`}>
                  {form.issuesNfCpf ? 'Sim' : 'Não'}
                </button>
              </div>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Chave PIX</span>
                <input value={form.pixKey} onChange={(event) => setForm({ ...form, pixKey: event.target.value })} placeholder="CPF, e-mail ou chave aleatória" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Entrega e frete</p>
                <p className="text-sm text-slate-400">Defina taxa, bairros e se entrega regiões mais distantes.</p>
              </div>
              <button type="button" onClick={() => setForm((current) => ({ ...current, deliveryEnabled: !current.deliveryEnabled }))} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${form.deliveryEnabled ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white'}`}>
                {form.deliveryEnabled ? 'Entrega ativada' : 'Só retirada'}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Valor do frete</span>
                <input type="number" min="0" step="0.01" value={form.deliveryFee} onChange={(event) => setForm({ ...form, deliveryFee: event.target.value })} className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Tempo de preparo</span>
                <input type="number" min="5" value={form.waitingTimeMinutes} onChange={(event) => setForm({ ...form, waitingTimeMinutes: event.target.value })} className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bairros atendidos</span>
                <input value={form.deliveryNeighborhoods} onChange={(event) => setForm({ ...form, deliveryNeighborhoods: event.target.value })} placeholder="Centro, Jardim América, Vila Nova" className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-amber-300/45" />
              </label>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-semibold text-white">Entrega em bairros mais distantes</p>
                </div>
                <button type="button" onClick={() => setForm((current) => ({ ...current, deliveryFarNeighborhoods: !current.deliveryFarNeighborhoods }))} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${form.deliveryFarNeighborhoods ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white'}`}>
                  {form.deliveryFarNeighborhoods ? 'Sim' : 'Não'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
            <div>
              <p className="text-sm font-semibold text-white">Horário de funcionamento</p>
              <p className="text-sm text-slate-400">Marque os dias em que abre e informe o horário.</p>
            </div>
            <div className="grid gap-3">
              {WEEKDAYS.map((day) => {
                const row = form.hours.find((item) => item.dayOfWeek === day.dayOfWeek)!;
                return (
                  <div key={day.dayOfWeek} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[0.9fr_0.45fr_0.45fr] sm:items-center">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-white">{day.label}</span>
                      <button type="button" onClick={() => updateHour(day.dayOfWeek, { enabled: !row.enabled })} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${row.enabled ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white'}`}>
                        {row.enabled ? 'Abre' : 'Fechado'}
                      </button>
                    </div>
                    <input type="time" value={row.opensAt} disabled={!row.enabled} onChange={(event) => updateHour(day.dayOfWeek, { opensAt: event.target.value })} className="h-11 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none disabled:opacity-40" />
                    <input type="time" value={row.closesAt} disabled={!row.enabled} onChange={(event) => updateHour(day.dayOfWeek, { closesAt: event.target.value })} className="h-11 rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none disabled:opacity-40" />
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={isPending} className="rounded-2xl bg-amber-300 px-6 py-4 text-base font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? 'Salvando cadastro...' : 'Continuar para conectar WhatsApp'}
          </button>
        </form>
      </div>
    </section>
  );
}
