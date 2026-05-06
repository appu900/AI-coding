'use client'
import { useRouter } from 'next/navigation'
import { Zap, CheckCircle } from 'lucide-react'

export function EnrollButton({
  courseId,
  courseName,
  isEnrolled,
}: {
  courseId: string
  courseName?: string
  isEnrolled: boolean
}) {
  const router = useRouter()

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/dashboard/roadmap?courseId=${courseId}`)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '10px 0', borderRadius: 9,
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
          color: '#4ade80', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
        }}
        className="enroll-btn-done"
      >
        <CheckCircle size={14} />
        View My Roadmap
      </button>
    )
  }

  return (
    <button
      onClick={() => router.push(`/dashboard/assessment?courseId=${courseId}`)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '10px 0', borderRadius: 9,
        background: '#b5cc2e', color: '#111',
        border: 'none', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
      }}
      className="enroll-btn"
    >
      <Zap size={14} />
      Start AI Assessment
      <style>{`
        .enroll-btn:hover { background: #c8dc45 !important; }
        .enroll-btn-done:hover { background: rgba(74,222,128,0.14) !important; }
      `}</style>
    </button>
  )
}
