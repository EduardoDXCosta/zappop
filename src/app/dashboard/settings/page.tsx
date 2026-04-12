import { getSessionContext } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardSettingsPage() {
  const session = await getSessionContext();
  const tenant = session.tenant;

  if (!tenant) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family:var(--font-display)] text-3xl text-white">
          Configuracoes
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Ajuste as configuracoes do seu restaurante.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Info basica */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Informacoes do Restaurante
          </h2>
          <div className="space-y-3">
            <InfoRow label="Nome" value={tenant.name} />
            <InfoRow label="CPF" value={tenant.cpf ?? '---'} />
            <InfoRow label="CNPJ" value={tenant.cnpj ?? '---'} />
            <InfoRow label="WhatsApp Atendimento" value={tenant.whatsappCustomerNumber ?? '---'} />
            <InfoRow label="WhatsApp Dono" value={tenant.whatsappAdminNumber ?? '---'} />
          </div>
        </section>

        {/* Endereco */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Endereco
          </h2>
          <div className="space-y-3">
            <InfoRow
              label="Logradouro"
              value={
                [tenant.addrStreet, tenant.addrNumber]
                  .filter(Boolean)
                  .join(', ') || '---'
              }
            />
            <InfoRow label="Bairro" value={tenant.addrNeighborhood ?? '---'} />
            <InfoRow label="CEP" value={tenant.addrZip ?? '---'} />
            <InfoRow
              label="Cidade/UF"
              value={
                [tenant.addrCity, tenant.addrState].filter(Boolean).join(' - ') ||
                '---'
              }
            />
          </div>
        </section>

        {/* Entrega */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Entrega
          </h2>
          <div className="space-y-3">
            <InfoRow
              label="Tipo"
              value={tenant.deliveryEnabled ? 'Delivery + Retirada' : 'Somente retirada'}
            />
            <InfoRow
              label="Taxa"
              value={`R$ ${tenant.deliveryFee.toFixed(2).replace('.', ',')}`}
            />
            <InfoRow
              label="Tempo de preparo"
              value={`${tenant.waitingTimeMinutes} minutos`}
            />
            {tenant.deliveryNeighborhoods.length > 0 && (
              <InfoRow
                label="Bairros"
                value={tenant.deliveryNeighborhoods.join(', ')}
              />
            )}
          </div>
        </section>

        {/* Pagamento */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Pagamento
          </h2>
          <div className="space-y-3">
            <InfoRow label="PIX" value={tenant.pixKey ?? 'Nao configurado'} />
            <InfoRow
              label="Cartao"
              value={
                tenant.acceptsCard
                  ? tenant.cardBrands.join(', ')
                  : 'Nao aceita'
              }
            />
            <InfoRow
              label="Vale"
              value={
                tenant.acceptsVoucher
                  ? tenant.voucherBrands.join(', ')
                  : 'Nao aceita'
              }
            />
            <InfoRow
              label="NF com CPF"
              value={tenant.issuesNfCpf ? 'Sim' : 'Nao'}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-medium truncate max-w-[200px]">{value}</span>
    </div>
  );
}
