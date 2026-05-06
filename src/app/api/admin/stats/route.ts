import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { User, Course, Module, Roadmap, Assessment } from '@/models'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await dbConnect()

  const [totalStudents, totalCourses, totalModules, totalRoadmaps, recentAssessments] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Module.countDocuments(),
      Roadmap.countDocuments(),
      Assessment.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email').populate('courseId', 'title'),
    ])

  const levelDistribution = await Assessment.aggregate([
    { $group: { _id: '$level', count: { $sum: 1 } } },
  ])

  return NextResponse.json({
    stats: {
      totalStudents,
      totalCourses,
      totalModules,
      totalRoadmaps,
    },
    levelDistribution,
    recentAssessments,
  })
}
