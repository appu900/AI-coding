/**
 * Seed script — run once to create initial courses in MongoDB.
 * Usage: npx tsx scripts/seed.ts
 * (install tsx: npm i -D tsx)
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-coding-platform'

const CourseSchema = new mongoose.Schema({
  title: String, slug: String, description: String,
  icon: String, color: String, tags: [String],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)

const COURSES = [
  {
    title: 'MongoDB',
    slug: 'mongodb',
    description: 'Master NoSQL databases with MongoDB — from basic CRUD operations to advanced aggregation pipelines, indexing, and real-world data modeling.',
    icon: '🍃',
    color: '#00ED64',
    tags: ['database', 'nosql', 'backend'],
    isPublished: true,
  },
  {
    title: 'JavaScript',
    slug: 'javascript',
    description: 'Master JavaScript from the ground up — variables, functions, async/await, closures, the event loop, and modern ES2024 features.',
    icon: '⚡',
    color: '#F7DF1E',
    tags: ['language', 'frontend', 'backend', 'core'],
    isPublished: true,
  },
  {
    title: 'React',
    slug: 'react',
    description: 'Build production-grade UIs with React — hooks, context, state management, performance optimization, and the React ecosystem.',
    icon: '⚛️',
    color: '#61DAFB',
    tags: ['frontend', 'ui', 'framework', 'javascript'],
    isPublished: true,
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  for (const c of COURSES) {
    const existing = await Course.findOne({ slug: c.slug })
    if (existing) {
      console.log(`  skip: ${c.title} already exists`)
      continue
    }
    await Course.create(c)
    console.log(`  created: ${c.title}`)
  }

  console.log('Seed complete.')
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
