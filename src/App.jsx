import { useState, useRef, useEffect } from "react";

const COLORS = [
  { dot: "#3B82F6", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  { dot: "#10B981", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  { dot: "#F59E0B", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  { dot: "#8B5CF6", bg: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  { dot: "#EF4444", bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA" },
  { dot: "#EC4899", bg: "#FDF2F8", text: "#831843", border: "#FBCFE8" },
];

function dstr(off = 0) {
  const d = new Date(); d.setDate(d.getDate() + off);
  return d.toISOString().split("T")[0];
}
function fdate(ds) {
  if (!ds) return "";
  if (ds === dstr(0)) return "Today";
  if (ds === dstr(1)) return "Tomorrow";
  if (ds === dstr(-1)) return "Yesterday";
  return new Date(ds + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Default data: Mack's 4 real projects ─────────────────────────────────
const DEFAULT_PROJECTS = [
  { id: "p1", name: "STV Broadcast Template", c: 0 },
  { id: "p2", name: "Brand System Kit", c: 1 },
  { id: "p3", name: "Pascagoula Framework", c: 2 },
  { id: "p4", name: "White Label Process Guide", c: 3 },
];

const DEFAULT_TASKS = [
  // STV Broadcast Template
  { id: "t1",  title: "Generate Whisk photos (5 images)",         project: "p1", pri: "high", date: dstr(0), done: false, notes: "Hero, live preview, feature callouts, PDF preview, what's included" },
  { id: "t2",  title: "Build zip package + LICENSE.txt",          project: "p1", pri: "high", date: dstr(0), done: true,  notes: "index.html + indie-videos.html + Setup Guide PDF + LICENSE.txt" },
  { id: "t3",  title: "List on Etsy with copy + tags",            project: "p1", pri: "high", date: dstr(0), done: false, notes: "Title, description (all 6 sections), 13 tags, $18-24 price point" },
  { id: "t4",  title: "Add listing to your own site",             project: "p1", pri: "med",  date: dstr(1), done: false, notes: "Price at $39-49 on site. Bundle upsell opportunity." },
  // Brand System Kit
  { id: "t5",  title: "Build Canva template x6",                  project: "p2", pri: "high", date: dstr(0), done: false, notes: "IG Story, TikTok Cover, YouTube Thumbnail, Facebook Cover, Pinterest Pin, Brand Style Tile" },
  { id: "t6",  title: "Export PNG files for all 6 templates",     project: "p2", pri: "high", date: dstr(0), done: false, notes: "2000x2000 minimum, PNG format" },
  { id: "t7",  title: "Generate Whisk photos (5 images)",         project: "p2", pri: "high", date: dstr(0), done: false, notes: "Hero flat lay, color palette, social templates preview, typography, what's included" },
  { id: "t8",  title: "List on Etsy with copy + tags",            project: "p2", pri: "high", date: dstr(0), done: false, notes: "$24-29 Etsy / $49-59 site. 13 tags ready." },
  // Pascagoula Framework
  { id: "t9",  title: "Generate Whisk photos (5 images)",         project: "p3", pri: "high", date: dstr(0), done: false, notes: "Aerial grid, data stats, grid tool mockup, PDF flat lay, what's included" },
  { id: "t10", title: "Package grid tool HTML file",              project: "p3", pri: "high", date: dstr(0), done: false, notes: "Include interactive city grid tool in zip with PDF framework" },
  { id: "t11", title: "List on Etsy with copy + tags",           project: "p3", pri: "high", date: dstr(0), done: false, notes: "$39-49 Etsy / $79-99 site. Highest ticket item." },
  { id: "t12", title: "Submit to Pascagoula Redevelopment Auth", project: "p3", pri: "low",  date: dstr(7), done: false, notes: "Use framework as intro to PRA + Opportunity Zone conversation" },
  // White Label Process Guide
  { id: "t13", title: "Generate Whisk photos (5 images)",         project: "p4", pri: "high", date: dstr(0), done: false, notes: "Creator desk hero, inside guide, sprint workflow, checklist graphic, what's included" },
  { id: "t14", title: "List on Etsy with copy + tags",           project: "p4", pri: "high", date: dstr(0), done: false, notes: "$19-29 Etsy / $39-49 site. 13 tags ready." },
  { id: "t15", title: "Create bundle listing (all 4 products)",  project: "p4", pri: "med",  date: dstr(1), done: false, notes: "Bundle price: $79-99. Position as the complete creator monetization kit." },
  { id: "t16", title: "Share launch on TikTok + IG",             project: "p4", pri: "med",  date: dstr(1), done: false, notes: "Document the process — tonight's sprint IS the content" },
];

// ── localStorage helpers ──────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Shared styles ─────────────────────────────────────────────────────────
const inp = { width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", fontFamily: "inherit", color: "#1E293B", boxSizing: "border-box" };
const sHead = { fontSize: 11, fontWeight: 600, color: "#94A3B8", margin: "4px 0 8px", letterSpacing: "0.3px" };
const empty = { textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 13 };

function PriDot({ pri }) {
  const c = pri === "high" ? "#EF4444" : pri === "med" ? "#F59E0B" : "#10B981";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block", flexShrink: 0 }} />;
}

function TaskCard({ task, projects, onToggle, onClick, showProject = true }) {
  const p = projects.find(p => p.id === task.project);
  const cl = p ? COLORS[p.c % COLORS.length] : null;
  const late = !task.done && task.date && task.date < dstr(0);
  return (
    <div onClick={onClick}
      style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "border-color .15s, box-shadow .15s", marginBottom: 5 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#F1F5F9"; e.currentTarget.style.boxShadow = "none"; }}>
      <div onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        style={{ width: 17, height: 17, borderRadius: "50%", border: task.done ? "none" : "1.5px solid #CBD5E1", background: task.done ? "#10B981" : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {task.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <PriDot pri={task.pri} />
      <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: task.done ? "#94A3B8" : "#1E293B", textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {task.date && <span style={{ fontSize: 11, color: late ? "#EF4444" : "#94A3B8" }}>{fdate(task.date)}</span>}
        {showProject && cl && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: cl.bg, color: cl.text, fontWeight: 500, border: `1px solid ${cl.border}` }}>{p.name}</span>}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 360, maxWidth: "94vw", boxShadow: "0 20px 60px rgba(0,0,0,.15)", border: "1px solid #F1F5F9" }}>
        {children}
      </div>
    </div>
  );
}

// ── Audio Player ──────────────────────────────────────────────────────────
function AudioPlayer({ src, name }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  function fmt(s) { if (!s || isNaN(s)) return "0:00"; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, "0")}`; }
  function toggle() { if (!audioRef.current) return; if (playing) { audioRef.current.pause(); setPlaying(false); } else { audioRef.current.play().catch(() => {}); setPlaying(true); } }
  function seek(e) { const rect = e.currentTarget.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); if (audioRef.current) audioRef.current.currentTime = pct * duration; }
  function changeSpeed(s) { setSpeed(s); if (audioRef.current) audioRef.current.playbackRate = s; }
  function skip(sec) { if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + sec)); }
  function changeVolume(v) { setVolume(v); if (audioRef.current) audioRef.current.volume = v; }
  return (
    <div style={{ background: "linear-gradient(135deg,#EFF6FF 0%,#F0FDF4 100%)", border: "1px solid #BFDBFE", borderRadius: 14, padding: "16px 18px" }}>
      <audio ref={audioRef} src={src}
        onTimeUpdate={() => { if (audioRef.current) { setCurrent(audioRef.current.currentTime); setProgress(audioRef.current.currentTime / audioRef.current.duration * 100 || 0); } }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)} />
      <div onClick={seek} style={{ height: 6, background: "#DBEAFE", borderRadius: 3, cursor: "pointer", marginBottom: 14, position: "relative" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#3B82F6,#6366F1)", borderRadius: 3, transition: "width .1s" }} />
        <div style={{ position: "absolute", top: "50%", left: `${progress}%`, transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: "#3B82F6", border: "2px solid #fff", boxShadow: "0 1px 4px rgba(59,130,246,.4)", pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => skip(-10)} style={{ border: "none", background: "rgba(59,130,246,.1)", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#3B82F6", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↩</button>
        <button onClick={toggle} style={{ width: 38, height: 38, borderRadius: "50%", background: "#3B82F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(59,130,246,.35)" }}>
          {playing ? <svg width="12" height="13" viewBox="0 0 12 13" fill="white"><rect x="0" y="0" width="4" height="13" rx="1.5" /><rect x="8" y="0" width="4" height="13" rx="1.5" /></svg> : <svg width="11" height="13" viewBox="0 0 11 13" fill="white"><path d="M1.5 1l8 5.5-8 5.5V1z" /></svg>}
        </button>
        <button onClick={() => skip(10)} style={{ border: "none", background: "rgba(59,130,246,.1)", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#3B82F6", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↪</button>
        <span style={{ fontSize: 12, color: "#475569", minWidth: 80 }}>{fmt(currentTime)} / {fmt(duration)}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>🔈</span>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => changeVolume(parseFloat(e.target.value))} style={{ width: 60, accentColor: "#3B82F6", cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[0.5, 1, 1.5, 2].map(s => (
            <button key={s} onClick={() => changeSpeed(s)} style={{ padding: "3px 7px", fontSize: 11, border: `1px solid ${speed === s ? "#3B82F6" : "#E2E8F0"}`, borderRadius: 5, cursor: "pointer", background: speed === s ? "#EFF6FF" : "#fff", color: speed === s ? "#3B82F6" : "#64748B", fontWeight: speed === s ? 600 : 400 }}>{s}×</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditableTitle({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) return (
    <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={() => { onChange(draft || value); setEditing(false); }}
      onKeyDown={e => { if (e.key === "Enter") { onChange(draft || value); setEditing(false); } if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
      style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", border: "none", outline: "none", borderBottom: "2px solid #3B82F6", background: "transparent", width: "100%", fontFamily: "inherit", padding: "0 0 2px" }} />
  );
  return <div onClick={() => { setDraft(value); setEditing(true); }} style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", cursor: "text", paddingBottom: 2 }} title="Click to rename">{value}</div>;
}

function LinkCard({ src, platform, icon }) {
  const [copied, setCopied] = useState(false);
  function copy() { navigator.clipboard?.writeText(src).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div><div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{platform}</div><div style={{ fontSize: 11, color: "#94A3B8" }}>External recording</div></div>
      </div>
      <div style={{ fontSize: 12, color: "#64748B", wordBreak: "break-all", background: "#fff", border: "1px solid #F1F5F9", borderRadius: 8, padding: "9px 12px", marginBottom: 14, lineHeight: 1.5 }}>{src}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a href={src} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#3B82F6", color: "#fff", borderRadius: 9, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Open recording ↗</a>
        <button onClick={copy} style={{ padding: "8px 16px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 9, cursor: "pointer", background: "#fff", color: copied ? "#10B981" : "#475569" }}>{copied ? "✓ Copied" : "Copy link"}</button>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>Supports Google Drive · Dropbox · Loom · Zoom · Otter.ai · YouTube · Direct MP3/MP4 URLs</div>
    </div>
  );
}

// ── Scripts View ──────────────────────────────────────────────────────────
function ScriptsView({ recordings, setRecordings }) {
  const [tab, setTab] = useState("upload");
  const [linkInput, setLinkInput] = useState("");
  const [linkName, setLinkName] = useState("");
  const [activeRec, setActiveRec] = useState(null);
  const [editNotes, setEditNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  function addLink() {
    const url = linkInput.trim(); if (!url) return;
    const name = linkName.trim() || url.split("/").pop()?.split("?")[0] || "Recording";
    const rec = { id: "r" + Date.now(), name, src: url, type: "link", notes: "", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) };
    setRecordings(rs => [rec, ...rs]); setActiveRec(rec.id); setLinkInput(""); setLinkName("");
  }
  function addFile(file) {
    if (!file || !file.type.match(/audio|video/)) return;
    const src = URL.createObjectURL(file);
    const rec = { id: "r" + Date.now(), name: file.name.replace(/\.[^.]+$/, ""), src, type: "file", notes: "", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), fileType: file.type, fileSize: (file.size / 1024 / 1024).toFixed(1) + " MB" };
    setRecordings(rs => [rec, ...rs]); setActiveRec(rec.id);
  }
  function handleFile(e) { addFile(e.target.files[0]); e.target.value = ""; }
  function handleDrop(e) { e.preventDefault(); setDragOver(false); addFile(e.dataTransfer.files[0]); }
  function deleteRec(id) { setRecordings(rs => rs.filter(r => r.id !== id)); if (activeRec === id) setActiveRec(null); }
  function saveNotes(id) { setRecordings(rs => rs.map(r => r.id === id ? { ...r, notes: notesDraft } : r)); setEditNotes(false); }
  function renameRec(id, name) { setRecordings(rs => rs.map(r => r.id === id ? { ...r, name } : r)); }
  const active = recordings.find(r => r.id === activeRec);
  const filtered = recordings.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.notes?.toLowerCase().includes(search.toLowerCase()));

  function getPlatformLabel(url) {
    if (!url) return "Link";
    if (url.includes("drive.google")) return "Google Drive";
    if (url.includes("dropbox")) return "Dropbox";
    if (url.includes("loom.com")) return "Loom";
    if (url.includes("zoom.us")) return "Zoom";
    if (url.includes("otter.ai")) return "Otter.ai";
    if (url.includes("rev.com")) return "Rev";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.match(/\.(mp3|wav|m4a|ogg|flac|aac)(\?|$)/i)) return "Direct audio";
    if (url.match(/\.(mp4|mov|webm|mkv)(\?|$)/i)) return "Direct video";
    return "External link";
  }
  function getPlatformIcon(url) {
    if (!url) return "🔗";
    if (url.includes("drive.google")) return "📁";
    if (url.includes("dropbox")) return "📦";
    if (url.includes("loom.com")) return "🎬";
    if (url.includes("zoom.us")) return "📹";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "▶️";
    if (url.match(/\.(mp3|wav|m4a|ogg|flac|aac)(\?|$)/i)) return "🎵";
    return "🔗";
  }

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ width: 270, borderRight: "1px solid #F1F5F9", display: "flex", flexDirection: "column", flexShrink: 0, background: "#FAFAFA" }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #F1F5F9", background: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", letterSpacing: "0.8px", marginBottom: 12 }}>ADD RECORDING</div>
          <div style={{ display: "flex", background: "#F8FAFC", borderRadius: 8, padding: 3, marginBottom: 12, border: "1px solid #F1F5F9" }}>
            {[["upload", "⬆ Upload file"], ["link", "🔗 Paste link"]].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "6px 4px", fontSize: 12, border: tab === t ? "1px solid #E2E8F0" : "none", background: tab === t ? "#fff" : "transparent", borderRadius: 6, cursor: "pointer", color: tab === t ? "#1E293B" : "#64748B", fontWeight: tab === t ? 500 : 400 }}>{l}</button>
            ))}
          </div>
          {tab === "upload" && (
            <>
              <input ref={fileRef} type="file" accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm" style={{ display: "none" }} onChange={handleFile} />
              <div onClick={() => fileRef.current.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                style={{ padding: "20px 12px", border: `2px dashed ${dragOver ? "#3B82F6" : "#CBD5E1"}`, borderRadius: 10, cursor: "pointer", background: dragOver ? "#EFF6FF" : "#F8FAFC", textAlign: "center", transition: "all .15s" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🎙</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 3 }}>Click or drag & drop</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>MP3, WAV, M4A, MP4, MOV…</div>
              </div>
            </>
          )}
          {tab === "link" && (
            <div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>Works with Google Drive, Dropbox, Loom, Zoom, Otter.ai, direct MP3 links</div>
              <input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="Label (e.g. TikTok script — Jun 7)" style={{ ...inp, marginBottom: 7, fontSize: 12 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <input value={linkInput} onChange={e => setLinkInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addLink()} placeholder="https://…" style={{ ...inp, fontSize: 12, flex: 1 }} />
                <button onClick={addLink} style={{ padding: "7px 11px", fontSize: 12, border: "none", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>Add</button>
              </div>
            </div>
          )}
        </div>
        {recordings.length > 0 && (
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #F1F5F9", background: "#fff" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recordings…" style={{ ...inp, fontSize: 12, background: "#F8FAFC" }} />
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "28px 12px", color: "#94A3B8", fontSize: 12, lineHeight: 1.7 }}>
              {recordings.length === 0 ? (<><div style={{ fontSize: 28, marginBottom: 8 }}>🎙</div>No recordings yet<br />Upload a file or paste a link above</>) : "No results"}
            </div>
          )}
          {filtered.map(r => {
            const isActive = activeRec === r.id;
            return (
              <div key={r.id} onClick={() => { setActiveRec(r.id); setEditNotes(false); }}
                style={{ padding: "10px 11px", borderRadius: 9, cursor: "pointer", background: isActive ? "#EFF6FF" : "transparent", border: isActive ? "1px solid #BFDBFE" : "1px solid transparent", marginBottom: 4, transition: "all .12s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{r.type === "file" ? "🎙" : getPlatformIcon(r.src)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? "#1E40AF" : "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{r.date} · {r.type === "file" ? (r.fileType?.split("/")[1]?.toUpperCase() || "Audio") + (r.fileSize ? ` · ${r.fileSize}` : "") : getPlatformLabel(r.src)}</div>
                    {r.notes && <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.notes}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteRec(r.id); }}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "#CBD5E1", fontSize: 16, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}
                    onMouseEnter={e => e.target.style.color = "#EF4444"} onMouseLeave={e => e.target.style.color = "#CBD5E1"}>×</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {!active ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8", padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>🎙</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#475569", marginBottom: 6 }}>No recording selected</div>
            <div style={{ fontSize: 13, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>Upload an audio file or paste a link — then add your script, timestamps, and notes here.</div>
          </div>
        ) : (
          <div style={{ padding: "22px 28px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <EditableTitle value={active.name} onChange={name => renameRec(active.id, name)} />
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>{active.date} · {active.type === "file" ? (active.fileType?.split("/")[1]?.toUpperCase() || "Audio") + (active.fileSize ? ` · ${active.fileSize}` : "") : getPlatformLabel(active.src)}</div>
              </div>
            </div>
            {active.type === "file" ? <AudioPlayer key={active.id} src={active.src} name={active.name} /> : <LinkCard src={active.src} platform={getPlatformLabel(active.src)} icon={getPlatformIcon(active.src)} />}
            <div style={{ height: 1, background: "#F1F5F9", margin: "22px 0" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📝</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Script & notes</span>
                  {active.notes && <span style={{ fontSize: 11, background: "#F0FDF4", color: "#065F46", border: "1px solid #A7F3D0", borderRadius: 8, padding: "1px 7px" }}>Saved</span>}
                </div>
                {!editNotes ? (
                  <button onClick={() => { setNotesDraft(active.notes || ""); setEditNotes(true); }} style={{ fontSize: 12, padding: "5px 12px", border: "1px solid #E2E8F0", borderRadius: 7, cursor: "pointer", background: "#fff", color: "#475569" }}>✏️ Edit</button>
                ) : (
                  <div style={{ display: "flex", gap: 7 }}>
                    <button onClick={() => setEditNotes(false)} style={{ fontSize: 12, padding: "5px 12px", border: "1px solid #E2E8F0", borderRadius: 7, cursor: "pointer", background: "#fff", color: "#64748B" }}>Cancel</button>
                    <button onClick={() => saveNotes(active.id)} style={{ fontSize: 12, padding: "5px 12px", border: "none", borderRadius: 7, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>Save</button>
                  </div>
                )}
              </div>
              {!active.notes && !editNotes && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {["Add timestamps", "Paste script", "Key takeaways", "Action items", "Follow-ups"].map(hint => (
                    <button key={hint} onClick={() => { setNotesDraft(hint + ":\n"); setEditNotes(true); }} style={{ fontSize: 11, padding: "4px 10px", border: "1px solid #E2E8F0", borderRadius: 20, cursor: "pointer", background: "#F8FAFC", color: "#64748B" }}>+ {hint}</button>
                  ))}
                </div>
              )}
              {editNotes ? (
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} autoFocus
                  placeholder={"Paste your script here, add timestamps, action items, key quotes…\n\nExample:\n0:00 – Intro\n1:45 – Main point\n\nAction items:\n- Follow up by Friday"}
                  style={{ flex: 1, minHeight: 220, padding: "14px 16px", fontSize: 13, border: "1px solid #CBD5E1", borderRadius: 12, outline: "none", resize: "vertical", fontFamily: "inherit", color: "#1E293B", lineHeight: 1.8, boxSizing: "border-box", background: "#fff" }} />
              ) : (
                <div onClick={() => { setNotesDraft(active.notes || ""); setEditNotes(true); }}
                  style={{ flex: 1, minHeight: 160, padding: "14px 16px", background: active.notes ? "#fff" : "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 12, fontSize: 13, color: active.notes ? "#1E293B" : "#94A3B8", lineHeight: 1.8, whiteSpace: "pre-wrap", cursor: "text", wordBreak: "break-word" }}>
                  {active.notes || "Click to add a script, timestamps, or notes for this recording…"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(() => load("focus_projects", DEFAULT_PROJECTS));
  const [tasks,    setTasks]    = useState(() => load("focus_tasks",    DEFAULT_TASKS));
  const [recordings, setRecordings] = useState(() => load("focus_recordings", []));
  const [view,      setView]    = useState("today");
  const [sub,       setSub]     = useState("list");
  const [activeProj,setActiveProj] = useState(null);
  const [modal,     setModal]   = useState(null);
  const [qi,        setQi]      = useState("");
  const [qp,        setQp]      = useState("");
  const [qpri,      setQpri]    = useState("med");
  const [qd,        setQd]      = useState(dstr(0));
  const [aiInput,   setAiInput] = useState("");
  const [aiResp,    setAiResp]  = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [editTask,  setEditTask] = useState(null);
  const [mName,     setMName]   = useState("");

  // ── Persist on every change ─────────────────────────────────────
  useEffect(() => { save("focus_projects",    projects);    }, [projects]);
  useEffect(() => { save("focus_tasks",       tasks);       }, [tasks]);
  useEffect(() => {
    // Don't persist blob URLs (file uploads) — they die on page reload
    const safe = recordings.map(r => r.type === "file" ? { ...r, src: "" } : r);
    save("focus_recordings", safe);
  }, [recordings]);

  const gp = id => projects.find(p => p.id === id);
  function toggleDone(id) { setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function quickAdd() {
    if (!qi.trim()) return;
    setTasks(ts => [...ts, { id: "t" + Date.now(), title: qi.trim(), project: qp || projects[0]?.id || "", pri: qpri, date: qd || dstr(0), done: false, notes: "" }]);
    setQi("");
  }
  function svt(v) { setView(v); setActiveProj(null); }
  function openProj(id) { setView("project"); setActiveProj(id); }

  async function runAI() {
    const q = aiInput.trim();
    const prompt = q || "Help me prioritize my tasks and decide what to focus on today.";
    setAiLoading(true); setAiResp(""); setAiInput("");
    const sum = tasks.filter(t => !t.done).map(t => `"${t.title}" (${gp(t.project)?.name || "no project"}, due ${t.date || "no date"}, ${t.pri} priority)`).join("; ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: `You are a concise productivity coach for a creator and entrepreneur. Open tasks: ${sum}. Question: "${prompt}". Reply in 2-3 practical sentences.` }] })
      });
      const data = await res.json();
      setAiResp(data.content?.find(b => b.type === "text")?.text || "No response.");
    } catch { setAiResp("Couldn't reach AI. Try again."); }
    setAiLoading(false);
  }

  function saveTask() {
    if (!editTask?.title?.trim()) return;
    if (editTask.id) setTasks(ts => ts.map(t => t.id === editTask.id ? editTask : t));
    else setTasks(ts => [...ts, { ...editTask, id: "t" + Date.now(), done: false }]);
    setModal(null); setEditTask(null);
  }
  function deleteTask(id) { setTasks(ts => ts.filter(t => t.id !== id)); setModal(null); setEditTask(null); }
  function saveProject() {
    if (!mName.trim()) return;
    setProjects(ps => [...ps, { id: "p" + Date.now(), name: mName.trim(), c: ps.length }]);
    setModal(null); setMName("");
  }
  function openTaskModal(id) {
    setEditTask(id ? { ...tasks.find(t => t.id === id) } : { title: "", project: activeProj || projects[0]?.id || "", pri: "med", date: dstr(0), notes: "" });
    setModal({ type: "task", id });
  }

  const isScripts = view === "scripts";
  const viewTitle = { today: "Today", week: "This week", overview: "Big picture", scripts: "Scripts & recordings" }[view] || (gp(activeProj)?.name || "Project");

  function renderToday() {
    const ov   = tasks.filter(t => !t.done && t.date && t.date < dstr(0));
    const due  = tasks.filter(t => !t.done && t.date === dstr(0));
    const done = tasks.filter(t => t.done && t.date === dstr(0));
    if (sub === "board") return renderBoard(tasks.filter(t => t.date === dstr(0) || (!t.done && t.date < dstr(0))));
    return (<div>
      {ov.length   > 0 && <><div style={{ ...sHead, color: "#EF4444" }}>⚠ Overdue ({ov.length})</div>{ov.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
      {due.length  > 0 && <><div style={sHead}>Due today ({due.length})</div>{due.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
      {done.length > 0 && <><div style={{ ...sHead, color: "#94A3B8" }}>Completed ({done.length})</div>{done.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
      {!ov.length && !due.length && !done.length && <div style={empty}><div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>Nothing scheduled for today</div>}
    </div>);
  }

  function renderProject() {
    const todo = tasks.filter(t => t.project === activeProj && !t.done);
    const done = tasks.filter(t => t.project === activeProj && t.done);
    if (sub === "board") return renderBoard(tasks.filter(t => t.project === activeProj));
    return (<div>
      {todo.length > 0 && <><div style={sHead}>Tasks ({todo.length})</div>{todo.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} showProject={false} />)}</>}
      {done.length > 0 && <><div style={{ ...sHead, color: "#94A3B8" }}>Done ({done.length})</div>{done.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} showProject={false} />)}</>}
      {!tasks.filter(t => t.project === activeProj).length && <div style={empty}><div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>No tasks yet</div>}
    </div>);
  }

  function renderWeek() {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const today = new Date();
    const cols = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - today.getDay() + i);
      const ds = d.toISOString().split("T")[0]; const isT = ds === dstr(0);
      const dt = tasks.filter(t => t.date === ds);
      return (<div key={i} style={{ background: isT ? "#fff" : "#F8FAFC", border: isT ? "1px solid #CBD5E1" : "1px solid #F1F5F9", borderRadius: 10, padding: "10px 8px", minHeight: 110 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", marginBottom: 3 }}>{days[i]}</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: isT ? "#3B82F6" : "#1E293B" }}>{d.getDate()}</div>
        {dt.map(t => { const p = gp(t.project); const c = p ? COLORS[p.c % COLORS.length] : { bg: "#F8FAFC", text: "#475569" }; return <div key={t.id} onClick={() => openTaskModal(t.id)} style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, marginBottom: 3, background: c.bg, color: c.text, cursor: "pointer", lineHeight: 1.4, wordBreak: "break-word" }} title={t.title}>{t.title.length > 18 ? t.title.slice(0, 16) + "…" : t.title}</div>; })}
      </div>);
    });
    const upcoming = tasks.filter(t => !t.done && t.date > dstr(6) && t.date <= dstr(14));
    return (<div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7, marginBottom: 20 }}>{cols}</div>
      {upcoming.length > 0 && <><div style={sHead}>Upcoming — next 2 weeks</div>{upcoming.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} />)}</>}
    </div>);
  }

  function renderOverview() {
    const total = tasks.length, done = tasks.filter(t => t.done).length;
    const late = tasks.filter(t => !t.done && t.date < dstr(0)).length;
    const today = tasks.filter(t => t.date === dstr(0) && !t.done).length;
    return (<div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 12 }}>PROJECT PROGRESS</div>
          {projects.map(p => { const pt = tasks.filter(t => t.project === p.id); const pd = pt.filter(t => t.done).length; const pct = pt.length ? Math.round(pd / pt.length * 100) : 0; const c = COLORS[p.c % COLORS.length]; return (<div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} /><span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span><div style={{ width: 70, height: 4, background: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: c.dot, borderRadius: 2 }} /></div><span style={{ fontSize: 11, color: "#94A3B8", minWidth: 28, textAlign: "right" }}>{pct}%</span></div>); })}
        </div>
        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 12 }}>AT A GLANCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["#1E293B", total - done, "Open tasks"], ["#10B981", done, "Completed"], ["#EF4444", late, "Overdue"], ["#3B82F6", today, "Due today"]].map(([color, num, label]) => (<div key={label} style={{ background: "#fff", borderRadius: 8, padding: "9px 11px" }}><div style={{ fontSize: 22, fontWeight: 600, color }}>{num}</div><div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{label}</div></div>))}
          </div>
        </div>
      </div>
      {projects.map(p => { const pt = tasks.filter(t => t.project === p.id && !t.done); if (!pt.length) return null; const c = COLORS[p.c % COLORS.length]; return (<div key={p.id}><div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 8px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} /><span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{p.name}</span></div>{pt.map(t => <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleDone} onClick={() => openTaskModal(t.id)} showProject={false} />)}</div>); })}
    </div>);
  }

  function renderBoard(taskList) {
    const cols = [{ l: "To do", f: t => !t.done && t.date !== dstr(0) }, { l: "Today", f: t => !t.done && t.date === dstr(0) }, { l: "Done", f: t => t.done }];
    return (<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
      {cols.map(col => { const ct = taskList.filter(col.f); return (<div key={col.l} style={{ background: "#F8FAFC", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>{col.l} <span style={{ color: "#CBD5E1" }}>({ct.length})</span></div>{ct.map(t => { const p = gp(t.project); const c = p ? COLORS[p.c % COLORS.length] : null; return (<div key={t.id} onClick={() => openTaskModal(t.id)} style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 8, padding: "8px 10px", marginBottom: 6, cursor: "pointer", fontSize: 12, lineHeight: 1.5 }}>{t.title}{c && <div><span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: c.bg, color: c.text, marginTop: 4, display: "inline-block" }}>{p.name}</span></div>}</div>); })}</div>); })}
    </div>);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1E293B", background: "#F8FAFC", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ background: "#fff", borderRight: "1px solid #F1F5F9", display: "flex", flexDirection: "column", padding: "16px 0", overflowY: "auto" }}>
          <div style={{ padding: "0 16px 14px", fontSize: 15, fontWeight: 600, borderBottom: "1px solid #F1F5F9", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, color: "#0F172A" }}>
            <div style={{ width: 26, height: 26, background: "#3B82F6", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" /><rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".6" /><rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".6" /><rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" /></svg>
            </div>
            Focus
          </div>
          {[
            { id: "today",    icon: "☀",  label: "Today" },
            { id: "week",     icon: "📅", label: "This week" },
            { id: "overview", icon: "◎",  label: "Big picture" },
            { id: "scripts",  icon: "🎙", label: "Scripts", badge: recordings.length || null },
          ].map(({ id, icon, label, badge }) => (
            <div key={id} onClick={() => svt(id)} style={{ padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: view === id ? "#1E293B" : "#64748B", fontWeight: view === id ? 600 : 400, background: view === id ? "#F8FAFC" : "transparent", borderRight: view === id ? "2px solid #3B82F6" : "2px solid transparent" }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badge ? <span style={{ fontSize: 10, background: "#EFF6FF", color: "#3B82F6", border: "1px solid #BFDBFE", borderRadius: 8, padding: "1px 6px", fontWeight: 600 }}>{badge}</span> : null}
            </div>
          ))}
          <div style={{ padding: "14px 16px 6px", fontSize: 10, fontWeight: 700, color: "#CBD5E1", letterSpacing: "0.8px" }}>PROJECTS</div>
          {projects.map(p => {
            const c = COLORS[p.c % COLORS.length]; const active = view === "project" && activeProj === p.id;
            return (<div key={p.id} onClick={() => openProj(p.id)} style={{ padding: "7px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: active ? "#1E293B" : "#64748B", fontWeight: active ? 600 : 400, background: active ? "#F8FAFC" : "transparent", borderRight: active ? `2px solid ${c.dot}` : "2px solid transparent" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />{p.name}
            </div>);
          })}
          <button onClick={() => { setMName(""); setModal({ type: "project" }); }} style={{ margin: "10px 16px 0", padding: "7px 10px", fontSize: 12, border: "1px dashed #CBD5E1", borderRadius: 8, cursor: "pointer", color: "#94A3B8", background: "transparent", textAlign: "left", display: "flex", alignItems: "center", gap: 5 }}>
            + New project
          </button>
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#fff", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, flex: 1, color: "#0F172A" }}>{viewTitle}</div>
            {!isScripts && <div style={{ display: "flex", gap: 3, background: "#F8FAFC", borderRadius: 8, padding: 3 }}>
              {[["list", "≡ List"], ["board", "⊞ Board"]].map(([v, l]) => (
                <button key={v} onClick={() => setSub(v)} style={{ padding: "4px 10px", fontSize: 12, border: sub === v ? "1px solid #E2E8F0" : "none", background: sub === v ? "#fff" : "transparent", borderRadius: 6, cursor: "pointer", color: sub === v ? "#1E293B" : "#64748B", fontWeight: sub === v ? 500 : 400 }}>{l}</button>
              ))}
            </div>}
          </div>

          {isScripts ? (
            <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
              <ScriptsView recordings={recordings} setRecordings={setRecordings} />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderBottom: "1px solid #F1F5F9", background: "#fff", flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                <input value={qi} onChange={e => setQi(e.target.value)} onKeyDown={e => e.key === "Enter" && quickAdd()} placeholder="Quick capture — type a task and hit Enter" style={{ flex: 1, minWidth: 180, padding: "8px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", color: "#1E293B" }} />
                <select value={qp} onChange={e => setQp(e.target.value)} style={{ padding: "7px 9px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, color: "#64748B", background: "#fff" }}>
                  <option value="">Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={qpri} onChange={e => setQpri(e.target.value)} style={{ padding: "7px 9px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, color: "#64748B", background: "#fff" }}>
                  <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
                </select>
                <input type="date" value={qd} onChange={e => setQd(e.target.value)} style={{ padding: "7px 9px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, color: "#64748B", background: "#fff" }} />
                <button onClick={quickAdd} style={{ padding: "7px 14px", fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#fff", color: "#1E293B", fontWeight: 500 }}>+ Add</button>
              </div>

              {(aiResp || aiLoading) && (
                <div style={{ margin: "12px 20px 0", padding: "12px 14px", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, fontSize: 13, color: "#0C4A6E", lineHeight: 1.7, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, marginRight: 7 }}>✦</span>
                  {aiLoading ? "Thinking…" : aiResp}
                  {aiResp && <button onClick={() => setAiResp("")} style={{ marginLeft: 10, fontSize: 11, border: "none", background: "transparent", cursor: "pointer", color: "#7DD3FC" }}>×</button>}
                </div>
              )}

              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {view === "today"    && renderToday()}
                {view === "week"     && renderWeek()}
                {view === "overview" && renderOverview()}
                {view === "project"  && renderProject()}
              </div>

              <div style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", background: "#fff", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 16, color: "#94A3B8" }}>✦</span>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && runAI()} placeholder="Ask AI: what should I focus on? summarize my week? prioritize today…" style={{ flex: 1, padding: "8px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, outline: "none", color: "#1E293B" }} />
                <button onClick={runAI} disabled={aiLoading} style={{ padding: "8px 14px", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>{aiLoading ? "…" : "Ask ↗"}</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "project" && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>New project</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5 }}>Name</label>
            <input autoFocus value={mName} onChange={e => setMName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveProject()} placeholder="Project name" style={inp} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setModal(null)} style={{ padding: "7px 14px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#fff", color: "#64748B" }}>Cancel</button>
            <button onClick={saveProject} style={{ padding: "7px 14px", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>Create</button>
          </div>
        </Modal>
      )}

      {modal?.type === "task" && editTask && (
        <Modal onClose={() => { setModal(null); setEditTask(null); }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{modal.id ? "Edit task" : "New task"}</div>
          {[
            ["Title",    <input key="t" autoFocus value={editTask.title} onChange={e => setEditTask(et => ({ ...et, title: e.target.value }))} style={inp} />],
            ["Project",  <select key="p" value={editTask.project} onChange={e => setEditTask(et => ({ ...et, project: e.target.value }))} style={inp}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>],
            ["Due date", <input key="d" type="date" value={editTask.date} onChange={e => setEditTask(et => ({ ...et, date: e.target.value }))} style={inp} />],
            ["Priority", <select key="pr" value={editTask.pri} onChange={e => setEditTask(et => ({ ...et, pri: e.target.value }))} style={inp}><option value="high">High</option><option value="med">Medium</option><option value="low">Low</option></select>],
            ["Notes",    <textarea key="n" value={editTask.notes} onChange={e => setEditTask(et => ({ ...et, notes: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />],
          ].map(([label, el]) => (
            <div key={label} style={{ marginBottom: 11 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5 }}>{label}</label>
              {el}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            {modal.id && <button onClick={() => deleteTask(modal.id)} style={{ padding: "7px 14px", fontSize: 13, border: "1px solid #FCA5A5", borderRadius: 8, cursor: "pointer", background: "#FEF2F2", color: "#EF4444", marginRight: "auto" }}>Delete</button>}
            <button onClick={() => { setModal(null); setEditTask(null); }} style={{ padding: "7px 14px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", background: "#fff", color: "#64748B" }}>Cancel</button>
            <button onClick={saveTask} style={{ padding: "7px 14px", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", background: "#3B82F6", color: "#fff", fontWeight: 500 }}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
