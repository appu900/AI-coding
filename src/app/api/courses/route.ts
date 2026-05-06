import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Course } from '@/models'

// GET /api/courses → list all published courses (students) or all (admin)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  await dbConnect()

  const isAdmin = session?.user?.role === 'admin'
  const filter = isAdmin ? {} : { isPublished: true }

  const courses = await Course.find(filter).sort({ createdAt: -1 })
  return NextResponse.json({ courses })
}

// POST /api/courses → create course (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, icon, color, tags } = await req.json()
  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  await dbConnect()

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const existing = await Course.findOne({ slug })
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const course = await Course.create({
    title,
    slug: finalSlug,
    description,
    icon:  icon  || '💻',
    color: color || '#5c7cfa',
    tags:  tags  || [],
    createdBy: session.user.id,
  })

  return NextResponse.json({ course }, { status: 201 })
}
