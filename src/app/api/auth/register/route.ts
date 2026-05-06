import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/db'
import { User } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await dbConnect()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: isAdmin ? 'admin' : 'student',
    })

    return NextResponse.json({
      message: 'Account created successfully',
      userId: user._id.toString(),
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
