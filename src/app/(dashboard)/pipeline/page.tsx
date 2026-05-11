'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { DealWithContact } from '@/lib/supabase/types'

const ORG_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

const STAGES = [
  { id: 'prospeccao', name: 'Prospecção', color: '#6c63ff' },
  { id: 'qualificacao', name: 'Qualificação', color: '#06d6c8' },
  { id: 'proposta', name: 'Proposta', color: '#f59e0b' },
  { id: 'negociacao', name: 'Negociação', color: '#ec4899' },
  { id: 'fechado_ganho', name: 'Fechado ✓', color: '#22c55e' },
  { id: 'fechado_perdido', name: 'Perdido ✗', color: '#ef4444' },
  ]

const formatBRL = (v: number) => v >= 1000
  ? `R$ ${(v / 1000).toFixed(0)}k`
    : `R$ ${v.toLocaleString('pt-BR')}`

export default function PipelinePage() {
    const [deals, setDeals] = useState<DealWithContact[]>([])
    const [dragging, setDragging] = useState<string | null>(null)
    const supabase = getSupabaseClient()

  useEffect(() => {
        supabase.from('deals')
          .select('*, contacts(id,name,email)')
          .eq('organization_id', ORG_ID)
          .order('created_at', { ascending: false })
          .then(({ data }) => setDeals((data as DealWithContact[]) ?? []))
  }, [supabase])

  async function moveDeal(dealId: string, newStage: string) {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d))
        await supabase.from('deals').update({ stage: newStage }).eq('id', dealId)
  }

  const stageTotals = (stageId: string) => {
        const stageDeals = deals.filter(d => d.stage === stageId)
        return {
                count: stageDeals.length,
                total: stageDeals.reduce((s, d) => s + (d.value || 0), 0),
        }
  }

  return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                          <div>
                                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                                                Pipeline de Vendas
                                    </h1>h1>
                                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                                      {deals.filter(d => d.status === 'open').length} negócios abertos · {formatBRL(deals.reduce((s, d) => s + (d.value || 0), 0))} total
                                    </p>p>
                          </div>div>
                        <div style={{ display: 'flex', gap: 8 }}>
                                  <button style={{ padding: '7px 14px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                              ⊞ Filtrar
                                  </button>button>
                                  <button style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                              + Novo Negócio
                                  </button>button>
                        </div>div>
                </div>div>
        
          {/* Board */}
              <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '16px 20px 20px' }}>
                      <div style={{ display: 'flex', gap: 12, height: '100%', minWidth: 'max-content' }}>
                        {STAGES.map(stage => {
                      const stageDeals = deals.filter(d => d.stage === stage.id)
                                    const totals = stageTotals(stage.id)
                                                  return (
                                                                  <div
                                                                                    key={stage.id}
                                                                                    style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
                                                                                    onDragOver={e => e.preventDefault()}
                                                                                    onDrop={e => {
                                                                                                        e.preventDefault()
                                                                                                                            if (dragging) moveDeal(dragging, stage.id)
                                                                                      }}
                                                                                  >
                                                                    {/* Column header */}
                                                                                  <div style={{
                                                                                                      padding: '8px 12px',
                                                                                                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                                                                                                      borderTop: `3px solid ${stage.color}`,
                                                                                                      borderRadius: '8px 8px 0 0', marginBottom: 1,
                                                                                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                                  }}>
                                                                                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{stage.name}</div>div>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                                                                        <span style={{ background: 'var(--bg-4)', color: 'var(--text-2)', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20 }}>
                                                                                                                          {totals.count}
                                                                                                                          </span>span>
                                                                                                      </div>div>
                                                                                  </div>div>
                                                                                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', padding: '4px 12px 8px', background: 'var(--bg-3)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                                                                                    {formatBRL(totals.total)}
                                                                                  </div>div>
                                                                  
                                                                    {/* Cards */}
                                                                                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,255,255,.01)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '8px' }}>
                                                                                    {stageDeals.map(deal => {
                                                                                                        const contact = deal.contacts as { name: string; email: string } | null
                                                                                                                              return (
                                                                                                                                                      <div
                                                                                                                                                                                key={deal.id}
                                                                                                                                                                                draggable
                                                                                                                                                                                onDragStart={() => setDragging(deal.id)}
                                                                                                                                                                                onDragEnd={() => setDragging(null)}
                                                                                                                                                                                style={{
                                                                                                                                                                                                            background: 'var(--bg-2)', border: `1px solid ${dragging === deal.id ? stage.color : 'var(--border)'}`,
                                                                                                                                                                                                            borderRadius: 8, padding: '10px 12px', cursor: 'grab',
                                                                                                                                                                                                            transition: 'all .15s',
                                                                                                                                                                                                            animation: 'slideUp .2s ease-out',
                                                                                                                                                                                                            opacity: dragging === deal.id ? 0.5 : 1,
                                                                                                                                                                                                          }}
                                                                                                                                                                                onMouseEnter={e => (e.currentTarget.style.borderColor = stage.color)}
                                                                                                                                                                                onMouseLeave={e => { if (dragging !== deal.id) e.currentTarget.style.borderColor = 'var(--border)' }}
                                                                                                                                                                              >
                                                                                                                                                                              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{deal.title}</div>div>
                                                                                                                                                        {contact && (
                                                                                                                                                                                                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{contact.name}</div>div>
                                                                                                                                                                              )}
                                                                                                                                                                              <div style={{ fontSize: 12, fontWeight: 700, color: stage.id === 'fechado_ganho' ? 'var(--green)' : 'var(--cyan)' }}>
                                                                                                                                                                                                        {formatBRL(deal.value || 0)}
                                                                                                                                                                                </div>div>
                                                                                                                                                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                                                                                                                                                                                                        <span style={{
                                                                                                                                                                                                            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 20,
                                                                                                                                                                                                            background: deal.probability > 70 ? 'rgba(34,197,94,.15)' : 'rgba(245,158,11,.15)',
                                                                                                                                                                                                            color: deal.probability > 70 ? 'var(--green)' : 'var(--amber)',
                                                                                                                                                                                                          }}>
                                                                                                                                                                                                                                    {deal.probability}%
                                                                                                                                                                                                                                  </span>span>
                                                                                                                                                                                                        <div style={{
                                                                                                                                                                                                            width: 22, height: 22, borderRadius: '50%',
                                                                                                                                                                                                            background: 'linear-gradient(135deg, #6c63ff, #ec4899)',
                                                                                                                                                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                                                                                                                                            fontSize: 9, fontWeight: 700, color: '#fff',
                                                                                                                                                                                                          }}>
                                                                                                                                                                                                                                    {contact?.name?.charAt(0).toUpperCase() ?? '?'}
                                                                                                                                                                                                                                  </div>div>
                                                                                                                                                                                </div>div>
                                                                                                                                                        </div>div>
                                                                                                                                                    )
                                                                                      })}
                                                                                  
                                                                                    {stageDeals.length === 0 && (
                                                                                                        <div style={{
                                                                                                                                padding: '20px 12px', textAlign: 'center',
                                                                                                                                border: '1px dashed var(--border)', borderRadius: 8,
                                                                                                                                color: 'var(--text-3)', fontSize: 11.5,
                                                                                                          }}>
                                                                                                                              Arraste negócios aqui
                                                                                                          </div>div>
                                                                                                    )}
                                                                                  </div>div>
                                                                  </div>div>
                                                                )
                        })}
                      </div>div>
              </div>div>
        </div>div>
      )
}</div>
