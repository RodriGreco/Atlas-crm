'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Kanban, MessageSquare, Megaphone, Workflow, GitBranch, BarChart2, Plug, Settings, LogOut } from 'lucide-react'

const NAV = [
  { label: 'Principal', items: [
    { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/contacts',    icon: Users,           label: 'Contatos', badge: '2.4k' },
    { href: '/pipeline',    icon: Kanban,           label: 'Pipeline' },
  ]},
  { label: 'Atendimento', items: [
    { href: '/inbox',       icon: MessageSquare, label: 'Caixa Entrada', badge: '12' },
    { href: '/campaigns',   icon: Megaphone,     label: 'Campanhas' },
  ]},
  { label: 'Automações', items: [
    { href: '/automations', icon: Workflow,  label: 'Automações', badge: '5', amber: true },
    { href: '/funnels',     icon: GitBranch, label: 'Funis Canvas' },
  ]},
  { label: 'Análise', items: [
    { href: '/reports',       icon: BarChart2, label: 'Relatórios' },
    { href: '/integrations',  icon: Plug,      label: 'Integrações', dot: true },
  ]},
]

function AtlasLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13.5" stroke="#3a9a87" strokeWidth="1.2" opacity=".65"/>
      <ellipse cx="16" cy="16" rx="7" ry="13.5" stroke="#3a9a87" strokeWidth="1" opacity=".45"/>
      <line x1="2.5" y1="16" x2="29.5" y2="16" stroke="#3a9a87" strokeWidth="1" opacity=".35"/>
      <line x1="16" y1="2.5" x2="16" y2="29.5" stroke="#3a9a87" strokeWidth="1" opacity=".28"/>
      <circle cx="16" cy="6.5" r="1.4" fill="#c4843a" opacity=".95"/>
      <circle cx="23" cy="11" r="1.1" fill="#3a9a87" opacity=".85"/>
      <circle cx="9"  cy="21" r="1.1" fill="#3a9a87" opacity=".75"/>
      <circle cx="22" cy="23" r="1.4" fill="#c4843a" opacity=".85"/>
      <circle cx="7"  cy="11" r=".9"  fill="#3a9a87" opacity=".65"/>
      <circle cx="16" cy="17" r="1.5" fill="#5ab8a2" opacity=".9"/>
      <line x1="16"  y1="6.5" x2="23" y2="11"  stroke="#c4843a" strokeWidth=".9" opacity=".55"/>
      <line x1="23"  y1="11"  x2="22" y2="23"  stroke="#3a9a87" strokeWidth=".8" opacity=".4"/>
      <line x1="16"  y1="6.5" x2="9"  y2="21"  stroke="#3a9a87" strokeWidth=".8" opacity=".4"/>
      <line x1="9"   y1="21"  x2="22" y2="23"  stroke="#3a9a87" strokeWidth=".8" opacity=".38"/>
      <line x1="16"  y1="17"  x2="23" y2="11"  stroke="#5ab8a2" strokeWidth=".7" opacity=".5"/>
      <line x1="16"  y1="17"  x2="9"  y2="21"  stroke="#5ab8a2" strokeWidth=".7" opacity=".45"/>
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const logout = async () => {
    await getSupabaseClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{ width:220, minWidth:220, background:'var(--atlas-bg-1)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, overflow:'hidden' }}>
      {/* Logo Atlas */}
      <div style={{ padding:'16px 18px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <AtlasLogo />
        <div>
          <div style={{ fontFamily:'var(--heading)', fontWeight:700, fontSize:20, letterSpacing:'3.5px', color:'var(--text-1)', lineHeight:1, textTransform:'uppercase' as const }}>ATLAS</div>
          <div style={{ fontSize:8.5, color:'var(--atlas-amber)', letterSpacing:'2.5px', marginTop:2, textTransform:'uppercase' as const, fontWeight:600 }}>CRM PLATFORM</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 10px' }}>
        {NAV.map(sec => (
          <div key={sec.label} style={{ marginTop:14 }}>
            <div style={{ fontSize:9.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase' as const, letterSpacing:'1px', padding:'0 8px 5px' }}>{sec.label}</div>
            {sec.items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon   = item.icon
              return (
                <Link key={item.href} href={item.href} style={{
                  display:'flex', alignItems:'center', gap:9,
                  padding:'6px 8px', borderRadius:7,
                  color: active ? 'var(--atlas-teal-3)' : 'var(--text-2)',
                  background: active ? 'rgba(42,122,106,.13)' : 'transparent',
                  fontSize:12.5, fontWeight:500, textDecoration:'none',
                  transition:'all .13s', marginBottom:1,
                  borderLeft: active ? '2px solid var(--atlas-teal)' : '2px solid transparent',
                }}>
                  <Icon size={14} style={{ flexShrink:0, opacity: active ? 1 : 0.6 }} />
                  <span style={{ flex:1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background: item.amber ? 'var(--atlas-amber)' : 'var(--atlas-teal)', color:'#fff', fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:10 }}>
                      {item.badge}
                    </span>
                  )}
                  {item.dot && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)' }}>
        <Link href="/settings" style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 8px', borderRadius:7, textDecoration:'none', color:'var(--text-2)', fontSize:12.5, fontWeight:500, marginBottom:4 }}>
          <Settings size={14} /> Configurações
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px', borderTop:'1px solid var(--border)', paddingTop:10, marginTop:4 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, var(--atlas-teal), var(--atlas-amber))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>RG</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Rodrigo Greco</div>
            <div style={{ fontSize:10, color:'var(--text-3)' }}>Admin · Atlas</div>
          </div>
          <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:2 }}><LogOut size={13} /></button>
        </div>
      </div>
    </aside>
  )
}
