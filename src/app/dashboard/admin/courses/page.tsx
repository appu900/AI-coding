"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Eye,
  EyeOff,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

type Course = {
  _id: string;
  title: string;
  description: string;
  icon: string;
  isPublished: boolean;
  tags: string[];
  color: string;
};
type Module = {
  _id: string;
  title: string;
  level: string;
  description: string;
  isGenerated: boolean;
  submodules: any[];
};

const levelStyle: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Record<string, Module[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genId, setGenId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "💻",
    color: "#f5c518",
    tags: "",
  });
  const [modForm, setModForm] = useState({
    title: "",
    level: "beginner",
    generateContent: false,
  });

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        setLoading(false);
      });
  }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      setSaving(false);
      return;
    }
    setCourses((c) => [data.course, ...c]);
    setForm({
      title: "",
      description: "",
      icon: "💻",
      color: "#f5c518",
      tags: "",
    });
    setShowAdd(false);
    setSaving(false);
    toast.success("Course created!");
  }

  async function togglePublish(course: Course) {
    const res = await fetch(`/api/courses/${course._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setCourses((cs) =>
      cs.map((c) =>
        c._id === course._id ? { ...c, isPublished: !c.isPublished } : c,
      ),
    );
    toast.success(course.isPublished ? "Unpublished" : "Published!");
  }

  async function loadModules(courseId: string) {
    if (modules[courseId]) return;
    const res = await fetch(`/api/modules?courseId=${courseId}`);
    const data = await res.json();
    setModules((m) => ({ ...m, [courseId]: data.modules || [] }));
  }

  function toggleExpand(courseId: string) {
    const next = expanded === courseId ? null : courseId;
    setExpanded(next);
    if (next) loadModules(next);
  }

  async function addModule(courseId: string) {
    if (!modForm.title) {
      toast.error("Module title required");
      return;
    }
    setGenId(courseId);
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, ...modForm }),
    });
    const data = await res.json();
    setGenId(null);
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    setModules((m) => ({
      ...m,
      [courseId]: [...(m[courseId] || []), data.module],
    }));
    setModForm({ title: "", level: "beginner", generateContent: false });
    toast.success("Module created!");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-b5cc2e" size={28} />
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: "#161615" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .crextio-root { font-family: 'DM Sans', sans-serif; }
        .crextio-input {
          width: 100%;
          background: #1e1e1c;
          border: 1px solid #2a2a28;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 14px;
          color: #e2e2df;
          outline: none;
          transition: border-color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .crextio-input:focus { border-color: #b5cc2e; box-shadow: 0 0 0 3px rgba(181,204,46,0.12); }
        .crextio-input::placeholder { color: #6b6b67; }
        .crextio-btn-primary {
          background: #b5cc2e;
          color: #161615;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, transform 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .crextio-btn-primary:hover { background: #a3b828; }
        .crextio-btn-primary:active { transform: scale(0.98); }
        .crextio-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .crextio-btn-ghost {
          background: transparent;
          border: 1px solid #2a2a28;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          color: #6b6b67;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, background 0.15s;
        }
        .crextio-btn-ghost:hover { border-color: #b5cc2e; background: rgba(181,204,46,0.08); }
        .crextio-icon-btn {
          background: #1e1e1c;
          border: 1px solid #2a2a28;
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b6b67;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .crextio-icon-btn:hover { border-color: #b5cc2e; color: #b5cc2e; background: rgba(181,204,46,0.08); }
        .card-base {
          background: #1e1e1c;
          border: 1px solid #2a2a28;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .badge-published {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(34,197,94,0.1);
          color: #22c55e;
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 99px;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 10px;
        }
        .badge-draft {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(107,107,103,0.15);
          color: #6b6b67;
          border: 1px solid #2a2a28;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 10px;
        }
        .module-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #161615;
          border: 1px solid #2a2a28;
          border-radius: 12px;
        }
        .tag-chip {
          background: rgba(181,204,46,0.08);
          color: #b5cc2e;
          border: 1px solid rgba(181,204,46,0.2);
          border-radius: 99px;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 9px;
        }
      `}</style>

      <div className="crextio-root max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#e2e2df",
                letterSpacing: "-0.5px",
              }}
            >
              Courses
            </h1>
            <p style={{ color: "#6b6b67", marginTop: 4, fontSize: 14 }}>
              {courses.length} course{courses.length !== 1 ? "s" : ""} · Manage
              curriculum and modules
            </p>
          </div>
          <button
            className="crextio-btn-primary"
            onClick={() => setShowAdd((s) => !s)}
          >
            <Plus size={15} /> New Course
          </button>
        </div>

        {/* Add course form */}
        {showAdd && (
          <form onSubmit={createCourse} className="card-base p-6 mb-6">
            <h2
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "#e2e2df",
                marginBottom: 16,
              }}
            >
              New Course
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#888",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Title
                </label>
                <input
                  className="crextio-input"
                  placeholder="e.g. React Fundamentals"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6b6b67",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Icon
                  </label>
                  <input
                    className="crextio-input"
                    value={form.icon}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, icon: e.target.value }))
                    }
                  />
                </div>
                <div style={{ width: 70 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6b6b67",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Color
                  </label>
                  <input
                    type="color"
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 8,
                      border: "1px solid #2a2a28",
                      cursor: "pointer",
                      padding: 2,
                      background: "#1e1e1c",
                    }}
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6b6b67",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Description
              </label>
              <textarea
                className="crextio-input"
                style={{ resize: "none" }}
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6b6b67",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Tags <span style={{ color: "#6b6b67" }}>(comma-separated)</span>
              </label>
              <input
                className="crextio-input"
                placeholder="frontend, ui, hooks"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                className="crextio-btn-primary"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Create Course
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="crextio-btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Courses table */}
        <div className="card-base overflow-hidden" style={{ padding: 0 }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 1fr 1fr 100px",
              padding: "12px 20px",
              borderBottom: "1px solid #2a2a28",
              background: "#1a1a19",
            }}
          >
            {["Course", "Tags", "Status", "Actions"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6b6b67",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {courses.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#bbb",
                fontSize: 14,
              }}
            >
              No courses yet. Create your first one!
            </div>
          )}

          {courses.map((course, i) => (
            <div key={course._id}>
              {/* Course row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1fr 1fr 100px",
                  padding: "14px 20px",
                  alignItems: "center",
                  borderBottom:
                    expanded === course._id
                      ? "none"
                      : i < courses.length - 1
                        ? "1px solid #2a2a28"
                        : "none",
                  transition: "background 0.12s",
                  background:
                    expanded === course._id ? "#1e1e1c" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (expanded !== course._id)
                    (e.currentTarget as HTMLElement).style.background =
                      "#1e1e1c";
                }}
                onMouseLeave={(e) => {
                  if (expanded !== course._id)
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                }}
              >
                {/* Course info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: course.color + "22",
                      border: `1px solid ${course.color}44`,
                      flexShrink: 0,
                    }}
                  >
                    {course.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#e2e2df",
                      }}
                    >
                      {course.title}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b6b67", marginTop: 1 }}>
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(course.tags || []).slice(0, 2).map((t) => (
                    <span key={t} className="tag-chip">
                      {t}
                    </span>
                  ))}
                  {(course.tags || []).length > 2 && (
                    <span className="tag-chip">+{course.tags.length - 2}</span>
                  )}
                </div>

                {/* Status badge */}
                <div>
                  <span
                    className={
                      course.isPublished ? "badge-published" : "badge-draft"
                    }
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: course.isPublished ? "#22c55e" : "#6b6b67",
                        display: "inline-block",
                      }}
                    />
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="crextio-icon-btn"
                    onClick={() => togglePublish(course)}
                    title={course.isPublished ? "Unpublish" : "Publish"}
                  >
                    {course.isPublished ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                  <button
                    className="crextio-icon-btn"
                    onClick={() => toggleExpand(course._id)}
                  >
                    {expanded === course._id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Modules panel */}
              {expanded === course._id && (
                <div
                  style={{
                    borderTop: "1px dashed #2a2a28",
                    background: "#161615",
                    padding: "16px 20px 20px 20px",
                    borderBottom:
                      i < courses.length - 1 ? "1px solid #2a2a28" : "none",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b6b67",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 12,
                    }}
                  >
                    Modules
                  </p>

                  {/* Module list */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {(modules[course._id] || []).map((m) => (
                      <div key={m._id} className="module-row">
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#e2e2df",
                            }}
                          >
                            {m.title}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginTop: 2,
                            }}
                          >
                            <span style={{ fontSize: 11, color: "#6b6b67" }}>
                              {m.submodules?.length || 0} submodules
                            </span>
                            <span
                              className={clsx(
                                "text-xs px-2 py-0.5 rounded-full",
                                levelStyle[m.level] ||
                                  "bg-gray-100 text-gray-500 border border-gray-200",
                              )}
                            >
                              {m.level}
                            </span>
                            {m.isGenerated && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#b5cc2e",
                                  background: "rgba(181,204,46,0.1)",
                                  border: "1px solid rgba(181,204,46,0.2)",
                                  borderRadius: 99,
                                  padding: "1px 8px",
                                }}
                              >
                                ✦ AI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(modules[course._id] || []).length === 0 && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6b6b67",
                          textAlign: "center",
                          padding: "16px 0",
                        }}
                      >
                        No modules yet.
                      </p>
                    )}
                  </div>

                  {/* Add module row */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <input
                      className="crextio-input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder="Module title"
                      value={modForm.title}
                      onChange={(e) =>
                        setModForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                    <select
                      className="crextio-input"
                      style={{ width: 140 }}
                      value={modForm.level}
                      onChange={(e) =>
                        setModForm((f) => ({ ...f, level: e.target.value }))
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "#6b6b67",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{ accentColor: "#b5cc2e" }}
                        checked={modForm.generateContent}
                        onChange={(e) =>
                          setModForm((f) => ({
                            ...f,
                            generateContent: e.target.checked,
                          }))
                        }
                      />
                      AI generate
                    </label>
                    <button
                      className="crextio-btn-primary"
                      onClick={() => addModule(course._id)}
                      disabled={genId === course._id}
                    >
                      {genId === course._id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />{" "}
                          Generating…
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} /> Add Module
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
