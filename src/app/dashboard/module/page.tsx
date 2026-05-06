'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Code2, Lightbulb, Dumbbell, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Submodule = {
  _id: string
  title: string
  content: string
  codeExample?: string
  keyPoints: string[]
  exercisePrompt?: string
  order: number
}

type Module = {
  _id: string
  title: string
  description: string
  level: string
  submodules: Submodule[]
  isGenerated: boolean
}

const levelStyle: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)' },
  intermediate: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)' },
  advanced:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
}

export default function ModulePage() {
  const params   = useSearchParams()
  const moduleId = params.get('id')
  const courseId = params.get('courseId')

  const [module_, setModule]        = useState<Module | null>(null)
  const [activeSubId, setActiveSub] = useState<string | null>(null)
  const [completed, setCompleted]   = useState<Set<string>>(new Set())
  const [saving, setSaving]         = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!moduleId) return
    fetch(`/api/modules/${moduleId}`)
      .then(r => r.json())
      .then(d => {
        setModule(d.module)
        setActiveSub(d.module?.submodules?.[0]?._id || null)
        setLoading(false)
      })
  }, [moduleId])

  async function markSubmoduleComplete(subId: string) {
    if (completed.has(subId) || !courseId) return
    setSaving(subId)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, moduleId, submoduleId: subId, status: 'completed', timeSpentMin: 10 }),
    })
    setCompleted(s => new Set([...s, subId]))
    toast.success('Marked as complete!')
    setSaving(null)
    const subs = module_?.submodules || []
    const idx  = subs.findIndex(s => s._id === subId)
    if (idx < subs.length - 1) setActiveSub(subs[idx + 1]._id)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <Loader2 size={32} color="#b5cc2e" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  )
  if (!module_) return (
    <div style={{ textAlign: 'center', color: '#6b6b67', marginTop: 80, fontSize: 14 }}>Module not found.</div>
  )

  const activeSub = module_.submodules.find(s => s._id === activeSubId)
  const ls        = levelStyle[module_.level]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24 }}>
      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0 }}>
        <div style={{
          background: '#161615', border: '1px solid #1e1e1c',
          borderRadius: 14, padding: '20px 16px',
          position: 'sticky', top: 32,
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#e2e2df', margin: '0 0 8px' }}>{module_.title}</h2>
            {ls && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 999,
                background: ls.bg, border: `1px solid ${ls.border}`, color: ls.color, fontWeight: 500,
              }}>{module_.level}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {module_.submodules.map((sub, idx) => {
              const isDone   = completed.has(sub._id)
              const isActive = activeSubId === sub._id
              return (
                <button key={sub._id} onClick={() => setActiveSub(sub._id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, fontSize: 12,
                  textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  ...(isActive ? {
                    background: 'rgba(181,204,46,0.1)',
                    border: '1px solid rgba(181,204,46,0.2)',
                    color: '#b5cc2e',
                  } : {
                    background: 'none',
                    border: '1px solid transparent',
                    color: '#6b6b67',
                  }),
                }}
                className={!isActive ? 'sub-btn' : ''}
                >
                  {isDone
                    ? <CheckCircle size={13} color="#4ade80" style={{ flexShrink: 0 }} />
                    : <span style={{ width: 16, flexShrink: 0, fontSize: 11, color: '#6b6b67', fontFamily: 'monospace', textAlign: 'center' }}>{idx + 1}</span>}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.title}</span>
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e1e1c' }}>
            <div style={{ height: 4, background: '#1e1e1c', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(completed.size / module_.submodules.length) * 100}%`,
                background: 'linear-gradient(90deg, #b5cc2e, #d4e850)',
                borderRadius: 999, transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{ fontSize: 11, color: '#6b6b67', marginTop: 6 }}>{completed.size}/{module_.submodules.length} completed</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeSub ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 24, fontWeight: 800, color: '#e2e2df',
                letterSpacing: '-0.3px', margin: 0,
              }}>{activeSub.title}</h1>
              {module_.isGenerated && (
                <span style={{ fontSize: 12, color: '#b5cc2e', marginTop: 4, display: 'block' }}>✦ AI Generated Content</span>
              )}
            </div>

            {/* Lesson */}
            <div style={{ background: '#161615', border: '1px solid #1e1e1c', borderRadius: 14, padding: 24, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontWeight: 500, color: '#c8c8c4' }}>
                <BookOpen size={14} color="#b5cc2e" /> Lesson
              </div>
              <div className="prose-dark" style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.75 }}>
                {activeSub.content}
              </div>
            </div>

            {/* Key Points */}
            {activeSub.keyPoints?.length > 0 && (
              <div style={{
                background: 'rgba(181,204,46,0.04)', border: '1px solid rgba(181,204,46,0.15)',
                borderRadius: 14, padding: 24, marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, fontWeight: 500, color: '#b5cc2e' }}>
                  <Lightbulb size={14} /> Key Takeaways
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeSub.keyPoints.map((pt, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#c8c8c4' }}>
                      <ChevronRight size={13} color="#b5cc2e" style={{ flexShrink: 0, marginTop: 2 }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Example */}
            {activeSub.codeExample && (
              <div style={{ background: '#161615', border: '1px solid #1e1e1c', borderRadius: 14, padding: 24, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, fontWeight: 500, color: '#c8c8c4' }}>
                  <Code2 size={14} color="#fbbf24" /> Code Example
                </div>
                <pre style={{ margin: 0, fontSize: 13, overflowX: 'auto', background: '#111110', border: '1px solid #1e1e1c', borderRadius: 10, padding: 16 }}>
                  <code style={{ color: '#c8c8c4', fontFamily: 'monospace' }}>{activeSub.codeExample}</code>
                </pre>
              </div>
            )}

            {/* Exercise */}
            {activeSub.exercisePrompt && (
              <div style={{
                background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)',
                borderRadius: 14, padding: 24, marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 500, color: '#4ade80' }}>
                  <Dumbbell size={14} /> Practice Exercise
                </div>
                <p style={{ fontSize: 13, color: '#c8c8c4', margin: 0, lineHeight: 1.7 }}>{activeSub.exercisePrompt}</p>
              </div>
            )}

            {/* Complete button */}
            {!completed.has(activeSub._id) ? (
              <button
                onClick={() => markSubmoduleComplete(activeSub._id)}
                disabled={saving === activeSub._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#b5cc2e', color: '#111',
                  border: 'none', borderRadius: 9,
                  padding: '11px 22px', fontSize: 13, fontWeight: 600,
                  cursor: saving === activeSub._id ? 'not-allowed' : 'pointer',
                  opacity: saving === activeSub._id ? 0.6 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {saving === activeSub._id
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  : <><CheckCircle size={14} /> Mark as Complete</>}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontSize: 14, fontWeight: 500 }}>
                <CheckCircle size={16} /> Completed!
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b6b67', marginTop: 80, fontSize: 14 }}>
            Select a submodule to start learning.
          </div>
        )}
      </div>

      <style>{`
        .sub-btn:hover { color: #e2e2df !important; background: rgba(255,255,255,0.04) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
