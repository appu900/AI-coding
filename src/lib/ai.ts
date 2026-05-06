import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KE || "",
});

// ─── MCQ Generation ─────────────────────────────────────────────────────────
export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
}

// ─── Safe JSON parse helpers ──────────────────────────────────────────────────

function parseJsonArray(text: string): any[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in AI response");
  return JSON.parse(match[0]);
}

function parseJsonObject(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
}

// ─── MCQ Generation ───────────────────────────────────────────────────────────

export async function generateMCQTest(
  courseName: string,
  numQuestions: number = 10,
): Promise<MCQQuestion[]> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Generate ${numQuestions} MCQ questions to assess a student's level in "${courseName}".

Mix difficulty: ~3 beginner, ~4 intermediate, ~3 advanced questions.

Return ONLY valid JSON array, no markdown, no explanation:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "difficulty": "beginner",
    "topic": "topic name"
  }
]`,
      },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  return parseJsonArray(text);
}

// ─── Roadmap Generation ───────────────────────────────────────────────────────

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  order: number;
  estimatedHours: number;
  topics: string[];
  prerequisites: string[];
}

export async function generatePersonalizedRoadmap(
  courseName: string,
  studentLevel: "beginner" | "intermediate" | "advanced",
  weakTopics: string[],
  strongTopics: string[],
): Promise<RoadmapStep[]> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Create a personalized 0-to-hero learning roadmap for "${courseName}".

Student assessment:
- Current level: ${studentLevel}
- Weak areas: ${weakTopics.join(", ") || "none identified"}
- Strong areas: ${strongTopics.join(", ") || "none identified"}

Rules:
- Start from fundamentals even for intermediate/advanced (but move faster)
- Include all levels: beginner → intermediate → advanced
- ${studentLevel === "beginner" ? "Start slow with foundations" : studentLevel === "intermediate" ? "Briefly cover basics, focus on intermediate/advanced" : "Quick recap, deep dive into advanced topics"}
- Emphasize weak areas more
- 8-12 roadmap steps total

Return ONLY valid JSON array:
[
  {
    "id": "step_1",
    "title": "Step title",
    "description": "What the student will learn and build",
    "level": "beginner",
    "order": 1,
    "estimatedHours": 5,
    "topics": ["topic1", "topic2"],
    "prerequisites": []
  }
]`,
      },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  return parseJsonArray(text);
}

// ─── Module & Submodule Content Generation ───────────────────────────────────

export interface SubModule {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  keyPoints: string[];
  exercisePrompt?: string;
}

export interface GeneratedModule {
  title: string;
  description: string;
  submodules: SubModule[];
}

export async function generateModuleContent(
  courseName: string,
  moduleName: string,
  level: string,
): Promise<GeneratedModule> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 6000,
    messages: [
      {
        role: "user",
        content: `Generate complete module content for:
Course: "${courseName}"
Module: "${moduleName}"
Level: ${level}

Return ONLY valid JSON:
{
  "title": "${moduleName}",
  "description": "Brief module overview",
  "submodules": [
    {
      "id": "sub_1",
      "title": "Submodule title",
      "content": "Detailed explanation in markdown format (300-500 words)",
      "codeExample": "// Relevant code example if applicable",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "exercisePrompt": "Practice exercise for the student"
    }
  ]
}

Generate 3-5 submodules covering the topic thoroughly.`,
      },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  return parseJsonObject(text);
}

// ─── Score Analysis ──────────────────────────────────────────────────────────

export function analyzeTestResults(
  questions: MCQQuestion[],
  answers: Record<string, number>,
): {
  level: "beginner" | "intermediate" | "advanced";
  score: number;
  weakTopics: string[];
  strongTopics: string[];
  breakdown: Record<string, { correct: number; total: number }>;
} {
  let correct = 0;
  const topicStats: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q) => {
    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
    topicStats[q.topic].total++;
    if (answers[q.id] === q.correctIndex) {
      correct++;
      topicStats[q.topic].correct++;
    }
  });

  const score = Math.round((correct / questions.length) * 100);

  const weakTopics = Object.entries(topicStats)
    .filter(([, s]) => s.correct / s.total < 0.5)
    .map(([t]) => t);

  const strongTopics = Object.entries(topicStats)
    .filter(([, s]) => s.correct / s.total >= 0.75)
    .map(([t]) => t);

  const level =
    score >= 70 ? "advanced" : score >= 40 ? "intermediate" : "beginner";

  return { level, score, weakTopics, strongTopics, breakdown: topicStats };
}
