'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Circle, Lock, Clock, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import StepLessonModal from '@/components/coding/StepLessonModal'

type RoadmapStep = {
  stepId: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  order: number
  estimatedHours: number
  topics: string[]
  isCompleted: boolean
}

type Roadmap = {
  _id: string
  courseId: { _id: string; title: string; icon: string }
  studentLevel: string
  assessmentScore: number
  totalProgress: number
  weakTopics: string[]
  steps: RoadmapStep[]
}

const levelStyle: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)' },
  intermediate: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
  advanced:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.25)' },
}

export default function RoadmapPage() {
  const params   = useSearchParams()
  const courseId = params.get('courseId')

  const [roadmaps, setRoadmaps]     = useState<Roadmap[]>([])
  const [selected, setSelected]     = useState<Roadmap | null>(null)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [marking, setMarking]       = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<RoadmapStep | null>(null)

  useEffect(() => {
    fetch(`/api/ai/roadmap${courseId ? `?courseId=${courseId}` : ''}`)
      .then(r => r.json())
      .then(d => {
        setRoadmaps(d.roadmaps || [])
        setSelected(d.roadmaps?.[0] || null)
        setLoading(false)
      })
  }, [courseId])

  async function markComplete(stepId: string) {
    if (!selected) return
    setMarking(stepId)
    await fetch('/api/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: selected.courseId._id, stepId }),
    })
    setSelected(prev => {
      if (!prev) return prev
      return {
        ...prev,
        steps: prev.steps.map(s => s.stepId === stepId ? { ...s, isCompleted: true } : s),
        totalProgress: Math.round(
          ((prev.steps.filter(s => s.isCompleted).length + 1) / prev.steps.length) * 100
        ),
      }
    })
    toast.success('Step completed!')
    setMarking(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
      <Zap size={40} color="#b5cc2e" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
      <p style={{ color: '#6b6b67', fontSize: 14 }}>Loading your roadmap…</p>
    </div>
  )

  if (roadmaps.length === 0) return (
    <div style={{
      maxWidth: 520, margin: '0 auto',
      background: '#161615', border: '1px solid #1e1e1c',
      borderRadius: 16, padding: '64px 32px', textAlign: 'center',
    }}>
      <p style={{ fontSize: 44, marginBottom: 16 }}>🗺️</p>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e2df', marginBottom: 8, fontFamily: "'Bricolage Grotesque', sans-serif" }}>No roadmap yet</h2>
      <p style={{ color: '#6b6b67', fontSize: 14, marginBottom: 24, fontWeight: 300 }}>Enroll in a course and take the AI assessment to get your personalized roadmap.</p>
      <a href="/dashboard/courses" style={{
        display: 'inline-block', background: '#b5cc2e', color: '#111',
        borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 600,
        textDecoration: 'none',
      }}>Browse Courses</a>
    </div>
  )

  const r = selected
  if (!r) return null
  const completedCount = r.steps.filter(s => s.isCompleted).length

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Course selector */}
      {roadmaps.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {roadmaps.map(rm => (
            <button key={rm._id} onClick={() => setSelected(rm)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 9, fontSize: 13,
              whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
              ...(selected?._id === rm._id ? {
                background: 'rgba(181,204,46,0.1)',
                border: '1px solid rgba(181,204,46,0.25)',
                color: '#b5cc2e',
              } : {
                background: '#161615',
                border: '1px solid #1e1e1c',
                color: '#6b6b67',
              }),
            }}>
              {rm.courseId.icon} {rm.courseId.title}
            </button>
          ))}
        </div>
      )}

      {/* Header card */}
      <div style={{
        background: '#161615', border: '1px solid #1e1e1c',
        borderRadius: 16, padding: '24px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ fontSize: 38, flexShrink: 0 }}>{r.courseId.icon}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e2e2df', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {r.courseId.title} Roadmap
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {levelStyle[r.studentLevel] && (
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 999,
                  background: levelStyle[r.studentLevel].bg,
                  border: `1px solid ${levelStyle[r.studentLevel].border}`,
                  color: levelStyle[r.studentLevel].color, fontWeight: 500,
                }}>
                  Started as {r.studentLevel}
                </span>
              )}
              <span style={{ fontSize: 12, color: '#6b6b67' }}>Assessment score: {r.assessmentScore}%</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b6b67', marginBottom: 6 }}>
                <span>{completedCount} of {r.steps.length} steps completed</span>
                <span style={{ color: '#e2e2df', fontWeight: 500 }}>{r.totalProgress}%</span>
              </div>
              <div style={{ height: 6, background: '#1e1e1c', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${r.totalProgress}%`,
                  background: 'linear-gradient(90deg, #b5cc2e, #d4e850)',
                  borderRadius: 999, transition: 'width 0.7s ease',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {r.steps.map((step, idx) => {
          const isPrevDone = idx === 0 || r.steps[idx - 1].isCompleted
          const isLocked   = !isPrevDone && !step.isCompleted
          const isOpen     = expanded === step.stepId
          const ls         = levelStyle[step.level]

          return (
            <div key={step.stepId} style={{
              borderRadius: 14,
              transition: 'all 0.2s',
              ...(step.isCompleted ? {
                background: 'rgba(74,222,128,0.04)',
                border: '1px solid rgba(74,222,128,0.15)',
              } : isLocked ? {
                background: '#161615',
                border: '1px solid #1e1e1c',
                opacity: 0.45,
              } : {
                background: '#161615',
                border: '1px solid #1e1e1c',
              }),
            }}
            className={!step.isCompleted && !isLocked ? 'step-card' : ''}
            >
              {/* ── Row (click = open modal for unlocked steps) ── */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px',
                  cursor: isLocked ? 'default' : 'pointer',
                }}
                onClick={() => {
                  if (isLocked) return
                  // open modal directly — no inline expand needed
                  setActiveStep(step)
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {step.isCompleted
                    ? <CheckCircle size={20} color="#4ade80" />
                    : isLocked
                    ? <Lock size={16} color="#3a3a37" />
                    : <Circle size={20} color="#3a3a37" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#6b6b67', fontFamily: 'monospace' }}>Step {step.order}</span>
                    {ls && (
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        background: ls.bg, border: `1px solid ${ls.border}`,
                        color: ls.color, fontWeight: 500,
                      }}>{step.level}</span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, color: step.isCompleted ? '#4ade80' : '#e2e2df' }}>
                    {step.title}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b6b67' }}>
                    <Clock size={11} />{step.estimatedHours}h
                  </span>
                  {/* Show a small "open" hint for unlocked steps */}
                  {!isLocked && !step.isCompleted && (
                    <span style={{
                      fontSize: 10, fontFamily: 'monospace',
                      color: '#b5cc2e', border: '1px solid rgba(181,204,46,0.25)',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      Start →
                    </span>
                  )}
                  {step.isCompleted && (
                    <span style={{
                      fontSize: 10, fontFamily: 'monospace',
                      color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      Done ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modal ── */}
      {activeStep && selected && (
        <StepLessonModal
          step={activeStep}
          courseId={selected.courseId._id}
          courseName={selected.courseId.title}
          onClose={() => setActiveStep(null)}
          onComplete={(stepId) => {
            markComplete(stepId)
            setActiveStep(null)
          }}
        />
      )}

      <style>{`
        .step-card:hover { border-color: rgba(181,204,46,0.25) !important; }
      `}</style>
    </div>
  )
}
