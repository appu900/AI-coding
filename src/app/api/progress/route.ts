import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Progress, Roadmap } from '@/models'

// GET /api/progress?courseId=xxx → get all progress for a course
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courseId = req.nextUrl.searchParams.get('courseId')
  await dbConnect()

  const query: any = { userId: session.user.id }
  if (courseId) query.courseId = courseId

  const progress = await Progress.find(query)
  return NextResponse.json({ progress })
}

// POST /api/progress → mark a submodule complete
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, moduleId, submoduleId, status, timeSpentMin } = await req.json()

  await dbConnect()

  const progress = await Progress.findOneAndUpdate(
    { userId: session.user.id, courseId, moduleId, submoduleId },
    {
      status,
      timeSpentMin,
      completedAt: status === 'completed' ? new Date() : undefined,
    },
    { upsert: true, new: true }
  )

  // Update roadmap total progress
  if (status === 'completed') {
    const allProgress = await Progress.find({
      userId: session.user.id,
      courseId,
      status: 'completed',
    })

    const roadmap = await Roadmap.findOne({ userId: session.user.id, courseId })
    if (roadmap) {
      const totalSteps = roadmap.steps.length
      const completedSteps = roadmap.steps.filter((s: any) => s.isCompleted).length
      const totalProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
      roadmap.totalProgress = totalProgress
      await roadmap.save()
    }
  }

  return NextResponse.json({ progress })
}

// PATCH /api/progress → mark a roadmap step complete
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, stepId } = await req.json()
  await dbConnect()

  const roadmap = await Roadmap.findOne({ userId: session.user.id, courseId })
  if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })

  const step = roadmap.steps.find((s: any) => s.stepId === stepId)
  if (step) {
    step.isCompleted = true
    step.completedAt = new Date()
  }

  const completed = roadmap.steps.filter((s: any) => s.isCompleted).length
  roadmap.totalProgress = Math.round((completed / roadmap.steps.length) * 100)
  roadmap.currentStepIndex = Math.min(
    roadmap.steps.findIndex((s: any) => !s.isCompleted),
    roadmap.steps.length - 1
  )

  await roadmap.save()
  return NextResponse.json({ roadmap })
}
