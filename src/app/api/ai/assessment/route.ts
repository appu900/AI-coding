import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Assessment, Course } from '@/models'
import { generateMCQTest } from '@/lib/ai'

// GET /api/ai/assessment?courseId=xxx  → generate MCQ questions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  await dbConnect()
  const course = await Course.findById(courseId)
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const questions = await generateMCQTest(course.title, 10)
  return NextResponse.json({ questions })
}

// POST /api/ai/assessment  → submit answers, get level
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, questions, answers } = await req.json()

  const { analyzeTestResults } = await import('@/lib/ai')
  const result = analyzeTestResults(questions, answers)

  await dbConnect()
  const assessment = await Assessment.create({
    userId:      session.user.id,
    courseId,
    questions,
    answers,
    score:       result.score,
    level:       result.level,
    weakTopics:  result.weakTopics,
    strongTopics: result.strongTopics,
    completedAt: new Date(),
  })

  return NextResponse.json({ ...result, assessmentId: assessment._id.toString() })
}
