import { Suspense } from 'react'
import AssessmentPage from './page'

export default function AssessmentLayout() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading assessment…</div>
      </div>
    }>
      <AssessmentPage />
    </Suspense>
  )
}
