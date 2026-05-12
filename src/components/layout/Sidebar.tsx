'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Kanban, MessageSquare, Megaphone, Workflow, GitBranch, BarChart2, Plug, Settings, LogOut } from 'lucide-react'

const NAV = [
  { label: 'Principal', items: [
    { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/contacts',     icon: Users,           label: 'Contatos' },
    { href: '/pipeline',     icon: Kanban,          label: 'Pipeline' },
  ]},
  { label: 'Atendimento', items: [
    { href: '/inbox',        icon: MessageSquare,   label: 'Caixa Entrada' },
    { href: '/campaigns',    icon: Megaphone,       label: 'Campanhas' },
  ]},
  { label: 'Automacoes', items: [
    { href: '/automations',  icon: Workflow,        label: 'Automacoes' },
    { href: '/funnels',      icon: GitBranch,       label: 'Funis Canvas' },
  ]},
  { label: 'Analise', items: [
    { href: '/reports',      icon: BarChart2,       label: 'Relatorios' },
    { href: '/integrations', icon: Plug,            label: 'Integracoes' },
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
      <circle cx="9" cy="21" r="1.1" fill="#3a9a87" opacity=".75"/>
      <circle cx="22" cy="23" r="1.4" fill="#c4843a" opacity=".85"/>
      <circle cx="7" cy="11" r=".9" fill="#3a9a87" opacity=".65"/>
      <circle cx="16" cy="17" r="1.5" fill="#5ab8a2" opacity=".9"/>
      <line x1="16" y1="6.5" x2="23" y2="11" stroke="#c4843a" strokeWidth=".9" opacity=".55"/>
      <line x1="23" y1="11" x2="22" y2="23" stroke="#3a9a87" strokeWidth=".8" opacity=".4"/>
      <line x1="16" y1="6.5" x2="9" y2="21" stroke="#3a9a87" strokeWidth=".8" opacity=".4"/>
      <line x1="9" y1="21" x2="22" y2="23" stroke="#3a9a87" strokeWidth=".8" opacity=".38"/>
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState(null)
  const [orgName, setOrgName] = useState('Atlas')
  const [counts, setCounts] = useState({ contacts: 0, inbox: 0, automations: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      setUser({ email: u.email, full_name: u.user_metadata?.full_name })

      const { data: orgUser } = await supabase
        .from('org_users')
        .select('organization_id, organizations(name)')
        .eq('user_id', u.id)
        .single()

      if (orgUser?.organizations) {
        setOrgName(orgUser.organizations.name || 'Atlas')
      }

      const orgId = orgUser?.organization_id
      if (!orgId) return

      sessionStorage.setItem('org_id', orgId)

      const [{ count: cc }, { count: ic }, { count: ac }] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'open'),
        supabase.from('automations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
      ])
      setCounts({ contacts: cc || 0, inbox: ic || 0, automations: ac || 0 })
    }
    load()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    sessionStorage.removeItem('org_id')
    router.push('/login')
  }

  const initials = (user?.full_name || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const getBadge = (href) => {
    if (href === '/contacts' && counts.contacts > 0) return counts.contacts >= 1000 ? (counts.contacts / 1000).toFixed(1) + 'k' : String(counts.contacts)
    if (href === '/inbox' && counts.inbox > 0) return String(counts.inbox)
    if (href === '/automations' && counts.automations > 0) return String(counts.automations)
    return null
  }

  return (
    <aside style={{ width: 216, minWidth: 216, height: '100vh', background: 'var(--bg-1)', borderRight: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <AtlasLogo />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '.5px' }}>ATLAS</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '1px' }}>CRM PLATFORM</div>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV.map(section => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {section.label}
            </div>
            {section.items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const badge = getBadge(item.href)
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', margin: '1px 8px', borderRadius: 8,
                  textDecoration: 'none', background: active ? 'var(--bg-3)' : 'transparent',
                  color: active ? 'var(--text-1)' : 'var(--text-2)', fontWeight: active ? 600 : 400, fontSize: 13.5,
                  transition: 'all .15s', borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}>
                  <item.icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : .65 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: 'var(--accent-muted)', color: 'var(--accent)' }}>{badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid var(--border-1)', padding: '8px' }}>
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-2)', fontSize: 13.5, marginBottom: 2 }}>
          <Settings size={16} opacity={.65} />
          <span>Configuracoes</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.email?.split('@')[0] || 'Usuario'}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Admin - {orgName}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }} title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
