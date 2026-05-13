'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

// org_id from sessionStorage (set by Sidebar on login)
function getOrgId() { return sessionStorage.getItem('org_id') || '' }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!

type ConnectedAccount = {
  id: string
  channel: string
  display_name: string
  page_name?: string
  ig_username?: string
  phone_number?: string
  status: string
  created_at: string
}

type WAInstance = {
  id: string
  instance_name: string
  display_name: string
  phone_number?: string
  status: string
  profile_name?: string
}

const CHANNEL_META = {
  whatsapp: { label: 'WhatsApp Business API', icon: '💬', color: '#25d366', bg: 'rgba(37,211,102,.1)' },
  instagram: { label: 'Instagram Direct', icon: '📸', color: '#e1306c', bg: 'rgba(225,48,108,.1)' },
  facebook: { label: 'Facebook Messenger', icon: '👍', color: '#1877f2', bg: 'rgba(24,119,242,.1)' },
}

export default function IntegrationsPage() {
  const [metaAccounts, setMetaAccounts] = useState<ConnectedAccount[]>([])
  const [waInstances, setWaInstances] = useState<WAInstance[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const orgId = getOrgId()
    setLoading(true)
    const [metaRes, waRes] = await Promise.all([
      supabase.from('meta_connected_accounts').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
      supabase.from('whatsapp_instances').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
    ])
    setMetaAccounts(metaRes.data ?? [])
    setWaInstances(waRes.data ?? [])
    setLoading(false)
  }

  async function startMetaOAuth(channel: string) {
    const orgId = getOrgId()
    const res = await fetch(`${SUPABASE_URL}/functions/v1/meta-oauth-start?channel=${channel}&org_id=${orgId}`)
    const data = await res.json()
    if (!data.auth_url) return alert('Erro ao gerar URL de autorizacao')
    const w = 600, h = 700
    const popup = window.open(data.auth_url, 'MetaOAuth', `width=${w},height=${h},left=${(screen.width-w)/2},top=${(screen.height-h)/2}`)
    const check = setInterval(() => {
      if (popup?.closed) { clearInterval(check); loadData() }
    }, 800)
  }

  async function createEvolutionInstance(name: string) {
    const orgId = getOrgId()
    const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-instance?action=create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: orgId, display_name: name }),
    })
    await res.json()
    loadData()
  }

  async function disconnect(id: string) {
    await supabase.from('meta_connected_accounts').update({ status: 'revoked' }).eq('id', id)
    loadData()
  }

  const grouped = ['whatsapp', 'instagram', 'facebook'].map(ch => ({
    channel: ch,
    accounts: metaAccounts.filter(a => a.channel === ch),
  }))

  const s: Record<string, React.CSSProperties> = {
    page: { flex: 1, overflow: 'auto', padding: 20 },
    hd: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0, fontFamily: 'Sora, sans-serif' },
    sub: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
    secTi: { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 12 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12, marginBottom: 24 },
    card: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 },
    btn: { padding: '7px 14px', background: 'transparent', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 5 },
  }

  return (
    <div style={s.page}>
      <div style={s.hd}>
        <div>
          <h1 style={s.title}>Integracoes</h1>
          <p style={s.sub}>Conecte canais Meta e WhatsApp via Evolution API</p>
        </div>
      </div>

      <div style={s.secTi}>Canais Meta (WhatsApp API oficial · Instagram · Messenger)</div>
      <div style={s.grid}>
        {grouped.map(({ channel, accounts }) => {
          const meta = CHANNEL_META[channel as keyof typeof CHANNEL_META]
          return (
            <div key={channel} style={{ ...s.card, borderColor: accounts.length > 0 ? meta.color + '40' : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{meta.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: accounts.length > 0 ? meta.color : 'var(--text-3)', marginTop: 1 }}>
                    {accounts.length > 0 ? accounts.length + ' conta(s) conectada(s)' : 'Nao conectado'}
                  </div>
                </div>
              </div>
              {accounts.map(acc => (
                <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-3)', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.display_name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{acc.phone_number ?? acc.ig_username ?? acc.page_name ?? ''}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(34,197,94,.15)', color: 'var(--green)' }}>Ativo</span>
                  <button onClick={() => disconnect(acc.id)} style={{ ...s.btn, padding: '3px 8px', fontSize: 10.5, color: 'var(--red)', borderColor: 'rgba(239,68,68,.3)' }}>X</button>
                </div>
              ))}
              <button onClick={() => startMetaOAuth(channel)} style={{ ...s.btn, width: '100%', justifyContent: 'center', background: meta.bg, borderColor: meta.color + '40', color: meta.color, marginTop: 4 }}>
                + Conectar {meta.label}
              </button>
            </div>
          )
        })}
      </div>

      <div style={s.secTi}>WhatsApp via Evolution API (sem API oficial)</div>
      <div style={s.grid}>
        {waInstances.map(inst => (
          <div key={inst.id} style={{ ...s.card, borderColor: inst.status === 'connected' ? 'rgba(34,197,94,.25)' : inst.status === 'qr_code' ? 'rgba(245,158,11,.25)' : 'rgba(239,68,68,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(37,211,102,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{inst.display_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{inst.phone_number ?? 'Aguardando conexao'}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: inst.status === 'connected' ? 'rgba(34,197,94,.15)' : inst.status === 'qr_code' ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.1)',
                color: inst.status === 'connected' ? 'var(--green)' : inst.status === 'qr_code' ? 'var(--amber)' : 'var(--red)',
              }}>
                {inst.status === 'connected' ? 'Online' : inst.status === 'qr_code' ? 'QR Code' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10 }}>{inst.instance_name}</div>
          </div>
        ))}

        <div
          style={{ ...s.card, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8, cursor: 'pointer', minHeight: 160 }}
          onClick={async () => {
            const name = prompt('Nome do canal (ex: Suporte, Vendas, Financeiro)')
            if (name) await createEvolutionInstance(name)
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-2)' }}>Adicionar numero</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>Conecte via Evolution API (QR Code)</div>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, padding: 20 }}>Carregando integracoes...</div>}
    </div>
  )
}
