'use client'
import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import {
  X, Clock, Loader2, CheckCircle2, XCircle, Play,
  ChevronRight, Terminal, History, Plus, Maximize2,
  Columns, MoreHorizontal, Folder, FileCode, Zap,
} from 'lucide-react'

interface RoadmapStep {
  stepId: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  order: number
  estimatedHours: number
  topics: string[]
}

interface Lesson {
  summary: string
  explanation: string
  keyPoints: string[]
  starterCode: string
  exercisePrompt: string
  expectedOutput: string
  language: string
}

interface RunResult {
  success: boolean
  output: string
  status: string
  time?: number
}

interface Props {
  step: RoadmapStep
  courseId: string
  courseName: string
  onClose: () => void
  onComplete: (stepId: string) => void
}

const MONACO_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'keyword',        foreground: 'b5cc2e' },
    { token: 'string',         foreground: 'd4e850' },
    { token: 'number',         foreground: 'e8a840' },
    { token: 'comment',        foreground: '4a4a46', fontStyle: 'italic' },
    { token: 'type',           foreground: 'c8c8c4' },
    { token: 'function',       foreground: 'e2e2df' },
    { token: 'variable',       foreground: 'e2e2df' },
    { token: 'operator',       foreground: '9a9a94' },
    { token: 'delimiter',      foreground: '9a9a94' },
  ],
  colors: {
    'editor.background':           '#111110',
    'editor.foreground':           '#e2e2df',
    'editorLineNumber.foreground': '#3a3a37',
    'editorLineNumber.activeForeground': '#6b6b67',
    'editor.lineHighlightBackground': '#161615',
    'editorCursor.foreground':     '#b5cc2e',
    'editor.selectionBackground':  '#b5cc2e28',
    'editorGutter.background':     '#111110',
    'scrollbarSlider.background':  '#2a2a2860',
  },
}

export default function StepLessonModal({
  step, courseId, courseName, onClose, onComplete,
}: Props) {
  const [lesson, setLesson]         = useState<Lesson | null>(null)
  const [loadingLesson, setLoading] = useState(true)
  const [code, setCode]             = useState('')
  const [running, setRunning]       = useState(false)
  const [result, setResult]         = useState<RunResult | null>(null)
  const [activeBottom, setActiveBottom] = useState<'output' | 'terminal'>('output')
  const [rightTab, setRightTab]     = useState<'lesson' | 'exercise'>('lesson')
  const overlayRef                  = useRef<HTMLDivElement>(null)

  /* ── load lesson ── */
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res  = await fetch('/api/ai/lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stepId: step.stepId,
            courseId,
            stepTitle:       step.title,
            stepDescription: step.description,
            topics:          step.topics,
            level:           step.level,
            courseName,
          }),
        })
        const data = await res.json()
        setLesson(data.lesson)
        setCode(data.lesson.starterCode)
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [step.stepId])

  /* ── keyboard / overlay close ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleOverlay(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  /* ── run code ── */
  async function runCode() {
    if (!code.trim()) return
    setRunning(true)
    setResult(null)
    setActiveBottom('output')
    try {
      const res  = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lesson?.language ?? 'javascript' }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, output: 'Failed to connect to code runner.', status: 'Error' })
    } finally {
      setRunning(false)
    }
  }

  /* ── monaco mount ── */
  function handleEditorMount(_: unknown, monaco: any) {
    monaco.editor.defineTheme('cursor-dark', MONACO_THEME)
    monaco.editor.setTheme('cursor-dark')
  }

  const lang = lesson?.language ?? 'javascript'
  const filename = `${step.title.toLowerCase().replace(/\s+/g, '_')}.${lang === 'python' ? 'py' : lang === 'typescript' ? 'ts' : 'js'}`

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#111110',
        display: 'flex', alignItems: 'stretch', justifyContent: 'stretch',
      }}
    >
      {/* ── Outer shell — full screen ── */}
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        background: '#111110',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        {/* ════════════════════════════════
            WINDOW TITLE BAR
        ════════════════════════════════ */}
        <div style={{
          height: 42,
          background: '#161615',
          borderBottom: '1px solid #1e1e1c',
          display: 'flex', alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          flexShrink: 0,
        }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
            {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
          </div>

          {/* Breadcrumb */}
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b6b67', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Folder size={12} style={{ color: '#4a4a46' }} />
            My Code
            <ChevronRight size={10} style={{ color: '#3a3a37' }} />
            <FileCode size={12} style={{ color: '#b5cc2e' }} />
            <span style={{ color: '#e2e2df' }}>{filename}</span>
          </span>

          {/* Push right */}
          <div style={{ flex: 1 }} />

          {/* Step info */}
          <span style={{
            fontSize: 11, fontFamily: 'monospace',
            color: '#6b6b67', border: '1px solid #2a2a28',
            padding: '2px 8px', borderRadius: 4,
          }}>
            Step {step.order}
          </span>

          {/* Level badge */}
          {(() => {
            const cfg = {
              beginner:     { bg: '#1c2210', color: '#b5cc2e', border: '#2a3318' },
              intermediate: { bg: '#252010', color: '#d4a830', border: '#3a3018' },
              advanced:     { bg: '#201818', color: '#e06060', border: '#382020' },
            }[step.level]
            return (
              <span style={{
                fontSize: 11, fontFamily: 'monospace',
                background: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`,
                padding: '2px 9px', borderRadius: 4,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />
                {step.level}
              </span>
            )
          })()}

          <span style={{ fontSize: 12, color: '#6b6b67', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace' }}>
            <Clock size={11} /> {step.estimatedHours}h
          </span>

          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #2a2a28',
              color: '#6b6b67', width: 28, height: 28, borderRadius: 6,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#e06060'; el.style.color = '#e06060' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#2a2a28'; el.style.color = '#6b6b67' }}
          >
            <X size={13} />
          </button>
        </div>

        {/* ════════════════════════════════
            MAIN CONTENT — two columns
        ════════════════════════════════ */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>

          {/* ── LEFT: Editor column ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #1e1e1c',
            background: '#111110',
            overflow: 'hidden',
          }}>
            {/* Editor file tab */}
            <div style={{
              height: 36, background: '#161615',
              borderBottom: '1px solid #1e1e1c',
              display: 'flex', alignItems: 'stretch',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 14px',
                borderRight: '1px solid #1e1e1c',
                borderBottom: '2px solid #b5cc2e',
                background: '#111110',
                fontSize: 12, color: '#e2e2df', fontFamily: 'monospace',
              }}>
                <FileCode size={12} style={{ color: '#b5cc2e' }} />
                {filename}
              </div>
              <div style={{ flex: 1 }} />
              {/* Run button */}
              <button
                onClick={runCode}
                disabled={running || loadingLesson}
                style={{
                  margin: '5px 8px',
                  background: running ? '#1c2210' : '#1c2210',
                  border: `1px solid ${running ? '#2a3318' : '#b5cc2e50'}`,
                  color: running ? '#b5cc2e' : '#b5cc2e',
                  padding: '0 14px', borderRadius: 5, cursor: running ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!running) (e.currentTarget as HTMLElement).style.background = '#252e14' }}
                onMouseLeave={e => { if (!running) (e.currentTarget as HTMLElement).style.background = '#1c2210' }}
              >
                {running
                  ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Running…</>
                  : <><Play size={11} /> Run</>}
              </button>
            </div>

            {/* Monaco editor */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {loadingLesson ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <Loader2 size={20} style={{ color: '#b5cc2e', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#3a3a37' }}>Generating lesson…</span>
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={lang}
                  value={code}
                  onChange={v => setCode(v ?? '')}
                  theme="cursor-dark"
                  beforeMount={monaco => {
                    monaco.editor.defineTheme('cursor-dark', MONACO_THEME)
                  }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 14, bottom: 14 },
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    bracketPairColorization: { enabled: true },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorStyle: 'line',
                    wordWrap: 'on',
                    scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    renderLineHighlightOnlyWhenFocus: false,
                    glyphMargin: false,
                    folding: false,
                    lineDecorationsWidth: 8,
                  }}
                />
              )}
            </div>

            {/* ── Bottom panel (Output / Terminal) ── */}
            <div style={{
              borderTop: '1px solid #1e1e1c',
              background: '#161615',
              flexShrink: 0,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Bottom tab bar */}
              <div style={{
                display: 'flex', alignItems: 'center',
                borderBottom: '1px solid #1e1e1c',
                padding: '0 8px',
                gap: 2,
                height: 32,
              }}>
                {[
                  { id: 'output',   label: 'Output',   icon: CheckCircle2 },
                  { id: 'terminal', label: 'Terminal',  icon: Terminal },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveBottom(t.id as any)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${activeBottom === t.id ? '#b5cc2e' : 'transparent'}`,
                      color: activeBottom === t.id ? '#e2e2df' : '#6b6b67',
                      padding: '0 10px', height: '100%',
                      fontFamily: 'monospace', fontSize: 11,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'all 0.15s',
                    }}
                  >
                    <t.icon size={11} />
                    {t.label}
                    {t.id === 'output' && result && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: result.success ? '#b5cc2e' : '#e06060',
                        display: 'inline-block',
                      }} />
                    )}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <button style={{ background: 'transparent', border: 'none', color: '#3a3a37', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                  <Plus size={12} />
                </button>
              </div>

              {/* Output content */}
              <div style={{ minHeight: 80, maxHeight: 160, overflowY: 'auto', padding: '10px 14px' }}>
                {activeBottom === 'output' && (
                  <>
                    {!result && !running && (
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3a3a37' }}>
                        Press Run to execute your code
                      </span>
                    )}
                    {running && (
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b6b67' }}>
                        Executing…
                      </span>
                    )}
                    {result && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          {result.success
                            ? <CheckCircle2 size={13} style={{ color: '#b5cc2e' }} />
                            : <XCircle size={13} style={{ color: '#e06060' }} />}
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: result.success ? '#b5cc2e' : '#e06060' }}>
                            {result.status}{result.time ? ` · ${result.time}s` : ''}
                          </span>
                        </div>
                        <pre style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, margin: 0,
                          color: result.success ? '#b5cc2e' : '#e06060',
                          whiteSpace: 'pre-wrap', lineHeight: 1.6,
                        }}>
                          {result.output || '(no output)'}
                        </pre>
                      </div>
                    )}
                  </>
                )}
                {activeBottom === 'terminal' && (
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3a3a37' }}>
                    $ _
                  </span>
                )}
              </div>

              {/* Status bar — bottom of editor side */}
              <div style={{
                height: 24,
                background: '#0d0d0c',
                borderTop: '1px solid #1e1e1c',
                display: 'flex', alignItems: 'center',
                padding: '0 12px',
                gap: 16,
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#3a3a37', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <History size={10} />
                  History
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#3a3a37' }}>
                  Ln {code.split('\n').length}, Col 1
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#3a3a37', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={10} style={{ color: '#b5cc2e' }} />
                  Ask AI
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#3a3a37' }}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: AI Explanation panel ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: '#111110',
            overflow: 'hidden',
          }}>
            {/* Right panel tab bar */}
            <div style={{
              height: 36, background: '#161615',
              borderBottom: '1px solid #1e1e1c',
              display: 'flex', alignItems: 'stretch',
              flexShrink: 0, gap: 0,
            }}>
              {[
                { id: 'lesson',   label: 'Lesson' },
                { id: 'exercise', label: 'Exercise' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setRightTab(t.id as any)}
                  style={{
                    background: rightTab === t.id ? '#111110' : 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${rightTab === t.id ? '#b5cc2e' : 'transparent'}`,
                    borderRight: '1px solid #1e1e1c',
                    color: rightTab === t.id ? '#e2e2df' : '#6b6b67',
                    padding: '0 18px', cursor: 'pointer',
                    fontFamily: 'monospace', fontSize: 12,
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10px', gap: 6 }}>
                <Columns size={13} style={{ color: '#3a3a37', cursor: 'pointer' }} />
                <Maximize2 size={13} style={{ color: '#3a3a37', cursor: 'pointer' }} />
                <MoreHorizontal size={13} style={{ color: '#3a3a37', cursor: 'pointer' }} />
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: '20px 22px',
            }}>
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                .ai-panel::-webkit-scrollbar { width: 4px; }
                .ai-panel::-webkit-scrollbar-track { background: #111110; }
                .ai-panel::-webkit-scrollbar-thumb { background: #2a2a28; border-radius: 2px; }
                .md-body h1, .md-body h2, .md-body h3 {
                  font-family: 'Georgia', serif;
                  font-weight: 700; letter-spacing: -0.3px;
                  color: #e2e2df; margin: 18px 0 8px;
                }
                .md-body h1 { font-size: 18px; }
                .md-body h2 { font-size: 15px; border-bottom: 1px solid #1e1e1c; padding-bottom: 6px; }
                .md-body h3 { font-size: 13px; color: #c8c8c4; }
                .md-body p { font-size: 13px; color: #9a9a94; line-height: 1.8; margin-bottom: 10px; }
                .md-body ul, .md-body ol { padding-left: 18px; margin-bottom: 10px; }
                .md-body li { font-size: 13px; color: #9a9a94; line-height: 1.8; margin-bottom: 3px; }
                .md-body li::marker { color: #6b6b67; }
                .md-body code {
                  font-family: 'JetBrains Mono', monospace; font-size: 12px;
                  background: #161615; border: 1px solid #2a2a28;
                  padding: 1px 6px; border-radius: 4px; color: #b5cc2e;
                }
                .md-body pre {
                  background: #161615; border: 1px solid #2a2a28;
                  border-radius: 6px; padding: 12px 14px;
                  overflow-x: auto; margin: 10px 0;
                }
                .md-body pre code {
                  background: none; border: none; padding: 0;
                  color: #e2e2df; font-size: 12px; line-height: 1.65;
                }
                .md-body strong { color: #e2e2df; font-weight: 600; }
                .inline-code-block {
                  background: #161615; border: 1px solid #2a2a28; border-radius: 6px;
                  padding: 10px 12px; margin: 8px 0; font-family: 'JetBrains Mono', monospace;
                  font-size: 12px; color: #e2e2df; line-height: 1.65; overflow-x: auto;
                }
                .section-num {
                  display: inline-flex; align-items: center; justify-content: center;
                  width: 20px; height: 20px; border-radius: 50%;
                  background: #161615; border: 1px solid #2a2a28;
                  font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6b6b67;
                  flex-shrink: 0; margin-top: 2px;
                }
              `}</style>

              {loadingLesson ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 12 }}>
                  <Loader2 size={22} style={{ color: '#b5cc2e', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#3a3a37' }}>Generating with AI…</span>
                </div>
              ) : lesson ? (
                <>
                  {/* ── LESSON TAB ── */}
                  {rightTab === 'lesson' && (
                    <div>
                      {/* Step heading */}
                      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#e2e2df', letterSpacing: '-0.4px', marginBottom: 6, lineHeight: 1.3 }}>
                        {step.title}
                      </h1>
                      <p style={{ fontSize: 12, color: '#6b6b67', fontFamily: 'monospace', marginBottom: 18 }}>
                        {step.description}
                      </p>

                      {/* Summary callout */}
                      <div style={{
                        background: '#161615', border: '1px solid #2a2a28',
                        borderLeft: '3px solid #b5cc2e', borderRadius: '0 6px 6px 0',
                        padding: '12px 14px', marginBottom: 22,
                      }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#b5cc2e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                          Overview
                        </div>
                        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#9a9a94', lineHeight: 1.75, margin: 0 }}>
                          {lesson.summary}
                        </p>
                      </div>

                      {/* Explanation */}
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #1e1e1c' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b6b67', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Explanation</span>
                        </div>
                        <div className="md-body">
                          <ReactMarkdown>{lesson.explanation}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Key points */}
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #1e1e1c' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b6b67', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Key Points</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {lesson.keyPoints.map((pt, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span className="section-num">{i + 1}</span>
                              <p style={{ fontSize: 12, color: '#9a9a94', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}>{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Topics */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 14, borderTop: '1px solid #1e1e1c' }}>
                        {step.topics.map(t => (
                          <span key={t} style={{
                            fontFamily: 'monospace', fontSize: 10,
                            background: '#161615', border: '1px solid #2a2a28',
                            color: '#6b6b67', padding: '3px 9px', borderRadius: 4,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── EXERCISE TAB ── */}
                  {rightTab === 'exercise' && (
                    <div>
                      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#e2e2df', marginBottom: 16 }}>
                        Your Task
                      </h2>

                      <div style={{
                        background: '#161615', border: '1px solid #2a2a28',
                        borderLeft: '3px solid #d4a830', borderRadius: '0 6px 6px 0',
                        padding: '12px 14px', marginBottom: 20,
                      }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#d4a830', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                          Prompt
                        </div>
                        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#9a9a94', lineHeight: 1.75, margin: 0 }}>
                          {lesson.exercisePrompt}
                        </p>
                      </div>

                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b6b67', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                        Expected Output
                      </div>
                      <pre style={{
                        background: '#161615', border: '1px dashed #2a2a28', borderRadius: 6,
                        padding: '12px 14px', fontFamily: 'monospace', fontSize: 12,
                        color: '#b5cc2e', whiteSpace: 'pre-wrap', lineHeight: 1.65, margin: 0,
                      }}>
                        {lesson.expectedOutput}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 60, fontFamily: 'monospace', fontSize: 12, color: '#3a3a37' }}>
                  Failed to load lesson
                </div>
              )}
            </div>

            {/* ── Mark complete button (always visible at bottom) ── */}
            {result?.success && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a3d', background: '#181825', flexShrink: 0 }}>
                <button
                  onClick={() => { onComplete(step.stepId); onClose() }}
                  style={{
                    width: '100%', background: '#a6e3a1', color: '#0d1f0d',
                    border: 'none', borderRadius: 6, padding: '10px 0',
                    fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#82c07a'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#a6e3a1'}
                >
                  <CheckCircle2 size={14} />
                  Mark Step as Complete
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
