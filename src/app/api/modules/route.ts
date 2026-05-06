import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Module, Course } from '@/models'
import { generateModuleContent } from '@/lib/ai'

// GET /api/modules?courseId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  await dbConnect()
  const modules = await Module.find({ courseId }).sort({ order: 1 })
  return NextResponse.json({ modules })
}

// POST /api/modules → create module (admin) and optionally AI-generate content
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { courseId, title, level, order, generateContent } = await req.json()
  if (!courseId || !title) {
    return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 })
  }

  await dbConnect()

  const course = await Course.findById(courseId)
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  let submodules: any[] = []
  let description = ''
  let isGenerated = false

  if (generateContent) {
    const generated = await generateModuleContent(course.title, title, level || 'beginner')
    submodules = generated.submodules.map((s, i) => ({ ...s, order: i }))
    description = generated.description
    isGenerated = true
  }

  const mod = await Module.create({
    courseId,
    title,
    description,
    level: level || 'beginner',
    order: order ?? 0,
    submodules,
    isGenerated,
  })

  return NextResponse.json({ module: mod }, { status: 201 })
}
