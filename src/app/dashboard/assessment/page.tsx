'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle, XCircle, ChevronRight, Brain } from 'lucide-react'

type MCQ = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  difficulty: string
  topic: string
}

type Phase = 'loading' | 'testing' | 'submitting' | 'results'

const levelStyle: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)' },
  intermediate: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
  advanced:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.25)' },
}

export default function AssessmentPage() {
  const router   = useRouter()
  const params   = useSearchParams()
  const courseId = params.get('courseId') || ''

  const [phase, setPhase]         = useState<Phase>('loading')
  const [questions, setQuestions] = useState<MCQ[]>([])
  const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState<Record<string, number>>({})
  const [selected, setSelected]   = useState<number | null>(null)
  const [results, setResults]     = useState<any>(null)

  const loadQuestions = useCallback(async () => {
    const res  = await fetch(`/api/ai/assessment?courseId=${courseId}`)
    const data = await res.json()
    if (!res.ok) { toast.error('Failed to load questions'); return }
    setQuestions(data.questions)
    setPhase('testing')
  }, [courseId])

  useEffect(() => { if (courseId) loadQuestions() }, [courseId, loadQuestions])

  function handleAnswer(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => {
      const newAnswers = { ...answers, [questions[current].id]: idx }
      setAnswers(newAnswers)
      if (current + 1 < questions.length) {
        setCurrent(current + 1)
        setSelected(null)
      } else {
        submitTest(newAnswers)
      }
    }, 800)
  }

  async function submitTest(finalAnswers: Record<string, number>) {
    setPhase('submitting')
    const res  = await fetch('/api/ai/assessment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, questions, answers: finalAnswers }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error('Submission failed'); return }
    setResults(data)
    setPhase('results')
  }

  async function generateRoadmap() {
    setPhase('submitting')
    const res = await fetch('/api/ai/roadmap', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, assessmentId: results.assessmentId }),
    })
    if (!res.ok) { toast.error('Roadmap generation failed'); setPhase('results'); return }
    toast.success('Roadmap created!')
    router.push(`/dashboard/roadmap?courseId=${courseId}`)
  }

  /* ── Loading ── */
  if (phase === 'loading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(181,204,46,0.1)', border: '1px solid rgba(181,204,46,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <Brain size={32} color="#b5cc2e" />
      </div>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#e2e2df', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        AI is preparing your assessment…
      </p>
      <p style={{ fontSize: 13, color: '#6b6b67', margin: 0, fontWeight: 300 }}>Generating 10 personalised questions</p>
    </div>
  )

  /* ── Submitting ── */
  if (phase === 'submitting') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <Loader2 size={36} color="#b5cc2e" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: 16, fontWeight: 600, color: '#e2e2df', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        {results ? 'Building your personalized roadmap…' : 'Analysing your answers…'}
      </p>
    </div>
  )

  /* ── Results ── */
  if (phase === 'results' && results) {
    const ls = levelStyle[results.level]
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ background: '#161615', border: '1px solid #1e1e1c', borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>
            {results.score >= 70 ? '🏆' : results.score >= 40 ? '📈' : '🌱'}
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, color: '#e2e2df', margin: '0 0 8px' }}>
            Assessment Complete!
          </h1>
          <p style={{ fontSize: 52, fontWeight: 800, color: '#b5cc2e', margin: '16px 0', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {results.score}%
          </p>
          {ls && (
            <span style={{
              fontSize: 13, padding: '5px 16px', borderRadius: 999,
              background: ls.bg, border: `1px solid ${ls.border}`, color: ls.color, fontWeight: 500,
            }}>
              {results.level.charAt(0).toUpperCase() + results.level.slice(1)} Level
            </span>
          )}

          {results.weakTopics?.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'left', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#f87171', margin: '0 0 10px' }}>Areas to improve:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.weakTopics.map((t: string) => (
                  <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {results.strongTopics?.length > 0 && (
            <div style={{ marginTop: 10, textAlign: 'left', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#4ade80', margin: '0 0 10px' }}>Your strengths:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.strongTopics.map((t: string) => (
                  <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#86efac' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={generateRoadmap} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', marginTop: 24,
            background: '#b5cc2e', color: '#111',
            border: 'none', borderRadius: 9,
            padding: '13px 0', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Brain size={15} />
            Generate My Personalized Roadmap
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  /* ── Testing ── */
  const q        = questions[current]
  const progress = (current / questions.length) * 100
  const dls      = levelStyle[q?.difficulty]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#6b6b67' }}>Question {current + 1} of {questions.length}</span>
          {dls && (
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: dls.bg, border: `1px solid ${dls.border}`, color: dls.color, fontWeight: 500,
            }}>{q.difficulty}</span>
          )}
        </div>
        <div style={{ height: 4, background: '#1e1e1c', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #b5cc2e, #d4e850)',
            borderRadius: 999, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: '#161615', border: '1px solid #1e1e1c', borderRadius: 14, padding: '24px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#b5cc2e', fontFamily: 'monospace', margin: '0 0 10px' }}># {q.topic}</p>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e2df', lineHeight: 1.6, margin: 0 }}>{q.question}</h2>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, idx) => {
          const isSelected = selected === idx
          const isCorrect  = selected !== null && idx === q.correctIndex
          const isWrong    = isSelected && idx !== q.correctIndex

          return (
            <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 12, fontSize: 13,
              textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'inherit', width: '100%',
              transition: 'all 0.2s',
              ...(selected === null ? {
                background: '#161615', border: '1px solid #1e1e1c', color: '#e2e2df',
              } : isCorrect ? {
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.4)', color: '#e2e2df',
              } : isWrong ? {
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.4)', color: '#e2e2df',
              } : {
                background: '#161615', border: '1px solid #1e1e1c', color: '#e2e2df', opacity: 0.45,
              }),
            }}
            className={selected === null ? 'option-btn' : ''}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                ...(selected === null ? { border: '1px solid #1e1e1c', color: '#6b6b67', background: '#111110' }
                  : isCorrect ? { border: '1px solid rgba(74,222,128,0.5)', color: '#4ade80', background: 'rgba(74,222,128,0.1)' }
                  : isWrong   ? { border: '1px solid rgba(248,113,113,0.5)', color: '#f87171', background: 'rgba(248,113,113,0.1)' }
                  : { border: '1px solid #1e1e1c', color: '#6b6b67', background: '#111110' }),
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {isCorrect && <CheckCircle size={15} color="#4ade80" style={{ flexShrink: 0 }} />}
              {isWrong   && <XCircle    size={15} color="#f87171" style={{ flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>

      <style>{`
        .option-btn:hover { border-color: rgba(181,204,46,0.3) !important; background: rgba(181,204,46,0.04) !important; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </div>
  )
}
