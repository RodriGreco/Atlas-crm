'use client'
import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Contact } from '@/lib/supabase/types'
import { Search, Upload, Filter, ArrowRight } from 'lucide-react'

// org_id from sessionStorage
function getOrgId() { return sessionStorage.getItem('org_id') || '' }

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  lead:     { bg: 'rgba(108,99,255,.2)', color: 'var(--accent-2)', label: 'Lead' },
  prospect: { bg: 'rgba(6,214,200,.15)', color: 'var(--cyan)', label: 'Prospect' },
  customer: { bg: 'rgba(34,197,94,.15)', color: 'var(--green)', label: 'Cliente' },
  inactive: { bg: 'rgba(156,163,175,.1)', color: 'var(--text-3)', label: 'Inativo' },
  blocked:  { bg: 'rgba(239,68,68,.1)', color: 'var(--red)', label: 'Bloqueado' },
}

const CHANNEL_ICONS: Record<string, { icon: string; color: string }> = {
  whatsapp: { icon: '💬', color: '#25d366' },
  instagram: { icon: '📸', color: '#ec4899' },
  facebook: { icon: '👍', color: '#1877f2' },
  email: { icon: '📧', color: '#06d6c8' },
  manual: { icon: '✏️', color: 'var(--text-3)' },
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const supabase = getSupabaseClient()

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', getOrgId())
      .order('lead_score', { ascending: false })
      .limit(100)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data } = await query
    setContacts(data ?? [])
    setLoading(false)
  }, [supabase, statusFilter, search])

  useEffect(() => { load() }, [load])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const scoreColor = (s: number) => s >= 80 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--text-3)'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
            Contatos
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {contacts.length} contatos
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 14px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Upload size={13} /> Importar CSV
          </button>
          <button style={{ padding: '7px 14px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ⊞ Segmentos
          </button>
          <button style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + Novo Contato
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar contatos..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'lead', 'prospect', 'customer', 'inactive'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: statusFilter === s ? 'rgba(108,99,255,.2)' : 'transparent',
                border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
                color: statusFilter === s ? 'var(--accent-2)' : 'var(--text-2)',
                transition: 'all .15s',
              }}
            >
              {s === 'all' ? 'Todos' : STATUS_STYLES[s]?.label ?? s}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{selected.size} selecionados</span>
            <button style={{ padding: '5px 10px', background: 'rgba(108,99,255,.15)', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--accent-2)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
              ⚡ Automação em massa
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['', 'Nome', 'Canal', 'Score', 'Status', 'Tags', 'Último contato', 'Valor', ''].map((h, i) => (
                <th key={i} style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '.5px',
                  padding: '10px 14px', textAlign: 'left',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-2)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                  Carregando...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                  Nenhum contato encontrado. Importe via CSV ou crie manualmente.
                </td>
              </tr>
            ) : contacts.map((c) => {
              const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.lead
              const ch = CHANNEL_ICONS[c.source_channel ?? ''] ?? { icon: '◎', color: 'var(--text-3)' }
              const isSelected = selected.has(c.id)
              return (
                <tr
                  key={c.id}
                  style={{
                    transition: 'background .1s',
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'rgba(108,99,255,.08)' : 'transparent',
                    animation: 'fadeIn .15s ease-out',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = isSelected ? 'rgba(108,99,255,.08)' : 'rgba(255,255,255,.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = isSelected ? 'rgba(108,99,255,.08)' : 'transparent')}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(c.id)}
                      style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
                    />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{c.email ?? c.phone ?? ''}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <span>{ch.icon}</span>
                      <span style={{ color: ch.color, fontWeight: 500 }}>{c.source_channel ?? '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(c.lead_score) }}>
                      {c.lead_score}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 20,
                      background: st.bg, color: st.color,
                    }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(c.tags ?? []).slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 20,
                          background: 'rgba(108,99,255,.15)', color: 'var(--accent-2)',
                          fontWeight: 500,
                        }}>{tag}</span>
                      ))}
                      {(c.tags ?? []).length > 2 && (
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{(c.tags ?? []).length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-3)' }}>
                    {c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--cyan)' }}>
                    —
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button style={{
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 6, color: 'var(--text-2)', cursor: 'pointer', padding: '3px 8px',
                      display: 'flex', alignItems: 'center',
                    }}>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
