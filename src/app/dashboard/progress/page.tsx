'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock, TrendingUp } from 'lucide-react'

type Roadmap = {
  _id: string
  courseId: { _id: string; title: string; icon: string }
  totalProgress: number
  studentLevel: string
  steps: { stepId: string; title: string; level: string; isCompleted: boolean; estimatedHours: number }[]
}

const levelStyle: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)' },
  intermediate: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)' },
  advanced:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
}

export default function ProgressPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/ai/roadmap')
      .then(r => r.json())
      .then(d => { setRoadmaps(d.roadmaps || []); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <TrendingUp size={36} color="#b5cc2e" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
    </div>
  )

  if (roadmaps.length === 0) return (
    <div style={{
      maxWidth: 520, margin: '0 auto',
      background: '#161615', border: '1px solid #1e1e1c',
      borderRadius: 16, padding: '64px 32px', textAlign: 'center',
    }}>
      <TrendingUp size={44} color="#3a3a37" style={{ margin: '0 auto 16px' }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e2df', marginBottom: 8, fontFamily: "'Bricolage Grotesque', sans-serif" }}>No progress yet</h2>
      <p style={{ color: '#6b6b67', fontSize: 14, marginBottom: 24, fontWeight: 300 }}>Enroll in a course to start tracking your progress.</p>
      <a href="/dashboard/courses" style={{
        display: 'inline-block', background: '#b5cc2e', color: '#111',
        borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 600,
        textDecoration: 'none',
      }}>Browse Courses</a>
    </div>
  )

  const totalCompleted = roadmaps.reduce((acc, r) => acc + r.steps.filter(s => s.isCompleted).length, 0)
  const totalSteps     = roadmaps.reduce((acc, r) => acc + r.steps.length, 0)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 30, fontWeight: 800,
          color: '#e2e2df', letterSpacing: '-0.5px', margin: 0,
        }}>My Progress</h1>
        <p style={{ color: '#6b6b67', marginTop: 6, fontSize: 14, fontWeight: 300 }}>
          Track your learning journey across all courses.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Courses Active',   value: roadmaps.length,  color: '#b5cc2e' },
          { label: 'Steps Completed',  value: totalCompleted,   color: '#4ade80' },
          { label: 'Total Steps',      value: totalSteps,       color: '#e2e2df' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#161615', border: '1px solid #1e1e1c', borderRadius: 14, padding: 24 }}>
            <p style={{ fontSize: 13, color: '#6b6b67', margin: '0 0 8px', fontWeight: 300 }}>{label}</p>
            <p style={{ fontSize: 30, fontWeight: 800, color, margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Per-course breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {roadmaps.map(roadmap => {
          const completed = roadmap.steps.filter(s => s.isCompleted).length
          const total     = roadmap.steps.length
          const hoursLeft = roadmap.steps.filter(s => !s.isCompleted).reduce((acc, s) => acc + s.estimatedHours, 0)
          const ls        = levelStyle[roadmap.studentLevel]

          return (
            <div key={roadmap._id} style={{ background: '#161615', border: '1px solid #1e1e1c', borderRadius: 16, padding: 28 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 36, flexShrink: 0 }}>{roadmap.courseId.icon}</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e2df', margin: 0 }}>{roadmap.courseId.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap', fontSize: 12, color: '#6b6b67' }}>
                    {ls && <span style={{ color: ls.color, fontWeight: 500, textTransform: 'capitalize' }}>{roadmap.studentLevel}</span>}
                    <span>·</span>
                    <span>{completed}/{total} steps</span>
                    {hoursLeft > 0 && (
                      <>
                        <span>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> ~{hoursLeft}h remaining
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#e2e2df', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{roadmap.totalProgress}%</p>
                  <p style={{ fontSize: 11, color: '#6b6b67', margin: 0 }}>complete</p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: '#1e1e1c', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{
                  height: '100%', width: `${roadmap.totalProgress}%`,
                  background: 'linear-gradient(90deg, #b5cc2e, #d4e850)',
                  borderRadius: 999, transition: 'width 0.7s ease',
                }} />
              </div>

              {/* Steps grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 20 }}>
                {roadmap.steps.map(step => (
                  <div key={step.stepId} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10, border: '1px solid',
                    ...(step.isCompleted
                      ? { background: 'rgba(74,222,128,0.04)', borderColor: 'rgba(74,222,128,0.15)' }
                      : { background: '#111110', borderColor: '#1e1e1c' }),
                  }}>
                    {step.isCompleted
                      ? <CheckCircle size={14} color="#4ade80" style={{ flexShrink: 0 }} />
                      : <Circle size={14} color="#3a3a37" style={{ flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: step.isCompleted ? '#4ade80' : '#c8c8c4' }}>
                        {step.title}
                      </p>
                      <p style={{ fontSize: 11, color: '#6b6b67', margin: 0, textTransform: 'capitalize' }}>{step.level}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#6b6b67', flexShrink: 0 }}>{step.estimatedHours}h</span>
                  </div>
                ))}
              </div>

              {/* Level breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {['beginner', 'intermediate', 'advanced'].map(level => {
                  const lvlSteps     = roadmap.steps.filter(s => s.level === level)
                  const lvlCompleted = lvlSteps.filter(s => s.isCompleted).length
                  const pct          = lvlSteps.length > 0 ? Math.round((lvlCompleted / lvlSteps.length) * 100) : 0
                  const ls2          = levelStyle[level]

                  return (
                    <div key={level} style={{
                      borderRadius: 10, border: `1px solid ${ls2.border}`,
                      background: ls2.bg, padding: '12px 16px', textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: ls2.color, textTransform: 'capitalize', margin: '0 0 4px' }}>{level}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: '#e2e2df', margin: '0 0 2px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>{pct}%</p>
                      <p style={{ fontSize: 11, color: '#6b6b67', margin: 0 }}>{lvlCompleted}/{lvlSteps.length} steps</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
