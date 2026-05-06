import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Roadmap, Course, Assessment } from '@/models'
import { generatePersonalizedRoadmap } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, assessmentId } = await req.json()

  await dbConnect()

  // Load assessment results
  const assessment = await Assessment.findById(assessmentId)
  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })

  const course = await Course.findById(courseId)
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Delete any existing roadmap for this user+course
  await Roadmap.deleteOne({ userId: session.user.id, courseId })

  const steps = await generatePersonalizedRoadmap(
    course.title,
    assessment.level,
    assessment.weakTopics,
    assessment.strongTopics
  )

  const roadmap = await Roadmap.create({
    userId:         session.user.id,
    courseId,
    studentLevel:   assessment.level,
    assessmentScore: assessment.score,
    weakTopics:     assessment.weakTopics,
    strongTopics:   assessment.strongTopics,
    steps: steps.map((s) => ({ ...s, stepId: s.id })),
    currentStepIndex: 0,
    totalProgress: 0,
  })

  return NextResponse.json({ roadmap })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courseId = req.nextUrl.searchParams.get('courseId')
  await dbConnect()

  const query: any = { userId: session.user.id }
  if (courseId) query.courseId = courseId

  const roadmaps = await Roadmap.find(query).populate('courseId', 'title slug icon color')
  return NextResponse.json({ roadmaps })
}
