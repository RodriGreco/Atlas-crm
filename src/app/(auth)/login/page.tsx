'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

function AtlasGlobe() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke="#f5f5f5" strokeWidth="1.2" opacity=".35"/>
      <ellipse cx="40" cy="40" rx="18" ry="36" stroke="#f5f5f5" strokeWidth="0.9" opacity=".22"/>
      <ellipse cx="40" cy="40" rx="36" ry="14" stroke="#f5f5f5" strokeWidth="0.9" opacity=".22"/>
      <path d="M10 22 Q40 10 70 28" stroke="#f5f5f5" strokeWidth="1" opacity=".28" fill="none"/>
      <path d="M8 52 Q40 65 72 48" stroke="#f5f5f5" strokeWidth="1" opacity=".28" fill="none"/>
      <path d="M22 8 Q55 25 65 65" stroke="#c8a96b" strokeWidth="1" opacity=".45" fill="none"/>
      <path d="M58 10 Q25 35 15 68" stroke="#f5f5f5" strokeWidth="0.9" opacity=".22" fill="none"/>
      <circle cx="40" cy="14" r="2.5" fill="#c8a96b" opacity=".9"/>
      <circle cx="62" cy="26" r="2" fill="#f5f5f5" opacity=".7"/>
      <circle cx="18" cy="55" r="2" fill="#f5f5f5" opacity=".7"/>
      <circle cx="58" cy="60" r="2.5" fill="#c8a96b" opacity=".85"/>
      <circle cx="16" cy="27" r="1.8" fill="#f5f5f5" opacity=".6"/>
      <circle cx="40" cy="42" r="3" fill="#0f766e" opacity=".9"/>
      <line x1="40" y1="14" x2="62" y2="26" stroke="#c8a96b" strokeWidth="1" opacity=".5"/>
      <line x1="62" y1="26" x2="58" y2="60" stroke="#f5f5f5" strokeWidth="0.9" opacity=".35"/>
      <line x1="40" y1="14" x2="18" y2="55" stroke="#f5f5f5" strokeWidth="0.9" opacity=".35"/>
      <line x1="18" y1="55" x2="58" y2="60" stroke="#f5f5f5" strokeWidth="0.9" opacity=".3"/>
      <line x1="40" y1="42" x2="62" y2="26" stroke="#0f766e" strokeWidth="0.9" opacity=".48"/>
      <line x1="40" y1="42" x2="18" y2="55" stroke="#0f766e" strokeWidth="0.9" opacity=".42"/>
      <line x1="16" y1="27" x2="40" y2="42" stroke="#f5f5f5" strokeWidth="0.8" opacity=".3"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = getSupabaseClient()
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true); setError('')
    const sb = getSupabaseClient()
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(20,22,26,0.9)',
    border: '1px solid rgba(200,169,107,0.2)',
    borderRadius: 8, color: '#f5f5f5', fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none', transition: 'border-color .15s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #080809 0%, #0b0b0d 50%, #0d1520 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:'55vw', height:'55vw', background:'radial-gradient(ellipse, rgba(13,45,62,0.25) 0%, transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-25%', right:'-10%', width:'50vw', height:'50vw', background:'radial-gradient(ellipse, rgba(200,169,107,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, padding:'0 24px', position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <AtlasGlobe />
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 36,
              letterSpacing: '12px',
              color: '#f5f5f5',
              lineHeight: 1,
              textTransform: 'uppercase' as const,
            }}>ATLAS</div>
            <div style={{ fontSize:10, color:'#c8a96b', letterSpacing:'3px', textTransform:'uppercase' as const, fontWeight:500 }}>
              CRM PLATFORM
            </div>
          </div>
          <p style={{ fontSize:13, color:'#a0a0a8', marginTop:16 }}>
            Faça login para continuar
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14,14,17,0.85)',
          border: '1px solid rgba(200,169,107,0.18)',
          borderRadius: 16,
          padding: '28px 26px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
        }}>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px',
              background: googleLoading ? 'rgba(30,32,38,0.5)' : 'rgba(30,32,38,0.8)',
              border: '1px solid rgba(200,169,107,0.25)',
              borderRadius: 8,
              color: '#f5f5f5',
              fontSize: 14, fontWeight: 500,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all .15s',
              marginBottom: 20,
            }}
          >
            {googleLoading ? (
              <span style={{ opacity:.6 }}>Redirecionando...</span>
            ) : (
              <>
                <GoogleIcon />
                Entrar com Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:'rgba(200,169,107,0.12)' }} />
            <span style={{ fontSize:11, color:'#5a5a66', letterSpacing:'.5px' }}>OU</span>
            <div style={{ flex:1, height:1, background:'rgba(200,169,107,0.12)' }} />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:10, fontWeight:600, color:'#5a5a66', marginBottom:6, textTransform:'uppercase' as const, letterSpacing:'.8px' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com" style={inp}
                onFocus={e=>{ e.target.style.borderColor='rgba(200,169,107,0.5)' }}
                onBlur={e=>{ e.target.style.borderColor='rgba(200,169,107,0.2)' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:10, fontWeight:600, color:'#5a5a66', marginBottom:6, textTransform:'uppercase' as const, letterSpacing:'.8px' }}>Senha</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={inp}
                onFocus={e=>{ e.target.style.borderColor='rgba(200,169,107,0.5)' }}
                onBlur={e=>{ e.target.style.borderColor='rgba(200,169,107,0.2)' }} />
            </div>

            {error && (
              <div style={{ background:'rgba(200,169,107,0.06)', border:'1px solid rgba(200,169,107,0.25)', borderRadius:8, padding:'9px 12px', fontSize:12.5, color:'#d9bc87' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '12px',
              background: loading ? 'rgba(200,169,107,0.15)' : 'linear-gradient(135deg, #c8a96b 0%, #a8884a 100%)',
              color: loading ? '#a0a0a8' : '#0b0b0d',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all .15s', letterSpacing: '.5px',
            }}>
              {loading ? 'Aguarde...' : 'Entrar com Email'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:24, fontSize:11, color:'#3a3a44', letterSpacing:'.5px' }}>
          © 2025 Atlas CRM · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
