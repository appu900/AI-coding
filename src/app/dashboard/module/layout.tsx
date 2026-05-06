import { Suspense } from 'react'
import ModulePage from './page'

export default function ModuleLayout() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading module…</div>
      </div>
    }>
      <ModulePage />
    </Suspense>
  )
}
