'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

function AtlasGlobeBig() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="32" stroke="#3a9a87" strokeWidth="1.4" opacity=".55"/>
      <ellipse cx="36" cy="36" rx="16" ry="32" stroke="#3a9a87" strokeWidth="1.1" opacity=".38"/>
      <line x1="4" y1="36" x2="68" y2="36" stroke="#3a9a87" strokeWidth="1" opacity=".28"/>
      <line x1="36" y1="4" x2="36" y2="68" stroke="#3a9a87" strokeWidth="1" opacity=".22"/>
      <circle cx="36" cy="13" r="2.5" fill="#c4843a" opacity=".9"/>
      <circle cx="54" cy="24" r="2"   fill="#3a9a87" opacity=".8"/>
      <circle cx="18" cy="50" r="2"   fill="#3a9a87" opacity=".7"/>
      <circle cx="52" cy="54" r="2.5" fill="#c4843a" opacity=".85"/>
      <circle cx="15" cy="25" r="1.8" fill="#3a9a87" opacity=".65"/>
      <circle cx="36" cy="38" r="3"   fill="#5ab8a2" opacity=".9"/>
      <line x1="36" y1="13" x2="54" y2="24" stroke="#c4843a" strokeWidth="1.1" opacity=".5"/>
      <line x1="54" y1="24" x2="52" y2="54" stroke="#3a9a87" strokeWidth="1" opacity=".38"/>
      <line x1="36" y1="13" x2="18" y2="50" stroke="#3a9a87" strokeWidth="1" opacity=".38"/>
      <line x1="18" y1="50" x2="52" y2="54" stroke="#3a9a87" strokeWidth="1" opacity=".35"/>
      <line x1="36" y1="38" x2="54" y2="24" stroke="#5ab8a2" strokeWidth=".9" opacity=".48"/>
      <line x1="36" y1="38" x2="18" y2="50" stroke="#5ab8a2" strokeWidth=".9" opacity=".42"/>
      <line x1="15" y1="25" x2="36" y2="38" stroke="#3a9a87" strokeWidth=".8" opacity=".35"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mode, setMode]         = useState<'login'|'signup'>('login')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = getSupabaseClient()

    if (mode === 'signup') {
      const { error } = await sb.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setError('Verifique seu email para confirmar o cadastro.')
      setLoading(false); return
    }

    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(10,30,30,.8)', border: '1px solid rgba(42,122,106,.25)',
    borderRadius: 8, color: '#e8f4f0', fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none', transition: 'border-color .15s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060f0f 0%, #0a1f1f 40%, #0d1a10 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-20%', right:'-10%', width:'50vw', height:'50vw', background:'radial-gradient(ellipse, rgba(196,132,58,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-20%', left:'-10%', width:'55vw', height:'55vw', background:'radial-gradient(ellipse, rgba(42,122,106,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, padding:'0 24px', position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <AtlasGlobeBig />
            <div style={{ fontFamily:"'Rajdhani', sans-serif", fontWeight:700, fontSize:32, letterSpacing:'6px', color:'#e8f4f0', lineHeight:1, textTransform:'uppercase' as const }}>ATLAS</div>
            <div style={{ fontSize:10, color:'#c4843a', letterSpacing:'3px', textTransform:'uppercase' as const, fontWeight:600 }}>CRM PLATFORM</div>
          </div>
          <p style={{ fontSize:13.5, color:'#8ab8aa', marginTop:14 }}>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(13,32,32,.85)', border:'1px solid rgba(42,122,106,.22)', borderRadius:16, padding:'28px 26px', backdropFilter:'blur(12px)' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#4a7a6a', marginBottom:5, textTransform:'uppercase' as const, letterSpacing:'.6px' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com" style={inp}
                onFocus={e=>{e.target.style.borderColor='rgba(42,122,106,.6)'}}
                onBlur={e=>{e.target.style.borderColor='rgba(42,122,106,.25)'}} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#4a7a6a', marginBottom:5, textTransform:'uppercase' as const, letterSpacing:'.6px' }}>Senha</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={inp}
                onFocus={e=>{e.target.style.borderColor='rgba(42,122,106,.6)'}}
                onBlur={e=>{e.target.style.borderColor='rgba(42,122,106,.25)'}} />
            </div>

            {error && (
              <div style={{ background:'rgba(42,122,106,.08)', border:'1px solid rgba(42,122,106,.3)', borderRadius:8, padding:'9px 12px', fontSize:12.5, color:'#8ab8aa' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop:4, padding:'12px',
              background: loading ? 'rgba(42,122,106,.3)' : 'linear-gradient(135deg, #2a7a6a, #1f5a4a)',
              color:'#e8f4f0', border:'1px solid rgba(42,122,106,.4)', borderRadius:8,
              fontSize:14, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:"'Plus Jakarta Sans', sans-serif", transition:'all .15s',
              letterSpacing:'.5px',
            }}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar no Atlas' : 'Criar conta'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:18 }}>
            <button onClick={()=>setMode(mode==='login'?'signup':'login')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12.5, color:'#3a9a87', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:22, fontSize:11, color:'#2a4a3a', letterSpacing:'.5px' }}>
          © 2025 Atlas CRM · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
