'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { ConversationWithContact, Message } from '@/lib/supabase/types'
import { Send, Paperclip, Zap, User, CheckCheck } from 'lucide-react'

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp_business: '#25d366', whatsapp_official: '#25d366',
  instagram_dm: '#ec4899', facebook_messenger: '#1877f2',
  email: '#06d6c8', internal: '#6c63ff',
}
const CHANNEL_LABELS: Record<string, string> = {
  whatsapp_business: 'WhatsApp Business', whatsapp_official: 'WhatsApp Oficial',
  instagram_dm: 'Instagram DM', facebook_messenger: 'Facebook Messenger',
  email: 'E-mail', internal: 'Interno',
}

// org_id from sessionStorage
function getOrgId() { return sessionStorage.getItem('org_id') || '' }

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationWithContact[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()

  // Load conversations
  const loadConversations = useCallback(async () => {
    const query = supabase
      .from('conversations')
      .select('*, contacts(id,name,phone,instagram_id,facebook_id,whatsapp_id,lead_score)')
      .eq('organization_id', getOrgId())
      .order('updated_at', { ascending: false })
      .limit(50)

    const { data } = await query
    setConversations((data as ConversationWithContact[]) ?? [])
    if (data?.length && !selectedId) setSelectedId(data[0].id)
  }, [supabase, selectedId])

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data ?? [])
  }, [supabase])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
  }, [selectedId, loadMessages])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscriptions
  useEffect(() => {
    const convChannel = supabase
      .channel('inbox-conversations')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `organization_id=eq.${getOrgId()}`,
      }, () => { loadConversations() })
      .subscribe()

    const msgChannel = supabase
      .channel('inbox-messages')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, (payload) => {
        const newMsg = payload.new as Message
        if (newMsg.conversation_id === selectedId) {
          setMessages(prev => [...prev, newMsg])
        }
        loadConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(convChannel)
      supabase.removeChannel(msgChannel)
    }
  }, [supabase, selectedId, loadConversations])

  async function sendMessage() {
    if (!input.trim() || !selectedId || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    const conv = conversations.find(c => c.id === selectedId)
    if (!conv) { setSending(false); return }

    await supabase.from('messages').insert({
      conversation_id: selectedId,
      organization_id: getOrgId(),
      sender_type: 'agent',
      content,
      content_type: 'text',
      status: 'sent',
    })

    await supabase.from('conversations').update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    }).eq('id', selectedId)

    setSending(false)
  }

  const selected = conversations.find(c => c.id === selectedId)
  const filtered = filter === 'all' ? conversations : conversations.filter(c => c.channel.startsWith(filter))

  const formatTime = (ts: string | null) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 300, minWidth: 300,
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
            Atendimento
          </div>
          <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
            {conversations.filter(c => c.unread_count > 0).length}
          </span>
        </div>

        {/* Channel filters */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'whatsapp', label: 'WA', color: '#25d366' },
            { id: 'instagram', label: 'IG', color: '#ec4899' },
            { id: 'facebook', label: 'FB', color: '#1877f2' },
            { id: 'email', label: 'Email', color: '#06d6c8' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 600,
                cursor: 'pointer',
                background: filter === f.id ? 'rgba(108,99,255,.2)' : 'transparent',
                border: `1px solid ${filter === f.id ? 'var(--accent)' : 'var(--border)'}`,
                color: filter === f.id ? 'var(--accent-2)' : 'var(--text-2)',
                transition: 'all .15s',
              }}
            >
              {f.color && <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.color, display: 'inline-block' }} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              Nenhuma conversa
            </div>
          )}
          {filtered.map(conv => {
            const isActive = conv.id === selectedId
            const color = CHANNEL_COLORS[conv.channel] ?? 'var(--text-3)'
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(108,99,255,.1)' : 'transparent',
                  transition: 'background .1s',
                  animation: 'fadeIn .2s ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>
                    {(conv.contacts as { name: string })?.name ?? 'Desconhecido'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    {formatTime(conv.last_message_at)}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                  {conv.last_message ?? '...'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: 10, color }}>{CHANNEL_LABELS[conv.channel]}</span>
                  {conv.unread_count > 0 && (
                    <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-1)', flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c63ff, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {(selected.contacts as { name: string })?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>
                {(selected.contacts as { name: string })?.name}
              </div>
              <div style={{ fontSize: 11, color: CHANNEL_COLORS[selected.channel] ?? 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                {CHANNEL_LABELS[selected.channel]}
                {(selected.contacts as { lead_score?: number })?.lead_score != null && (
                  <span style={{ marginLeft: 8, color: 'var(--text-3)', fontSize: 10.5 }}>
                    Score: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{(selected.contacts as { lead_score: number }).lead_score}</span>
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ padding: '5px 10px', background: 'transparent', border: '1px solid var(--border-2)', borderRadius: 6, color: 'var(--text-2)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={12} /> Automação
              </button>
              <button style={{ padding: '5px 10px', background: 'transparent', border: '1px solid var(--border-2)', borderRadius: 6, color: 'var(--text-2)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> Perfil
              </button>
              <button style={{ padding: '5px 12px', background: 'var(--green)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                ✓ Resolver
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 40 }}>
                Nenhuma mensagem ainda
              </div>
            )}
            {messages.map(msg => {
              const isUs = msg.sender_type === 'agent' || msg.sender_type === 'bot'
              return (
                <div key={msg.id} style={{
                  alignSelf: isUs ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  animation: 'slideUp .2s ease-out',
                }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: isUs ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isUs ? 'var(--accent)' : 'var(--bg-3)',
                    color: isUs ? '#fff' : 'var(--text-1)',
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, textAlign: isUs ? 'right' : 'left', paddingLeft: 4, paddingRight: 4, display: 'flex', alignItems: 'center', justifyContent: isUs ? 'flex-end' : 'flex-start', gap: 3 }}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {isUs && <CheckCheck size={11} style={{ opacity: .6 }} />}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div style={{
            padding: '6px 16px',
            background: 'rgba(108,99,255,.06)',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 6,
          }}>
            {['⚡ Resposta rápida', '📋 Ver planos', '📅 Agendar call', '🤖 Sugestão IA'].map(a => (
              <button key={a} style={{
                padding: '4px 10px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 20,
                color: 'var(--text-2)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                transition: 'all .15s',
              }}>
                {a}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-1)',
            display: 'flex', gap: 8, alignItems: 'center',
            flexShrink: 0,
          }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
              <Paperclip size={16} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Digite sua mensagem..."
              style={{
                flex: 1, padding: '9px 14px',
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-1)', fontSize: 13,
                fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                padding: '9px 16px',
                background: input.trim() ? 'var(--accent)' : 'var(--bg-4)',
                border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .15s',
              }}
            >
              <Send size={14} />
              Enviar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>
          Selecione uma conversa
        </div>
      )}
    </div>
  )
}
