import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Roadmap, User } from '@/models'
import Link from 'next/link'
import { BookOpen, Map, TrendingUp, ChevronRight, Zap } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === 'admin') {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard/admin/courses')
  }

  await dbConnect()
  const roadmaps = await Roadmap.find({ userId: session!.user.id })
    .populate('courseId', 'title icon color slug')
    .lean()

  const user = await User.findById(session!.user.id).lean()
  const enrolledCount  = (user as any)?.enrolledCourses?.length || 0
  const completedSteps = roadmaps.reduce((acc: number, r: any) =>
    acc + (r.steps?.filter((s: any) => s.isCompleted).length || 0), 0)
  const firstName = session!.user.name?.split(' ')[0]

  const stats = [
    { label: 'Courses Enrolled', value: enrolledCount,    icon: BookOpen,    color: '#b5cc2e',   bg: 'rgba(181,204,46,0.08)',  border: 'rgba(181,204,46,0.2)' },
    { label: 'Steps Completed',  value: completedSteps,   icon: TrendingUp,  color: '#4ade80',   bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)' },
    { label: 'Active Roadmaps',  value: roadmaps.length,  icon: Map,         color: '#c084fc',   bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
  ]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 30, fontWeight: 800,
          color: '#e2e2df', letterSpacing: '-0.5px', margin: 0,
        }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: '#6b6b67', marginTop: 6, fontSize: 14, fontWeight: 300 }}>
          Here&apos;s your learning overview.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} style={{
            background: '#161615', border: `1px solid #1e1e1c`,
            borderRadius: 14, padding: '24px',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: bg, border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon size={17} color={color} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#e2e2df', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{value}</p>
            <p style={{ fontSize: 13, color: '#6b6b67', marginTop: 4, fontWeight: 300 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Roadmaps */}
      {roadmaps.length > 0 ? (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2df', marginBottom: 16 }}>Your Roadmaps</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {roadmaps.map((r: any) => (
              <Link
                key={r._id}
                href={`/dashboard/roadmap?courseId=${r.courseId._id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: '#161615', border: '1px solid #1e1e1c',
                  borderRadius: 14, padding: '20px 24px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                className="roadmap-row"
              >
                <div style={{ fontSize: 32, flexShrink: 0 }}>{r.courseId.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#e2e2df', margin: 0, fontSize: 14 }}>
                    {r.courseId.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <div style={{ flex: 1, height: 4, background: '#1e1e1c', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${r.totalProgress}%`,
                        background: 'linear-gradient(90deg, #b5cc2e, #d4e850)',
                        borderRadius: 999, transition: 'width 0.7s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#6b6b67', flexShrink: 0 }}>{r.totalProgress}%</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b6b67', marginTop: 6, textTransform: 'capitalize' }}>
                    Level: {r.studentLevel} · {r.steps?.filter((s: any) => s.isCompleted).length}/{r.steps?.length} steps
                  </p>
                </div>
                <ChevronRight size={16} color="#3a3a37" style={{ flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#161615', border: '1px solid #1e1e1c',
          borderRadius: 16, padding: '64px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e2df', marginBottom: 8, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Start your first course
          </h2>
          <p style={{ color: '#6b6b67', marginBottom: 24, fontSize: 14, maxWidth: 360, margin: '0 auto 24px', fontWeight: 300, lineHeight: 1.6 }}>
            Pick a course, take the AI assessment, and get your personalized learning roadmap.
          </p>
          <Link href="/dashboard/courses" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#b5cc2e', color: '#111', borderRadius: 9,
            padding: '10px 20px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', transition: 'background 0.15s',
          }}>
            <Zap size={14} />
            Browse Courses
          </Link>
        </div>
      )}

      <style>{`
        .roadmap-row:hover { border-color: rgba(181,204,46,0.3) !important; }
      `}</style>
    </div>
  )
}
