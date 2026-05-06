import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Lesson } from "@/models";
import { client } from "@/lib/ai";

function parseJsonObject(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    stepId,
    courseId,
    stepTitle,
    stepDescription,
    topics,
    level,
    courseName,
  } = await req.json();

  await dbConnect();

  // ── Check cache first ──────────────────────────────────────────
  const cached = await Lesson.findOne({ stepId }).lean();
  if (cached) {
    return NextResponse.json({ lesson: cached, cached: true });
  }

  // ── Generate with AI ───────────────────────────────────────────
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are an expert coding tutor. Generate a detailed lesson for:

Course: "${courseName}"
Step: "${stepTitle}"
Description: "${stepDescription}"
Topics: ${topics.join(", ")}
Level: ${level}

Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview",
  "explanation": "Detailed markdown explanation (400-600 words)",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "starterCode": "// Runnable Node.js starter code (20-40 lines with comments)",
  "exercisePrompt": "Specific coding exercise description",
  "expectedOutput": "What correct output looks like",
  "language": "javascript"
}`,
      },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  const lesson = parseJsonObject(text);

  // ── Save to DB ─────────────────────────────────────────────────
  await Lesson.create({ stepId, courseId, ...lesson });

  return NextResponse.json({ lesson, cached: false });
}
