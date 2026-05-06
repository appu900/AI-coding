import mongoose, { Schema, model, models, Types } from 'mongoose'

// ─── User ─────────────────────────────────────────────────────────────────────

const UserSchema = new Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true },
    role:         { type: String, enum: ['student', 'admin'], default: 'student' },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    completedOnboarding: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const User = models.User || model('User', UserSchema)

// ─── Course ───────────────────────────────────────────────────────────────────

const CourseSchema = new Schema(
  {
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon:        { type: String, default: '💻' }, // emoji or icon name
    color:       { type: String, default: '#5c7cfa' },
    tags:        [String],
    isPublished: { type: Boolean, default: false },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Course = models.Course || model('Course', CourseSchema)

// ─── Module ───────────────────────────────────────────────────────────────────

const SubModuleSchema = new Schema({
  title:          { type: String, required: true },
  content:        { type: String, required: true },
  codeExample:    String,
  keyPoints:      [String],
  exercisePrompt: String,
  order:          { type: Number, default: 0 },
})

const ModuleSchema = new Schema(
  {
    courseId:    { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title:       { type: String, required: true },
    description: String,
    order:       { type: Number, default: 0 },
    level:       { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    submodules:  [SubModuleSchema],
    isGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Module = models.Module || model('Module', ModuleSchema)

// ─── Roadmap ──────────────────────────────────────────────────────────────────

const RoadmapStepSchema = new Schema({
  stepId:         String,
  title:          String,
  description:    String,
  level:          { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  order:          Number,
  estimatedHours: Number,
  topics:         [String],
  prerequisites:  [String],
  isCompleted:    { type: Boolean, default: false },
  completedAt:    Date,
})

const RoadmapSchema = new Schema(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId:      { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    studentLevel:  { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    assessmentScore: Number,
    weakTopics:    [String],
    strongTopics:  [String],
    steps:         [RoadmapStepSchema],
    currentStepIndex: { type: Number, default: 0 },
    totalProgress: { type: Number, default: 0 }, // 0–100
  },
  { timestamps: true }
)

export const Roadmap = models.Roadmap || model('Roadmap', RoadmapSchema)

// ─── Progress ─────────────────────────────────────────────────────────────────

const ProgressSchema = new Schema(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId:     { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId:     { type: Schema.Types.ObjectId, ref: 'Module' },
    submoduleId:  String, // sub-document id
    status:       { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
    score:        Number,
    completedAt:  Date,
    timeSpentMin: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Compound index so we don't double-count
ProgressSchema.index({ userId: 1, courseId: 1, moduleId: 1, submoduleId: 1 }, { unique: true })

export const Progress = models.Progress || model('Progress', ProgressSchema)

// ─── Assessment ───────────────────────────────────────────────────────────────

const AssessmentSchema = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId:  { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    questions: Schema.Types.Mixed, // stored MCQ questions
    answers:   Schema.Types.Mixed, // { questionId: answerIndex }
    score:     Number,
    level:     String,
    weakTopics:   [String],
    strongTopics: [String],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Assessment = models.Assessment || model('Assessment', AssessmentSchema)



const LessonSchema = new Schema(
  {
    stepId:          { type: String, required: true, unique: true },
    courseId:        { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    summary:         { type: String, required: true },
    explanation:     { type: String, required: true },
    keyPoints:       [String],
    starterCode:     { type: String, required: true },
    exercisePrompt:  { type: String, required: true },
    expectedOutput:  { type: String, required: true },
    language:        { type: String, default: 'javascript' },
  },
  { timestamps: true }
)

export const Lesson = models.Lesson || model('Lesson', LessonSchema)