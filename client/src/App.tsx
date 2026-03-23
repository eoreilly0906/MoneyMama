import { useEffect, useState } from 'react'
import './App.css'

type Health = { ok: boolean } | null

function App() {
  const [health, setHealth] = useState<Health>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/health')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ ok: boolean }>
      })
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Request failed')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="app">
      <h1>Money Mama</h1>
      <p className="muted">Client + server monorepo</p>
      <section className="panel">
        <h2>API</h2>
        {error && <p className="error">Server: {error}</p>}
        {!error && health && (
          <p className="ok">Server: healthy ({String(health.ok)})</p>
        )}
        {!error && !health && <p className="muted">Checking server…</p>}
        <p className="hint">
          Run <code>npm run dev</code> from the repo root (starts API on :3000
          and this app on :5173).
        </p>
      </section>
    </main>
  )
}

export default App
