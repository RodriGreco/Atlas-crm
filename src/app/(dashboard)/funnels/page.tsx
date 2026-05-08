'use client'
import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Background, Controls, addEdge,
  useNodesState, useEdgesState,
  Node, Edge, Connection, BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Funnel } from '@/lib/supabase/types'
import { Play, Square, Save, ChevronDown } from 'lucide-react'

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID!

const nodeTypes_def: Record<string, React.ComponentType<{ data: Record<string, string> }>> = {
  funnelNode: ({ data }) => {
    const colors: Record<string, string> = {
      trigger: '#06d6c8', action: '#6c63ff', condition: '#f59e0b', reply: '#ec4899',
    }
    const color = colors[data.type] ?? '#6c63ff'
    return (
      <div style={{
        background: 'var(--bg2,#141422)', border: `1px solid ${color}40`,
        borderRadius: 10, padding: '10px 14px', minWidth: 160, cursor: 'pointer',
        fontFamily: 'system-ui',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0ff', marginBottom: 2 }}>{data.label}</div>
        <div style={{ fontSize: 10.5, color: '#5c5c7a' }}>{data.sub}</div>
        {data.detail && (
          <div style={{ fontSize: 9.5, color: '#5c5c7a', marginTop: 5, padding: '3px 5px', background: 'rgba(0,0,0,.2)', borderRadius: 4 }}>
            {data.detail}
          </div>
        )}
        {data.qr1 && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[data.qr1, data.qr2, data.qr3].filter(Boolean).map((q, i) => (
              <div key={i} style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 7px', fontSize: 9.5, color }}>{q}</div>
            ))}
          </div>
        )}
      </div>
    )
  },
}

const DEFAULT_NODES: Node[] = [
  { id: 't1', type: 'funnelNode', position: { x: 40, y: 180 }, data: { label: 'Gatilho Instagram', sub: 'Comentou na publicação', type: 'trigger', detail: 'Palavra-chave: QUERO' } },
  { id: 'a1', type: 'funnelNode', position: { x: 260, y: 130 }, data: { label: 'DM Boas-vindas', sub: 'Mensagem + Quick Replies', type: 'action', detail: '"Oi {{nome}}! Qual sua maior dificuldade?"', qr1: 'A — Aumentar vendas', qr2: 'B — Organizar clientes', qr3: 'C — Automatizar' } },
  { id: 'b1', type: 'funnelNode', position: { x: 500, y: 40 }, data: { label: 'Resp A — Vendas', sub: 'Tag: lead-vendas', type: 'action', detail: 'Envia case + link' } },
  { id: 'b2', type: 'funnelNode', position: { x: 500, y: 165 }, data: { label: 'Resp B — CRM', sub: 'Tag: lead-crm', type: 'condition', detail: 'Mostra demo CRM' } },
  { id: 'b3', type: 'funnelNode', position: { x: 500, y: 290 }, data: { label: 'Resp C — Automação', sub: 'Tag: lead-automacao', type: 'action', detail: 'Agenda demo' } },
  { id: 'z1', type: 'funnelNode', position: { x: 720, y: 165 }, data: { label: 'Criar Lead no CRM', sub: 'Supabase · status: lead', type: 'action', detail: 'source: instagram' } },
]

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1', source: 't1', target: 'a1', animated: true, style: { stroke: 'rgba(236,72,153,.5)' } },
  { id: 'e2', source: 'a1', target: 'b1', label: 'A', style: { stroke: 'rgba(236,72,153,.4)' }, labelStyle: { fill: '#ec4899', fontSize: 10 } },
  { id: 'e3', source: 'a1', target: 'b2', label: 'B', style: { stroke: 'rgba(245,158,11,.4)' }, labelStyle: { fill: '#f59e0b', fontSize: 10 } },
  { id: 'e4', source: 'a1', target: 'b3', label: 'C', style: { stroke: 'rgba(6,214,200,.4)' }, labelStyle: { fill: '#06d6c8', fontSize: 10 } },
  { id: 'e5', source: 'b1', target: 'z1', style: { stroke: 'rgba(108,99,255,.3)' } },
  { id: 'e6', source: 'b2', target: 'z1', style: { stroke: 'rgba(108,99,255,.3)' } },
  { id: 'e7', source: 'b3', target: 'z1', style: { stroke: 'rgba(108,99,255,.3)' } },
]

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES)
  const [saving, setSaving] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.from('funnels').select('*').eq('organization_id', ORG_ID)
      .then(({ data }) => setFunnels(data ?? []))
  }, [supabase])

  const onConnect = useCallback(
    (p: Connection) => setEdges(eds => addEdge({ ...p, animated: true, style: { stroke: 'rgba(236,72,153,.5)' } }, eds)),
    [setEdges]
  )

  async function save() {
    setSaving(true)
    if (selectedId) {
      await supabase.from('funnels').update({
        nodes: nodes.map(n => ({ id: n.id, type: n.data.type, label: n.data.label, position: n.position })),
        edges: edges.map(e => ({ source: e.source, target: e.target, label: e.label })),
      }).eq('id', selectedId)
    }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#080810' }}>
      {/* Toolbar */}
      <div style={{ padding: '10px 16px', background: '#0e0e1a', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedId ?? ''}
            onChange={e => setSelectedId(e.target.value)}
            style={{ background: '#1c1c2e', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#f0f0ff', padding: '6px 28px 6px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none', appearance: 'none' }}
          >
            <option value="">❖ Funil Instagram — Lançamento</option>
            {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#5c5c7a', pointerEvents: 'none' }} />
        </div>
        {['+ Mensagem', '+ Botão', '+ Condição', '+ Quick Reply'].map(l => (
          <button key={l} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, color: '#9898b8', fontSize: 11.5, cursor: 'pointer' }}>{l}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(156,163,175,.1)', color: '#5c5c7a' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} /> Rascunho
          </span>
          <button onClick={save} style={{ padding: '6px 14px', background: '#6c63ff', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Save size={11} /> {saving ? 'Salvando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes_def}
          fitView fitViewOptions={{ padding: 0.2 }}
          style={{ background: '#080810' }}
        >
          <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.04)" gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
