'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Campaign } from '@/lib/supabase/types'
import { Megaphone, Mail, MessageSquare, Instagram } from 'lucide-react'

// org_id from sessionStorage (set by Sidebar on login)
function getOrgId() { return sessionStorage.getItem('org_id') || '' }

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,.15)', color: 'var(--green)', label: 'Ativa' },
  draft: { bg: 'rgba(156,163,175,.1)', color: 'var(--text-3)', label: 'Rascunho' },
  paused: { bg: 'rgba(245,158,11,.15)', color: 'var(--amber)', label: 'Pausada' },
  scheduled: { bg: 'rgba(6,214,200,.15)', color: 'var(--cyan)', label: 'Agendada' },
  completed: { bg: 'rgba(108,99,255,.15)', color: 'var(--accent-2)', label: 'Concluida' },
  sending: { bg: 'rgba(34,197,94,.2)', color: 'var(--green)', label: 'Enviando...' },
  cancelled: { bg: 'rgba(239,68,68,.1)', color: 'var(--red)', label: 'Cancelada' },
}

const CHANNEL_COLOR: Record<string, string> = {
  email: '#06d6c8', whatsapp: '#25d366', instagram: '#ec4899', facebook: '#1877f2',
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const orgId = getOrgId()
    supabase.from('campaigns').select('*').eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data ?? []); setLoading(false) })
  }, [supabase])

  const statsOf = (c: Campaign) => {
    const s = c.stats as Record<string, number>
    return s ?? { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, converted: 0 }
  }

  const pct = (v: number, total: number) => total > 0 ? Math.round((v / total) * 100) + '%' : 'x'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Campanhas</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{campaigns.length} campanhas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 14px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Templates
          </button>
          <button style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + Nova Campanha
          </button>
        </div>
      </div>

      {loading && <div style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: 40 }}>Carregando...</div>}

      {!loading && campaigns.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
          <Megaphone size={40} style={{ opacity: .3, marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>Nenhuma campanha ainda</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Crie sua primeira campanha de WhatsApp ou Email</div>
        </div>
      )}

      {campaigns.map(c => {
        const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
        const s = statsOf(c)
        const ch = c.channel
        const chColor = CHANNEL_COLOR[ch] ?? 'var(--text-2)'
        return (
          <div key={c.id} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px', marginBottom: 10, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: chColor, fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 10 }}>
                  {ch} - {c.type}
                  {c.schedule_at && ' - Agendada: ' + new Date(c.schedule_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
                padding: '4px 10px', borderRadius: 20,
                background: st.bg, color: st.color, flexShrink: 0,
              }}>
                {st.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
