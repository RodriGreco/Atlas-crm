'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

const ORG_ID   = process.env.NEXT_PUBLIC_ORG_ID!
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const APP_ID   = process.env.NEXT_PUBLIC_META_APP_ID!

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
    // Check URL params for OAuth success
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    if (success) {
      window.history.replaceState({}, '', '/integrations/meta')
    }
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [metaRes, waRes] = await Promise.all([
      supabase.from('meta_connected_accounts').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: false }),
      supabase.from('whatsapp_instances').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: false }),
    ])
    setMetaAccounts(metaRes.data ?? [])
    setWaInstances(waRes.data ?? [])
    setLoading(false)
  }

  async function startMetaOAuth(channel: string) {
    const res = await fetch(`${SUPABASE}/functions/v1/meta-oauth-start?channel=${channel}&org_id=${ORG_ID}`)
    const data = await res.json()
    if (!data.auth_url) return alert('Erro ao gerar URL de autorização')
    const w = 600, h = 700
    const popup = window.open(data.auth_url, 'MetaOAuth', `width=${w},height=${h},left=${(screen.width-w)/2},top=${(screen.height-h)/2}`)
    const check = setInterval(() => {
      if (popup?.closed) { clearInterval(check); loadData() }
    }, 800)
  }

  async function createEvolutionInstance(name: string) {
    const res = await fetch(`${SUPABASE}/functions/v1/manage-instance?action=create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: ORG_ID, display_name: name }),
    })
    const data = await res.json()
    loadData()
    return data
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
    page:   { flex: 1, overflow: 'auto', padding: 20, background: '#080810', color: '#f0f0ff', fontFamily: 'system-ui' },
    hd:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    title:  { fontSize: 20, fontWeight: 700, color: '#f0f0ff', margin: 0, fontFamily: 'inherit' },
    sub:    { fontSize: 12, color: '#5c5c7a', marginTop: 2 },
    secTi:  { fontSize: 13, fontWeight: 600, color: '#9898b8', textTransform: 'uppercase' as const, letterSpacing: '.5px', marginBottom: 12 },
    grid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12, marginBottom: 24 },
    card:   { background: '#141422', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 16 },
    btn:    { padding: '7px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#9898b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 5 },
  }

  return (
    <div style={s.page}>
      <div style={s.hd}>
        <div>
          <h1 style={s.title}>Integrações</h1>
          <p style={s.sub}>Conecte canais Meta e WhatsApp via Evolution API</p>
        </div>
      </div>

      {/* Meta Channels */}
      <div style={s.secTi}>Canais Meta (WhatsApp API oficial · Instagram · Messenger)</div>
      <div style={s.grid}>
        {grouped.map(({ channel, accounts }) => {
          const meta = CHANNEL_META[channel as keyof typeof CHANNEL_META]
          return (
            <div key={channel} style={{ ...s.card, borderColor: accounts.length > 0 ? `${meta.color}40` : 'rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{meta.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff' }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: accounts.length > 0 ? meta.color : '#5c5c7a', marginTop: 1 }}>
                    {accounts.length > 0 ? `${accounts.length} conta(s) conectada(s)` : 'Não conectado'}
                  </div>
                </div>
              </div>

              {accounts.map(acc => (
                <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#0e0e1a', borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.display_name}</div>
                    <div style={{ fontSize: 10.5, color: '#5c5c7a' }}>{acc.phone_number ?? acc.ig_username ?? acc.page_name ?? ''}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(34,197,94,.15)', color: '#22c55e' }}>Ativo</span>
                  <button onClick={() => disconnect(acc.id)} style={{ ...s.btn, padding: '3px 8px', fontSize: 10.5, color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }}>✕</button>
                </div>
              ))}

              <button onClick={() => startMetaOAuth(channel)} style={{ ...s.btn, width: '100%', justifyContent: 'center', background: meta.bg, borderColor: `${meta.color}40`, color: meta.color, marginTop: 4 }}>
                + Conectar {meta.label}
              </button>
            </div>
          )
        })}
      </div>

      {/* Evolution Instances */}
      <div style={s.secTi}>WhatsApp via Evolution API (sem API oficial)</div>
      <div style={s.grid}>
        {waInstances.map(inst => (
          <div key={inst.id} style={{ ...s.card, borderColor: inst.status === 'connected' ? 'rgba(34,197,94,.25)' : inst.status === 'qr_code' ? 'rgba(245,158,11,.25)' : 'rgba(239,68,68,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(37,211,102,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff' }}>{inst.display_name}</div>
                <div style={{ fontSize: 11, color: '#5c5c7a' }}>{inst.phone_number ?? 'Aguardando conexão'}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: inst.status === 'connected' ? 'rgba(34,197,94,.15)' : inst.status === 'qr_code' ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.1)',
                color: inst.status === 'connected' ? '#22c55e' : inst.status === 'qr_code' ? '#f59e0b' : '#ef4444',
              }}>
                {inst.status === 'connected' ? 'Online' : inst.status === 'qr_code' ? 'QR Code' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#5c5c7a', fontFamily: 'monospace', marginBottom: 10 }}>{inst.instance_name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {inst.status !== 'connected' && (
                <button style={{ ...s.btn, flex: 1, justifyContent: 'center', background: 'rgba(34,197,94,.1)', borderColor: 'rgba(34,197,94,.3)', color: '#22c55e', fontSize: 11.5 }}>
                  📷 Ver QR Code
                </button>
              )}
              <button style={{ ...s.btn, fontSize: 11.5, color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }}>Remover</button>
            </div>
          </div>
        ))}

        {/* Add new Evolution instance */}
        <div
          style={{ ...s.card, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8, cursor: 'pointer', minHeight: 160 }}
          onClick={async () => {
            const name = prompt('Nome do canal (ex: Suporte, Vendas, Financeiro)')
            if (name) await createEvolutionInstance(name)
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(108,99,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8b85ff' }}>Adicionar número</div>
          <div style={{ fontSize: 11, color: '#5c5c7a', textAlign: 'center' }}>Conecte um número WhatsApp via Evolution API (QR Code)</div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: '#5c5c7a', fontSize: 13, padding: 20 }}>Carregando integrações...</div>
      )}
    </div>
  )
}
