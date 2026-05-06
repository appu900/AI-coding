import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Judge0 language IDs
const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js
  typescript: 74,
  python:     71,
  java:       62,
  cpp:        54,
}

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com'
const JUDGE0_KEY = process.env.JUDGE0_API_KEY ?? ''

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, language = 'javascript' } = await req.json()
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  const languageId = LANGUAGE_IDS[language] ?? 63

  try {
    // Step 1: Submit the code
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: '',
      }),
    })

    if (!submitRes.ok) {
      const err = await submitRes.text()
      return NextResponse.json({ error: `Judge0 submission failed: ${err}` }, { status: 500 })
    }

    const { token } = await submitRes.json()

    // Step 2: Poll for result (max 10s)
    let result: any = null
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))

      const pollRes = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      )
      result = await pollRes.json()

      // status id 1 = In Queue, 2 = Processing
      if (result.status?.id > 2) break
    }

    if (!result) {
      return NextResponse.json({ error: 'Code execution timed out' }, { status: 408 })
    }

    const statusId = result.status?.id
    // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit, 6 = Compilation Error, 11-13 = Runtime Error
    const success  = statusId === 3
    const output   = result.stdout || result.compile_output || result.stderr || ''

    return NextResponse.json({
      success,
      output: output.trim(),
      status: result.status?.description ?? 'Unknown',
      time:   result.time,
      memory: result.memory,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Execution failed' }, { status: 500 })
  }
}