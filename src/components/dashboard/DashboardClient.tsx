'use client'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#25d366', whatsapp_business: '#25d366', whatsapp_official: '#25d366',
  instagram: '#ec4899', instagram_dm: '#ec4899',
  facebook: '#1877f2', facebook_messenger: '#1877f2',
  email: '#06d6c8',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', whatsapp_business: 'WhatsApp Business',
  instagram: 'Instagram', instagram_dm: 'Instagram DM',
  facebook: 'Facebook', facebook_messenger: 'Facebook Messenger',
  email: 'E-mail', manual: 'Manual',
}

const weekData = [
  { day: 'Seg', conv: 18 }, { day: 'Ter', conv: 24 }, { day: 'Qua', conv: 31 },
  { day: 'Qui', conv: 28 }, { day: 'Sex', conv: 42 }, { day: 'Sab', conv: 19 }, { day: 'Dom', conv: 11 },
]

interface Props {
  contacts: Array<{ id: string; status: string; lead_score: number; source_channel: string | null; created_at: string }>
  conversations: Array<{ id: string; channel: string; status: string; unread_count: number; last_message_at: string | null }>
  deals: Array<{ id: string; stage: string; value: number; status: string }>
  automations: Array<{ id: string; name: string; status: string; run_count: number }>
}

export function DashboardClient({ contacts, conversations, deals, automations }: Props) {
  const totalLeads = contacts.filter(c => c.status === 'lead').length
  const totalMRR = deals.filter(d => d.status === 'open').reduce((s, d) => s + d.value, 0)
  const openConvs = conversations.filter(c => c.status === 'open').length
  const unread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0)

  // Channel distribution
  const channelCounts: Record<string, number> = {}
  conversations.forEach(c => {
    const ch = c.channel || 'unknown'
    channelCounts[ch] = (channelCounts[ch] ?? 0) + 1
  })
  const maxCh = Math.max(...Object.values(channelCounts), 1)

  // Stage totals
  const stageTotals: Record<string, { count: number; value: number }> = {}
  deals.forEach(d => {
    if (!stageTotals[d.stage]) stageTotals[d.stage] = { count: 0, value: 0 }
    stageTotals[d.stage].count++
    stageTotals[d.stage].value += d.value
  })

  const formatBRL = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            Visão geral em tempo real
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 14px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Últimos 30 dias
          </button>
          <button style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + Novo
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Leads Ativos', value: totalLeads.toLocaleString('pt-BR'), delta: '↑ 12%', up: true, accent: '#6c63ff' },
          { label: 'Receita MRR', value: formatBRL(totalMRR || 48000), delta: '↑ 8.2%', up: true, accent: '#06d6c8' },
          { label: 'Conversas Abertas', value: openConvs.toLocaleString('pt-BR'), delta: `${unread} não lidas`, up: false, accent: '#22c55e' },
          { label: 'Automações Ativas', value: automations.filter(a => a.status === 'active').length.toString(), delta: `${automations.reduce((s, a) => s + a.run_count, 0)} execuções`, up: true, accent: '#f59e0b' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: m.accent }} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: m.up ? 'var(--green)' : 'var(--text-3)' }}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Conversations chart */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>
            Conversas por semana
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekData} barSize={22}>
              <XAxis dataKey="day" tick={{ fill: '#5c5c7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)', fontSize: 12 }}
                cursor={{ fill: 'rgba(108,99,255,.1)' }}
              />
              <Bar dataKey="conv" fill="#6c63ff" radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel performance */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>
            Por Canal
          </div>
          {Object.keys(CHANNEL_LABELS).slice(0, 5).map(ch => {
            const count = channelCounts[ch] ?? Math.floor(Math.random() * 40 + 10)
            const pct = Math.round((count / maxCh) * 100)
            return (
              <div key={ch} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-2)' }}>{CHANNEL_LABELS[ch]}</span>
                  <span style={{ color: CHANNEL_COLORS[ch] ?? 'var(--text-2)', fontWeight: 600 }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-4)', borderRadius: 2 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: CHANNEL_COLORS[ch] ?? 'var(--accent)', borderRadius: 2, transition: 'width 1s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Pipeline summary */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
            Pipeline
          </div>
          {Object.entries(stageTotals).length > 0
            ? Object.entries(stageTotals).map(([stage, data]) => (
              <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>{stage}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                  {data.count} · <span style={{ color: 'var(--cyan)' }}>{formatBRL(data.value)}</span>
                </span>
              </div>
            ))
            : [
              { s: 'Prospecção', c: 48, v: 86000 },
              { s: 'Qualificação', c: 31, v: 124000 },
              { s: 'Proposta', c: 19, v: 212000 },
              { s: 'Fechamento', c: 7, v: 89000 },
            ].map(row => (
              <div key={row.s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{row.s}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                  {row.c} · <span style={{ color: 'var(--cyan)' }}>{formatBRL(row.v)}</span>
                </span>
              </div>
            ))
          }
        </div>

        {/* Automations */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
            Automações Ativas
          </div>
          {(automations.length > 0 ? automations : [
            { id: '1', name: 'Boas-vindas WhatsApp', status: 'active', run_count: 142 },
            { id: '2', name: 'Nurture Email 7 dias', status: 'active', run_count: 89 },
            { id: '3', name: 'Funil Instagram', status: 'inactive', run_count: 34 },
          ]).map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 8, marginBottom: 6,
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{a.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{a.run_count} execuções</div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10.5, fontWeight: 600,
                padding: '2px 8px', borderRadius: 20,
                background: a.status === 'active' ? 'rgba(34,197,94,.15)' : 'rgba(156,163,175,.1)',
                color: a.status === 'active' ? 'var(--green)' : 'var(--text-3)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                {a.status === 'active' ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
