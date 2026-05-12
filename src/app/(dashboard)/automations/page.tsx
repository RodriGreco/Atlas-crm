'use client'
import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Node, Edge, Connection, BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Automation } from '@/lib/supabase/types'
import { Play, Square, Save, Plus, ChevronDown } from 'lucide-react'

// org_id is read from sessionStorage (set by Sidebar on login)
function getOrgId() { return sessionStorage.getItem('org_id') || '' }

const NODE_STYLES = {
  trigger:       { border: '2px solid #06d6c8', icon: '⚡', color: '#06d6c8', bg: 'rgba(6,214,200,.08)' },
  wait:          { border: '1px solid var(--border-2)', icon: '⏱', color: '#8b85ff', bg: 'var(--bg-3)' },
  send_whatsapp: { border: '1px solid #25d366', icon: '💬', color: '#25d366', bg: 'rgba(37,211,102,.06)' },
  send_email:    { border: '1px solid #06d6c8', icon: '📧', color: '#06d6c8', bg: 'rgba(6,214,200,.06)' },
  send_ig_dm:    { border: '1px solid #ec4899', icon: '📸', color: '#ec4899', bg: 'rgba(236,72,153,.06)' },
  condition:     { border: '1px solid #f59e0b', icon: '◈', color: '#f59e0b', bg: 'rgba(245,158,11,.08)' },
  add_tag:       { border: '1px solid #8b85ff', icon: '🏷', color: '#8b85ff', bg: 'var(--bg-3)' },
  update_score:  { border: '1px solid #22c55e', icon: '📈', color: '#22c55e', bg: 'rgba(34,197,94,.06)' },
  webhook:       { border: '1px solid #f59e0b', icon: '🔗', color: '#f59e0b', bg: 'rgba(245,158,11,.06)' },
  default:       { border: '1px solid var(--border-2)', icon: '◎', color: 'var(--text-2)', bg: 'var(--bg-3)' },
}

function AutomationNode({ data }: { data: Record<string, string> }) {
  const style = NODE_STYLES[data.type as keyof typeof NODE_STYLES] ?? NODE_STYLES.default
  return (
    <div style={{
      background: style.bg,
      border: style.border,
      borderRadius: 10, padding: '10px 14px',
      minWidth: 160, cursor: 'grab',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: `${style.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, flexShrink: 0,
        }}>{style.icon}</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{data.label}</div>
          {data.sub && <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{data.sub}</div>}
        </div>
      </div>
      {data.detail && (
        <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 4, padding: '4px 6px', background: 'rgba(0,0,0,.2)', borderRadius: 4 }}>
          {data.detail}
        </div>
      )}
    </div>
  )
}

const nodeTypes = { automationNode: AutomationNode }

const DEFAULT_NODES: Node[] = [
  { id: 'trigger-1', type: 'automationNode', position: { x: 40, y: 120 }, data: { label: 'Gatilho', sub: 'Novo Lead Criado', type: 'trigger', detail: 'Fonte: Qualquer canal' } },
  { id: 'wait-1', type: 'automationNode', position: { x: 280, y: 120 }, data: { label: 'Esperar', sub: '5 minutos', type: 'wait' } },
  { id: 'whatsapp-1', type: 'automationNode', position: { x: 520, y: 60 }, data: { label: 'Enviar WhatsApp', sub: 'Boas-vindas Lead', type: 'send_whatsapp', detail: '"Olá {{nome}}! Bem-vindo..."' } },
  { id: 'condition-1', type: 'automationNode', position: { x: 760, y: 120 }, data: { label: 'Condição', sub: 'Respondeu?', type: 'condition' } },
  { id: 'tag-1', type: 'automationNode', position: { x: 1000, y: 60 }, data: { label: 'Adicionar Tag', sub: 'Lead Quente', type: 'add_tag' } },
  { id: 'followup-1', type: 'automationNode', position: { x: 1000, y: 200 }, data: { label: 'Follow-up Email', sub: 'Nurture D1', type: 'send_email', detail: 'Após 24h sem resposta' } },
]

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1', source: 'trigger-1', target: 'wait-1', animated: true, style: { stroke: 'rgba(108,99,255,.5)' } },
  { id: 'e2', source: 'wait-1', target: 'whatsapp-1', animated: true, style: { stroke: 'rgba(108,99,255,.5)' } },
  { id: 'e3', source: 'whatsapp-1', target: 'condition-1', style: { stroke: 'rgba(108,99,255,.4)' } },
  { id: 'e4', source: 'condition-1', target: 'tag-1', label: 'Sim', style: { stroke: '#22c55e' }, labelStyle: { fill: '#22c55e', fontSize: 11 } },
  { id: 'e5', source: 'condition-1', target: 'followup-1', label: 'Não', style: { stroke: '#f59e0b' }, labelStyle: { fill: '#f59e0b', fontSize: 11 } },
]

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES)
  const [saving, setSaving] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase.from('automations').select('*').eq('organization_id', getOrgId())
      .then(({ data }) => {
        setAutomations(data ?? [])
        if (data?.[0] && !selectedId) {
          setSelectedId(data[0].id)
          loadAutomationCanvas(data[0])
        }
      })
  }, [supabase])

  function loadAutomationCanvas(automation: Automation) {
    try {
      const rawNodes = Array.isArray(automation.nodes) ? automation.nodes : []
      const rawEdges = Array.isArray(automation.edges) ? automation.edges : []

      if (rawNodes.length > 0) {
        const flowNodes = (rawNodes as Array<Record<string, unknown>>).map((n) => ({
          id: n.id as string,
          type: 'automationNode',
          position: (n.position as { x: number; y: number }) ?? { x: 0, y: 0 },
          data: {
            label: n.label as string,
            type: n.type as string,
            sub: ((n.config as Record<string, unknown>)?.template as string) ?? '',
            detail: '',
          },
        }))
        const flowEdges = (rawEdges as Array<Record<string, unknown>>).map((e) => ({
          id: `e-${e.source}-${e.target}`,
          source: e.source as string,
          target: e.target as string,
          label: e.label as string | undefined,
          animated: true,
          style: { stroke: 'rgba(108,99,255,.5)' },
        }))
        setNodes(flowNodes)
        setEdges(flowEdges)
      }
    } catch (e) {
      // fall back to defaults
    }
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: 'rgba(108,99,255,.5)' } }, eds)),
    [setEdges]
  )

  async function saveAutomation() {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('automations').update({
      nodes: nodes.map(n => ({ id: n.id, type: n.data.type, label: n.data.label, position: n.position, config: {} })),
      edges: edges.map(e => ({ source: e.source, target: e.target, label: e.label })),
    }).eq('id', selectedId)
    setSaving(false)
  }

  async function toggleStatus() {
    if (!selectedId) return
    const auto = automations.find(a => a.id === selectedId)
    if (!auto) return
    const newStatus = auto.status === 'active' ? 'inactive' : 'active'
    await supabase.from('automations').update({ status: newStatus }).eq('id', selectedId)
    setAutomations(prev => prev.map(a => a.id === selectedId ? { ...a, status: newStatus } : a))
  }

  const currentAuto = automations.find(a => a.id === selectedId)

  const NODE_TYPES_MENU = [
    { type: 'wait', label: 'Esperar', icon: '⏱' },
    { type: 'send_whatsapp', label: 'WhatsApp', icon: '💬' },
    { type: 'send_email', label: 'Email', icon: '📧' },
    { type: 'send_ig_dm', label: 'Instagram DM', icon: '📸' },
    { type: 'condition', label: 'Condição', icon: '◈' },
    { type: 'add_tag', label: 'Adicionar Tag', icon: '🏷' },
    { type: 'update_score', label: 'Atualizar Score', icon: '📈' },
    { type: 'webhook', label: 'Webhook', icon: '🔗' },
  ]

  function addNode(type: string, label: string) {
    const id = `${type}-${Date.now()}`
    const lastNode = nodes[nodes.length - 1]
    const position = { x: (lastNode?.position.x ?? 0) + 200, y: lastNode?.position.y ?? 120 }
    setNodes(ns => [...ns, {
      id, type: 'automationNode', position,
      data: { label, type, sub: 'Configurar...', detail: '' },
    }])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        padding: '10px 16px',
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        {/* Automation selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedId ?? ''}
            onChange={e => {
              setSelectedId(e.target.value)
              const a = automations.find(a => a.id === e.target.value)
              if (a) loadAutomationCanvas(a)
            }}
            style={{
              background: 'var(--bg-3)', border: '1px solid var(--border-2)',
              borderRadius: 8, color: 'var(--text-1)', padding: '6px 12px',
              fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600,
              cursor: 'pointer', outline: 'none', appearance: 'none', paddingRight: 28,
            }}
          >
            {automations.length === 0 && <option value="">Selecionar automação</option>}
            {automations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        </div>

        {/* Add node buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {NODE_TYPES_MENU.map(n => (
            <button
              key={n.type}
              onClick={() => addNode(n.type, n.label)}
              style={{
                padding: '5px 10px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 6,
                color: 'var(--text-2)', fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all .15s',
              }}
              title={`Adicionar ${n.label}`}
            >
              <span style={{ fontSize: 11 }}>{n.icon}</span>
              <span className="hidden-mobile">{n.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {currentAuto && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              padding: '3px 10px', borderRadius: 20,
              background: currentAuto.status === 'active' ? 'rgba(34,197,94,.15)' : 'rgba(156,163,175,.1)',
              color: currentAuto.status === 'active' ? 'var(--green)' : 'var(--text-3)',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {currentAuto.status === 'active' ? 'Ativa' : 'Inativa'}
            </span>
          )}
          <button
            onClick={toggleStatus}
            style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              background: currentAuto?.status === 'active' ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.15)',
              border: `1px solid ${currentAuto?.status === 'active' ? 'rgba(239,68,68,.4)' : 'rgba(34,197,94,.4)'}`,
              color: currentAuto?.status === 'active' ? 'var(--red)' : 'var(--green)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {currentAuto?.status === 'active' ? <><Square size={11} /> Pausar</> : <><Play size={11} /> Ativar</>}
          </button>
          <button
            onClick={saveAutomation}
            disabled={saving}
            style={{
              padding: '6px 14px', background: 'var(--accent)', border: 'none', borderRadius: 7,
              color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <Save size={11} /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ animated: true, style: { stroke: 'rgba(108,99,255,.5)' } }}
          style={{ background: 'var(--bg-0)' }}
        >
          <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.04)" gap={20} size={1} />
          <Controls style={{ bottom: 20, left: 20 }} />
          <MiniMap
            nodeColor={() => 'rgba(108,99,255,.6)'}
            maskColor="rgba(8,8,16,0.7)"
            style={{ bottom: 20, right: 20 }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}
