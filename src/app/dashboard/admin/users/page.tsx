import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { User, Roadmap, Assessment } from '@/models'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') redirect('/dashboard')

  await dbConnect()

  const students = await User.find({ role: 'student' })
    .sort({ createdAt: -1 })
    .lean()

  const assessments = await Assessment.find().lean()
  const roadmaps    = await Roadmap.find().lean()

  const statsMap: Record<string, { score?: number; level?: string; progress?: number }> = {}
  assessments.forEach((a: any) => {
    statsMap[a.userId.toString()] = { score: a.score, level: a.level }
  })
  roadmaps.forEach((r: any) => {
    const uid = r.userId.toString()
    if (statsMap[uid]) statsMap[uid].progress = r.totalProgress
    else statsMap[uid] = { progress: r.totalProgress }
  })

  const levelMeta: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    beginner:     { label: 'Beginner',     bg: 'rgba(34,197,94,0.1)', color: '#22c55e', dot: '#22c55e' },
    intermediate: { label: 'Intermediate', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', dot: '#f59e0b' },
    advanced:     { label: 'Advanced',     bg: 'rgba(168,85,247,0.1)', color: '#a855f7', dot: '#a855f7' },
  }

  const totalStudents   = students.length
  const testedStudents  = students.filter((s: any) => statsMap[s._id.toString()]?.score != null).length
  const avgProgress     = (() => {
    const all = students.map((s: any) => statsMap[s._id.toString()]?.progress).filter((p): p is number => p != null)
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0
  })()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#161615',
        padding: '32px 24px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .students-table tr:hover td { background: #1e1e1c; }
        .students-table td, .students-table th { transition: background 0.1s; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e2df', letterSpacing: '-0.5px', margin: 0 }}>
            Students
          </h1>
          <p style={{ color: '#6b6b67', marginTop: 4, fontSize: 14 }}>
            {totalStudents} registered student{totalStudents !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stat bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Students', value: totalStudents, pct: null, color: '#e2e2df' },
            { label: 'Assessed',       value: testedStudents, pct: totalStudents ? Math.round(testedStudents / totalStudents * 100) : 0, color: '#e2e2df' },
            { label: 'Avg Progress',   value: `${avgProgress}%`, pct: avgProgress, color: '#e2e2df' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#1e1e1c',
              border: '1px solid #2a2a28',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6b6b67', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#e2e2df' }}>{stat.value}</span>
              </div>
              {stat.pct != null && (
                <div style={{ marginTop: 10, background: '#2a2a28', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stat.pct}%`, background: '#b5cc2e', borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{
          background: '#1e1e1c',
          border: '1px solid #2a2a28',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          <table className="students-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1a1a19', borderBottom: '1px solid #2a2a28' }}>
                {['Student', 'Level', 'Test Score', 'Progress', 'Joined'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 18px',
                    fontSize: 11, fontWeight: 600, color: '#6b6b67',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s: any, i: number) => {
                const stat  = statsMap[s._id.toString()] || {}
                const lvl   = levelMeta[stat.level || '']
                const isLast = i === students.length - 1
                return (
                  <tr key={s._id}>
                    {/* Student */}
                    <td style={{ padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid #2a2a28' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(181,204,46,0.1)', border: '1px solid rgba(181,204,46,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14, color: '#b5cc2e', flexShrink: 0,
                        }}>
                          {s.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#e2e2df', margin: 0 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: '#6b6b67', margin: 0 }}>{s.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td style={{ padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid #2a2a28' }}>
                      {lvl ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: lvl.bg, color: lvl.color,
                          border: `1px solid ${lvl.dot}44`,
                          borderRadius: 99, fontSize: 12, fontWeight: 500,
                          padding: '3px 10px',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: lvl.dot, display: 'inline-block' }} />
                          {lvl.label}
                        </span>
                      ) : (
                        <span style={{ color: '#6b6b67', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Score */}
                    <td style={{ padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid #2a2a28' }}>
                      {stat.score != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 500,
                            fontSize: 14,
                            color: stat.score >= 80 ? '#22c55e' : stat.score >= 50 ? '#f59e0b' : '#ef4444',
                          }}>
                            {stat.score}%
                          </span>
                          <div style={{ width: 48, height: 4, background: '#2a2a28', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              width: `${stat.score}%`,
                              background: stat.score >= 80 ? '#22c55e' : stat.score >= 50 ? '#f59e0b' : '#ef4444',
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#6b6b67', fontSize: 12 }}>Not taken</span>
                      )}
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid #2a2a28' }}>
                      {stat.progress != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 72, height: 6, background: '#2a2a28', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              width: `${stat.progress}%`,
                              background: '#b5cc2e',
                            }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#6b6b67', fontFamily: "'DM Mono', monospace" }}>
                            {stat.progress}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#6b6b67', fontSize: 12 }}>No roadmap</span>
                      )}
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid #2a2a28', color: '#6b6b67', fontSize: 12 }}>
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}

              {students.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 0', color: '#6b6b67', fontSize: 14 }}>
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
