import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Course, Roadmap } from '@/models'
import { EnrollButton } from '@/components/student/EnrollButton'

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  await dbConnect()

  const courses  = await Course.find({ isPublished: true }).lean()
  const roadmaps = await Roadmap.find({ userId: session!.user.id }).lean()
  const enrolledCourseIds = roadmaps.map((r: any) => r.courseId.toString())

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 30, fontWeight: 800,
          color: '#e2e2df', letterSpacing: '-0.5px', margin: 0,
        }}>Choose a Course</h1>
        <p style={{ color: '#6b6b67', marginTop: 6, fontSize: 14, fontWeight: 300 }}>
          Select a course, take the AI assessment, and get your personalized roadmap.
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{
          background: '#161615', border: '1px solid #1e1e1c',
          borderRadius: 16, padding: '64px 32px', textAlign: 'center',
          color: '#6b6b67', fontSize: 14,
        }}>
          No courses available yet. Check back soon!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {courses.map((c: any) => {
            const isEnrolled = enrolledCourseIds.includes(c._id.toString())
            return (
              <div key={c._id} style={{
                background: '#161615', border: '1px solid #1e1e1c',
                borderRadius: 16, padding: '24px',
                transition: 'border-color 0.15s',
              }}
              className="course-card"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    fontSize: 36, flexShrink: 0,
                    width: 52, height: 52,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1e1e1c',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e2df', margin: 0 }}>{c.title}</h2>
                    <p style={{ fontSize: 13, color: '#6b6b67', marginTop: 4, lineHeight: 1.5, fontWeight: 300 }}>{c.description}</p>
                  </div>
                </div>

                {c.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {c.tags.map((tag: string) => (
                      <span key={tag} style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 999,
                        background: 'rgba(181,204,46,0.08)',
                        border: '1px solid rgba(181,204,46,0.2)',
                        color: '#b5cc2e', fontWeight: 500,
                      }}>{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ height: 1, background: '#1e1e1c', marginBottom: 16 }} />
                <EnrollButton
                  courseId={c._id.toString()}
                  courseName={c.title}
                  isEnrolled={isEnrolled}
                />
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .course-card:hover { border-color: rgba(181,204,46,0.25) !important; }
      `}</style>
    </div>
  )
}
