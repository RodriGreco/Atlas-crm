'use client'
import { BarChart2 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
          Relatorios
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
          Analise o desempenho do seu CRM
        </p>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 80, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12,
        color: 'var(--text-3)',
      }}>
        <BarChart2 size={48} style={{ opacity: 0.25, marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
          Relatorios em breve
        </div>
        <div style={{ fontSize: 13, maxWidth: 360, textAlign: 'center', lineHeight: 1.6 }}>
          Esta secao esta em desenvolvimento. Em breve voce podera visualizar metricas
          de conversoes, funis, campanhas e automacoes aqui.
        </div>
      </div>
    </div>
  )
}
