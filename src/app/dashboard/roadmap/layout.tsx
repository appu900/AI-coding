import { Suspense } from 'react'
import RoadmapPage from './page'

export default function RoadmapLayout() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading roadmap…</div>
      </div>
    }>
      <RoadmapPage />
    </Suspense>
  )
}
