import { useState, useMemo, useCallback } from "react";

// ─── Data Generation ───────────────────────────────────────────────────────
const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "NIT Trichy", "BITS Pilani",
  "IIT Kanpur", "VIT Vellore", "IIT Roorkee", "IIIT Hyderabad", "IIT Kharagpur",
  "Jadavpur University", "DTU Delhi", "IIT Guwahati", "NSUT Delhi", "IIT BHU",
  "Manipal Institute", "SRM University", "Thapar University", "IIIT Bangalore", "Amrita University"
];
const FIRST = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Riya","Anya","Ishaan","Dhruv","Kabir","Krish","Arnav","Shaurya","Ananya","Priya","Neha","Pooja","Sneha","Rahul","Rohan","Karthik","Lakshya","Manav","Divya","Meera","Avni","Kritika","Tanvi","Zara","Ayaan","Sahil","Nikhil","Dev","Aditi","Shreya","Naina","Simran","Pallavi","Harsh","Varun","Yash","Ishan","Parth","Shruti","Kavya","Trisha","Disha","Jiya"];
const LAST = ["Sharma","Patel","Verma","Singh","Kumar","Gupta","Mehta","Joshi","Agarwal","Nair","Reddy","Rao","Iyer","Pillai","Menon","Shah","Malhotra","Kapoor","Banerjee","Chatterjee"];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateCandidates(n = 100) {
  return Array.from({ length: n }, (_, i) => {
    const assignment_score = rand(30, 100);
    const video_score = rand(25, 100);
    const ats_score = rand(40, 100);
    const github_score = rand(20, 100);
    const communication_score = rand(30, 100);
    const priority_score = Math.round(
      assignment_score * 0.30 + video_score * 0.25 + ats_score * 0.20 +
      github_score * 0.15 + communication_score * 0.10
    );
    const priority = priority_score >= 80 ? "P0" : priority_score >= 65 ? "P1" : priority_score >= 50 ? "P2" : "P3";
    return {
      id: i + 1,
      name: `${FIRST[i % FIRST.length]} ${LAST[rand(0, LAST.length - 1)]}`,
      college: COLLEGES[rand(0, COLLEGES.length - 1)],
      assignment_score, video_score, ats_score, github_score, communication_score,
      priority_score, priority,
      status: ["pending", "reviewed", "shortlisted"][rand(0, 2)],
      assignment_eval: null,
      video_eval: null,
      timestamp_notes: [],
    };
  });
}

const INITIAL_CANDIDATES = generateCandidates(100);

function calcPriority(scores) {
  const ps = Math.round(
    (scores.assignment_score || 0) * 0.30 +
    (scores.video_score || 0) * 0.25 +
    (scores.ats_score || 0) * 0.20 +
    (scores.github_score || 0) * 0.15 +
    (scores.communication_score || 0) * 0.10
  );
  const p = ps >= 80 ? "P0" : ps >= 65 ? "P1" : ps >= 50 ? "P2" : "P3";
  return { priority_score: ps, priority: p };
}

const PRIORITY_META = {
  P0: { label: "Interview Now",    color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)"  },
  P1: { label: "Strong Shortlist", color: "#eab308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.4)" },
  P2: { label: "Review Later",     color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)" },
  P3: { label: "Reject",           color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)"  },
};

const SCORE_COLORS = {
  assignment: "#818cf8",
  video:      "#38bdf8",
  ats:        "#34d399",
  github:     "#f472b6",
  communication: "#fb923c",
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function ScoreBar({ value, color = "#6366f1" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: "#64748b", minWidth: 26, textAlign: "right", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function PBadge({ p, small }) {
  const m = PRIORITY_META[p];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: small ? "2px 9px" : "4px 12px",
      borderRadius: 99, fontSize: small ? 11 : 12, fontWeight: 800,
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
      letterSpacing: "0.05em",
    }}>{p}</span>
  );
}

function SliderRow({ label, value, onChange, max = 5 }) {
  const pct = (value / max) * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#818cf8" : pct >= 40 ? "#eab308" : "#ef4444";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}<span style={{ color: "#475569", fontWeight: 400 }}>/{max}</span></span>
      </div>
      <input type="range" min={0} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer", background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)` }} />
    </div>
  );
}

function Avatar({ name, id, size = 36 }) {
  const colors = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777","#0284c7"];
  const bg = colors[id % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 800, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px" }}>
      {name.charAt(0)}
    </div>
  );
}

function ScoreChip({ value }) {
  const color = value >= 75 ? "#22c55e" : value >= 55 ? "#eab308" : "#ef4444";
  return <span style={{ fontWeight: 700, color, fontSize: 14 }}>{value}</span>;
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ assignment: [0,100], video: [0,100], ats: [0,100], status: "all" });
  const [sortBy, setSortBy] = useState("priority");
  const [selected, setSelected] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");

  const filtered = useMemo(() => {
    let list = candidates.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.college.toLowerCase().includes(search.toLowerCase())) return false;
      if (c.assignment_score < filters.assignment[0] || c.assignment_score > filters.assignment[1]) return false;
      if (c.video_score < filters.video[0] || c.video_score > filters.video[1]) return false;
      if (c.ats_score < filters.ats[0] || c.ats_score > filters.ats[1]) return false;
      if (filters.status !== "all" && c.status !== filters.status) return false;
      return true;
    });
    const PORDER = { P0:0, P1:1, P2:2, P3:3 };
    if (sortBy === "priority") list.sort((a,b) => PORDER[a.priority] - PORDER[b.priority]);
    else if (sortBy === "assignment") list.sort((a,b) => b.assignment_score - a.assignment_score);
    else if (sortBy === "video") list.sort((a,b) => b.video_score - a.video_score);
    return list;
  }, [candidates, search, filters, sortBy]);

  const stats = useMemo(() => ({
    total: candidates.length,
    reviewed: candidates.filter(c => c.status === "reviewed").length,
    shortlisted: candidates.filter(c => c.status === "shortlisted").length,
    pending: candidates.filter(c => c.status === "pending").length,
  }), [candidates]);

  const updateCandidate = useCallback((id, updates) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const merged = { ...c, ...updates };
      const { priority_score, priority } = calcPriority(merged);
      return { ...merged, priority_score, priority };
    }));
    setSelected(prev => {
      if (!prev || prev.id !== id) return prev;
      const merged = { ...prev, ...updates };
      const { priority_score, priority } = calcPriority(merged);
      return { ...merged, priority_score, priority };
    });
  }, []);

  const toggleCompare = (c) => {
    setCompareList(prev => {
      if (prev.find(x => x.id === c.id)) return prev.filter(x => x.id !== c.id);
      if (prev.length >= 3) return prev;
      return [...prev, c];
    });
  };

  const selectedFull = selected ? candidates.find(c => c.id === selected.id) || selected : null;

  // ── Shared style tokens ──────────────────────────────────────────────────
  const card = { background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 };
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const selectStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, color: "#e2e8f0", padding: "7px 10px", fontSize: 13, outline: "none", width: "100%", cursor: "pointer" };
  const btnStyle = (active) => ({ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: active ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)", background: active ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)", color: active ? "#a5b4fc" : "#64748b", transition: "all 0.15s" });
  const th = { padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", background: "#0a0f1e" };
  const td = { padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#060a12", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Top Bar ── */}
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "rgba(10,15,30,0.98)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>HireScope</span>
          </div>
          <span style={{ fontSize: 12, color: "#334155", borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 20 }}>Candidate Review Dashboard</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {compareList.length > 0 && (
            <span style={{ fontSize: 12, color: "#818cf8", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 99, padding: "3px 10px" }}>
              {compareList.length} selected
            </span>
          )}
          <button style={btnStyle(view === "list")} onClick={() => setView("list")}>☰ List</button>
          <button style={btnStyle(view === "compare")} onClick={() => setView("compare")}>⚡ Compare</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", background: "#080d1a", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          
          {/* Stats mini */}
          <div style={{ padding: "14px 14px 0" }}>
            <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[["Total", stats.total, "#6366f1"],["Reviewed", stats.reviewed, "#38bdf8"],["Listed", stats.shortlisted, "#22c55e"],["Pending", stats.pending, "#f59e0b"]].map(([l,v,c]) => (
                <div key={l} style={{ ...card, padding: "10px 12px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 14px" }} />

          {/* Filters */}
          <div style={{ padding: "14px 14px 0" }}>
            <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Search & Filter</div>
            
            <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="🔍 Name or college…" value={search} onChange={e => setSearch(e.target.value)} />

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 5, fontWeight: 600 }}>Status</div>
              <select style={selectStyle} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="all">All Candidates</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
              </select>
            </div>

            {[["Assignment", "assignment", SCORE_COLORS.assignment],["Video", "video", SCORE_COLORS.video],["ATS Score", "ats", SCORE_COLORS.ats]].map(([label, key, color]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 5, fontWeight: 600 }}>
                  <span>{label}</span>
                  <span style={{ color }}>{filters[key][0]}–{filters[key][1]}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="range" min={0} max={100} value={filters[key][0]} onChange={e => setFilters(f => ({ ...f, [key]: [+e.target.value, f[key][1]] }))} style={{ flex: 1, accentColor: color }} />
                  <input type="range" min={0} max={100} value={filters[key][1]} onChange={e => setFilters(f => ({ ...f, [key]: [f[key][0], +e.target.value] }))} style={{ flex: 1, accentColor: color }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 14px" }} />

          {/* Sort */}
          <div style={{ padding: "14px 14px 0" }}>
            <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Sort By</div>
            {[["priority","⬡ Priority Score"],["assignment","💻 Assignment"],["video","🎥 Video"]].map(([k,l]) => (
              <button key={k} onClick={() => setSortBy(k)} style={{ ...btnStyle(sortBy === k), display: "block", width: "100%", textAlign: "left", marginBottom: 6 }}>{l}</button>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "14px 14px 0" }} />

          {/* Legend */}
          <div style={{ padding: "14px 14px 20px" }}>
            <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Priority</div>
            {Object.entries(PRIORITY_META).map(([p, m]) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <PBadge p={p} small />
                <span style={{ fontSize: 11, color: "#475569" }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Panel ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {view === "list" ? (
            <>
              {/* Priority Distribution */}
              <div style={{ display: "flex", gap: 10 }}>
                {["P0","P1","P2","P3"].map(p => {
                  const cnt = filtered.filter(c => c.priority === p).length;
                  const pct = filtered.length ? Math.round(cnt/filtered.length*100) : 0;
                  const m = PRIORITY_META[p];
                  return (
                    <div key={p} style={{ ...card, flex: 1, padding: "12px 16px", borderColor: m.border }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 26, fontWeight: 900, color: m.color, lineHeight: 1 }}>{cnt}</div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{m.label}</div>
                        </div>
                        <PBadge p={p} small />
                      </div>
                      <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>{pct}% of {filtered.length} filtered</div>
                    </div>
                  );
                })}
              </div>

              {/* Compare bar */}
              {compareList.length > 0 && (
                <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600 }}>⚡ {compareList.length} candidate{compareList.length > 1 ? "s" : ""} selected</span>
                  <div style={{ display: "flex", gap: 6, flex: 1 }}>
                    {compareList.map(c => <span key={c.id} style={{ fontSize: 12, background: "rgba(99,102,241,0.2)", color: "#818cf8", borderRadius: 6, padding: "2px 8px" }}>{c.name.split(" ")[0]}</span>)}
                  </div>
                  <button style={btnStyle(true)} onClick={() => setView("compare")}>Compare →</button>
                  <button style={{ ...btnStyle(false), color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} onClick={() => setCompareList([])}>Clear</button>
                </div>
              )}

              {/* Table */}
              <div style={{ ...card, overflow: "hidden", flex: 1 }}>
                <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 320px)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                      <tr>
                        <th style={{ ...th, width: 36, padding: "11px 10px 11px 16px" }}></th>
                        <th style={th}>#</th>
                        <th style={th}>Candidate</th>
                        <th style={th}>College</th>
                        <th style={{ ...th, textAlign: "center" }}>Assign.</th>
                        <th style={{ ...th, textAlign: "center" }}>Video</th>
                        <th style={{ ...th, textAlign: "center" }}>ATS</th>
                        <th style={{ ...th, textAlign: "center" }}>GitHub</th>
                        <th style={{ ...th, textAlign: "center" }}>Comm.</th>
                        <th style={th}>Priority</th>
                        <th style={th}>Status</th>
                        <th style={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c, idx) => {
                        const isSel = selectedFull?.id === c.id;
                        const inCmp = !!compareList.find(x => x.id === c.id);
                        return (
                          <tr key={c.id}
                            style={{ background: isSel ? "rgba(99,102,241,0.08)" : "transparent", transition: "background 0.12s", cursor: "pointer" }}
                            onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                            onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                            <td style={{ ...td, padding: "11px 8px 11px 16px" }}>
                              <input type="checkbox" checked={inCmp} onChange={() => toggleCompare(c)} onClick={e => e.stopPropagation()} style={{ accentColor: "#818cf8", cursor: "pointer", width: 14, height: 14 }} />
                            </td>
                            <td style={{ ...td, color: "#334155", fontSize: 12 }} onClick={() => { setSelected(c); setActiveTab("overview"); }}>{idx + 1}</td>
                            <td style={td} onClick={() => { setSelected(c); setActiveTab("overview"); }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Avatar name={c.name} id={c.id} size={34} />
                                <div>
                                  <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>{c.name}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ ...td, color: "#64748b", fontSize: 12, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => { setSelected(c); setActiveTab("overview"); }}>{c.college}</td>
                            {[c.assignment_score, c.video_score, c.ats_score, c.github_score, c.communication_score].map((v,i) => (
                              <td key={i} style={{ ...td, textAlign: "center" }} onClick={() => { setSelected(c); setActiveTab("overview"); }}>
                                <ScoreChip value={v} />
                              </td>
                            ))}
                            <td style={td} onClick={() => { setSelected(c); setActiveTab("overview"); }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <PBadge p={c.priority} small />
                                <span style={{ fontSize: 10, color: "#334155" }}>{c.priority_score}/100</span>
                              </div>
                            </td>
                            <td style={td}>
                              <select value={c.status} onChange={e => { updateCandidate(c.id, { status: e.target.value }); e.stopPropagation(); }} onClick={e => e.stopPropagation()}
                                style={{ ...selectStyle, width: "auto", fontSize: 12, padding: "5px 8px",
                                  color: c.status === "shortlisted" ? "#22c55e" : c.status === "reviewed" ? "#38bdf8" : "#f59e0b" }}>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="shortlisted">Shortlisted</option>
                              </select>
                            </td>
                            <td style={td}>
                              <button onClick={() => { setSelected(c); setActiveTab("overview"); }}
                                style={{ ...btnStyle(isSel), fontSize: 12, padding: "5px 12px" }}>
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#334155" }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>No candidates match</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <CompareView candidates={compareList} fullCandidates={candidates} onRemove={toggleCompare} onClose={() => setView("list")} card={card} btnStyle={btnStyle} />
          )}
        </div>
      </div>

      {/* ── Detail Drawer Overlay ── */}
      {selectedFull && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}
          onClick={() => setSelected(null)}>
          <div style={{ width: "min(520px, 100vw)", background: "#080d1a", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}>
            <DetailDrawer
              candidate={selectedFull}
              onClose={() => setSelected(null)}
              onUpdate={u => updateCandidate(selectedFull.id, u)}
              activeTab={activeTab} setActiveTab={setActiveTab}
              card={card} btnStyle={btnStyle} inputStyle={inputStyle}
              newNote={newNote} setNewNote={setNewNote}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail Drawer ───────────────────────────────────────────────────────────
function DetailDrawer({ candidate: c, onClose, onUpdate, activeTab, setActiveTab, card, btnStyle, inputStyle, newNote, setNewNote }) {
  const pm = PRIORITY_META[c.priority];
  const aEval = c.assignment_eval || { ui:3, components:3, state:3, edge:3, responsive:3, accessibility:2 };
  const vEval = c.video_eval   || { clarity:3, confidence:3, architecture:3, tradeoffs:3, communication:3 };
  const setAEval = (k,v) => onUpdate({ assignment_eval: { ...aEval, [k]:v } });
  const setVEval = (k,v) => onUpdate({ video_eval: { ...vEval, [k]:v } });
  const addNote  = () => {
    if (!newNote.trim()) return;
    const m = String(Math.floor(Math.random()*10)).padStart(2,"0");
    const s = String(Math.floor(Math.random()*60)).padStart(2,"0");
    onUpdate({ timestamp_notes: [...(c.timestamp_notes||[]), { ts:`0${m}:${s}`, text: newNote }] });
    setNewNote("");
  };

  const tabStyle = (active) => ({ padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "none", color: active ? "#818cf8" : "#475569", borderBottom: active ? "2px solid #818cf8" : "2px solid transparent", transition: "all 0.15s" });
  const sectionTitle = { fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 };

  return (
    <>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#080d1a", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={c.name} id={c.id} size={46} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{c.college}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <PBadge p={c.priority} />
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{c.priority_score}/100 score</div>
            </div>
            <button onClick={onClose} style={{ ...btnStyle(false), fontSize: 18, lineHeight: 1, padding: "5px 10px" }}>✕</button>
          </div>
        </div>
        {/* Priority bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 0 }}>
          <div style={{ width: `${c.priority_score}%`, height: "100%", background: `linear-gradient(90deg, ${pm.color}99, ${pm.color})`, borderRadius: 99, transition: "width 0.5s" }} />
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 4 }}>
          <button style={tabStyle(activeTab==="overview")} onClick={() => setActiveTab("overview")}>📊 Overview</button>
          <button style={tabStyle(activeTab==="assignment")} onClick={() => setActiveTab("assignment")}>💻 Assignment</button>
          <button style={tabStyle(activeTab==="video")} onClick={() => setActiveTab("video")}>🎥 Video</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px", flex: 1 }}>

        {activeTab === "overview" && <>
          <div style={sectionTitle}>Score Breakdown</div>
          <div style={{ ...card, padding: "16px 18px", marginBottom: 16 }}>
            {[["Assignment",c.assignment_score,SCORE_COLORS.assignment,"30%"],["Video",c.video_score,SCORE_COLORS.video,"25%"],["ATS / Resume",c.ats_score,SCORE_COLORS.ats,"20%"],["GitHub",c.github_score,SCORE_COLORS.github,"15%"],["Communication",c.communication_score,SCORE_COLORS.communication,"10%"]].map(([l,v,col,w]) => (
              <div key={l} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{l}</span>
                  <span style={{ fontSize: 11, color: "#334155" }}>{w} weight</span>
                </div>
                <ScoreBar value={v} color={col} />
              </div>
            ))}
          </div>

          <div style={sectionTitle}>Edit Scores (live priority update)</div>
          <div style={{ ...card, padding: "16px 18px", marginBottom: 16 }}>
            {[["assignment_score","Assignment",SCORE_COLORS.assignment],["video_score","Video",SCORE_COLORS.video],["ats_score","ATS",SCORE_COLORS.ats],["github_score","GitHub",SCORE_COLORS.github],["communication_score","Communication",SCORE_COLORS.communication]].map(([key,l,col]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{l}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: col }}>{c[key]}</span>
                </div>
                <input type="range" min={0} max={100} value={c[key]}
                  onChange={e => onUpdate({ [key]: +e.target.value })}
                  style={{ width: "100%", accentColor: col }} />
              </div>
            ))}
          </div>

          <div style={sectionTitle}>Review Status</div>
          <div style={{ ...card, padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["pending","reviewed","shortlisted"].map(s => (
                <button key={s} style={{ ...btnStyle(c.status===s), flex: 1, textTransform: "capitalize" }} onClick={() => onUpdate({ status:s })}>{s}</button>
              ))}
            </div>
          </div>
        </>}

        {activeTab === "assignment" && <>
          <div style={sectionTitle}>Assignment Evaluation</div>
          <div style={{ ...card, padding: "16px 18px", marginBottom: 16 }}>
            <SliderRow label="UI Quality"          value={aEval.ui}           onChange={v => setAEval("ui",v)} />
            <SliderRow label="Component Structure" value={aEval.components}   onChange={v => setAEval("components",v)} />
            <SliderRow label="State Handling"      value={aEval.state}        onChange={v => setAEval("state",v)} />
            <SliderRow label="Edge-Case Handling"  value={aEval.edge}         onChange={v => setAEval("edge",v)} />
            <SliderRow label="Responsiveness"      value={aEval.responsive}   onChange={v => setAEval("responsive",v)} />
            <SliderRow label="Accessibility"       value={aEval.accessibility} onChange={v => setAEval("accessibility",v)} />
          </div>
          <div style={{ ...card, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Overall Average</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#818cf8" }}>
              {(Object.values(aEval).reduce((a,b)=>a+b,0)/Object.values(aEval).length).toFixed(1)}
              <span style={{ fontSize: 14, color: "#334155", fontWeight: 400 }}>/5</span>
            </span>
          </div>
        </>}

        {activeTab === "video" && <>
          <div style={sectionTitle}>Video Evaluation</div>
          <div style={{ ...card, padding: "16px 18px", marginBottom: 16 }}>
            <SliderRow label="Clarity"                  value={vEval.clarity}       onChange={v => setVEval("clarity",v)} />
            <SliderRow label="Confidence"               value={vEval.confidence}    onChange={v => setVEval("confidence",v)} />
            <SliderRow label="Architecture Explanation" value={vEval.architecture}  onChange={v => setVEval("architecture",v)} />
            <SliderRow label="Tradeoff Reasoning"       value={vEval.tradeoffs}     onChange={v => setVEval("tradeoffs",v)} />
            <SliderRow label="Communication"            value={vEval.communication} onChange={v => setVEval("communication",v)} />
          </div>
          <div style={sectionTitle}>Timestamp Notes</div>
          <div style={{ ...card, padding: "14px 18px" }}>
            {(c.timestamp_notes||[]).length === 0 && <div style={{ fontSize: 13, color: "#334155", marginBottom: 10 }}>No notes yet. Add one below.</div>}
            {(c.timestamp_notes||[]).map((n,i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, color: "#818cf8", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 6, padding: "3px 8px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{n.ts}</span>
                <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{n.text}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a note (press Enter)…"
                value={newNote} onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNote()} />
              <button onClick={addNote} style={{ ...btnStyle(true), whiteSpace: "nowrap", flexShrink: 0 }}>+ Add</button>
            </div>
          </div>
        </>}
      </div>
    </>
  );
}

// ─── Compare View ────────────────────────────────────────────────────────────
function CompareView({ candidates, fullCandidates, onRemove, onClose, card, btnStyle }) {
  const full = candidates.map(c => fullCandidates.find(x => x.id === c.id) || c);

  if (full.length === 0) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#334155" }}>
      <div style={{ fontSize:48 }}>⚡</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#64748b" }}>No candidates selected</div>
      <div style={{ fontSize:13 }}>Tick checkboxes in the list view to compare</div>
      <button style={btnStyle(true)} onClick={onClose}>← Back to List</button>
    </div>
  );

  const METRICS = [
    ["Assignment Score","assignment_score",SCORE_COLORS.assignment,"30%"],
    ["Video Score","video_score",SCORE_COLORS.video,"25%"],
    ["ATS Score","ats_score",SCORE_COLORS.ats,"20%"],
    ["GitHub Score","github_score",SCORE_COLORS.github,"15%"],
    ["Communication","communication_score",SCORE_COLORS.communication,"10%"],
    ["Priority Score","priority_score","#e2e8f0","—"],
  ];

  const thS = { padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:"0.1em", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"#0a0f1e" };
  const tdS = { padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)", verticalAlign:"middle" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button style={btnStyle(false)} onClick={onClose}>← Back</button>
        <span style={{ fontWeight:700, color:"#e2e8f0", fontSize:15 }}>Side-by-Side Comparison</span>
        <span style={{ fontSize:12, color:"#475569" }}>({full.length} candidates)</span>
      </div>

      <div style={{ ...card, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ ...thS, width:180 }}>Metric</th>
              {full.map(c => (
                <th key={c.id} style={{ ...thS, textAlign:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <Avatar name={c.name} id={c.id} size={36} />
                    <span style={{ color:"#cbd5e1", fontWeight:700 }}>{c.name}</span>
                    <PBadge p={c.priority} small />
                    <button onClick={() => onRemove(c)} style={{ fontSize:11, color:"#475569", background:"none", border:"none", cursor:"pointer" }}>✕ Remove</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(([label,key,color,weight]) => {
              const vals = full.map(c => c[key]);
              const maxVal = Math.max(...vals);
              return (
                <tr key={key}>
                  <td style={{ ...tdS, color:"#64748b" }}>
                    <div style={{ fontWeight:600, color:"#94a3b8" }}>{label}</div>
                    <div style={{ fontSize:11, color:"#334155", marginTop:2 }}>Weight: {weight}</div>
                  </td>
                  {full.map(c => {
                    const v = c[key];
                    const best = v === maxVal;
                    return (
                      <td key={c.id} style={{ ...tdS, textAlign:"center" }}>
                        <div style={{ fontSize:26, fontWeight:900, color: best ? color : "#475569" }}>{v}</div>
                        {best && full.length > 1 && <div style={{ fontSize:10, color, marginTop:2, fontWeight:700 }}>▲ Best</div>}
                        <div style={{ margin:"8px auto 0", width:70, height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ width:`${v}%`, height:"100%", background: best ? color : "#1e293b", borderRadius:99 }} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr style={{ background:"rgba(99,102,241,0.04)" }}>
              <td style={{ ...tdS, fontWeight:700, color:"#64748b" }}>Priority</td>
              {full.map(c => <td key={c.id} style={{ ...tdS, textAlign:"center" }}><PBadge p={c.priority} /></td>)}
            </tr>
            <tr>
              <td style={{ ...tdS, color:"#64748b" }}>Status</td>
              {full.map(c => (
                <td key={c.id} style={{ ...tdS, textAlign:"center" }}>
                  <span style={{ fontSize:13, fontWeight:600, color: c.status==="shortlisted"?"#22c55e":c.status==="reviewed"?"#38bdf8":"#f59e0b", textTransform:"capitalize" }}>{c.status}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
