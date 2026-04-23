# ⬡ HireScope — Candidate Review Dashboard

A production-grade internal hiring dashboard built with **React + Vite**. Designed for recruiters to review, evaluate, and shortlist 100+ student applicants efficiently.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation & Run

```bash
# 1. Clone or download the project
cd "Hiring DashBoard"

# 2. Create Vite project
npm create vite@latest hirescope -- --template react

# 3. Enter project folder
cd hirescope

# 4. Install dependencies
npm install

# 5. Replace source files
cp ../App.jsx src/App.jsx
cp ../index.css src/index.css

# 6. Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser ✅

---

## 📁 Project Structure

```
hirescope/
├── src/
│   ├── App.jsx          # Main dashboard component (all logic + UI)
│   └── index.css        # Global reset + custom scrollbar + range styles
├── index.html
├── package.json
└── vite.config.js
```

---

## ✨ Features

### 1. 📊 Dashboard Summary
- Total, Reviewed, Shortlisted, Pending candidate counts
- Live priority distribution (P0 → P3) with percentage bars

### 2. 🗂️ Candidate List Panel
- Table with 100 auto-generated candidates
- Columns: Name, College, Assignment, Video, ATS, GitHub, Communication, Priority, Status
- Color-coded scores — 🟢 ≥75 · 🟡 ≥55 · 🔴 <55

### 3. 🔍 Search & Filters
- Search by name or college
- Filter by Assignment / Video / ATS score range
- Filter by review status (Pending / Reviewed / Shortlisted)
- Sort by Priority Score, Assignment Score, or Video Score

### 4. 📋 Candidate Detail Drawer
Click **Review** on any candidate to open a side drawer with 3 tabs:

| Tab | Contents |
|-----|----------|
| 📊 Overview | Score breakdown bars, live score editors, status toggle |
| 💻 Assignment | 6-criteria slider evaluation (UI, Structure, State, Edge, Responsive, A11y) |
| 🎥 Video | 5-criteria slider evaluation + timestamp notes |

### 5. ⚡ Priority Engine
Scores are weighted and computed automatically:

| Metric | Weight |
|--------|--------|
| Assignment Score | 30% |
| Video Score | 25% |
| ATS Score | 20% |
| GitHub Score | 15% |
| Communication | 10% |

| Priority | Score Range | Meaning |
|----------|-------------|---------|
| 🟢 P0 | 80–100 | Interview Immediately |
| 🟡 P1 | 65–79 | Strong Shortlist |
| 🟠 P2 | 50–64 | Review Later |
| 🔴 P3 | 0–49 | Reject |

> Priority updates **live** when any score is edited via sliders.

### 6. ⚡ Comparison Mode
- Check up to **3 candidates** using the checkbox in the table
- Click **Compare** in the top bar
- Side-by-side view highlights the **best score** per metric

---

## 🎨 Tech Stack

| Tool | Usage |
|------|-------|
| React 18 | UI & state management |
| Vite | Dev server & bundler |
| Inline styles | Component-scoped styling (no Tailwind dependency) |
| CSS (index.css) | Global reset, scrollbars, range inputs |

---

## 📦 Dummy Data

100 candidates are auto-generated on load with randomized scores:

```js
{
  id: 1,
  name: "Aarav Sharma",
  college: "IIT Bombay",
  assignment_score: 82,
  video_score: 70,
  ats_score: 65,
  github_score: 60,
  communication_score: 75,
  priority_score: 72,   // auto-computed
  priority: "P1",       // auto-computed
  status: "pending"
}
```

---

## 📐 Evaluation Criteria Addressed

| Criteria | Implementation |
|----------|---------------|
| UI Clarity | Dark theme, color-coded scores, priority badges |
| Component Structure | Modular: App, DetailDrawer, CompareView, ScoreBar, PBadge, SliderRow, Avatar |
| State Handling | useState, useMemo, useCallback — no prop drilling |
| Priority Logic | Weighted formula, live recalculation on score edit |
| Edge-Case Handling | Empty filter results, 0-candidate compare, clamped ranges |
| Visual Hierarchy | Stats → Distribution → Table → Drawer flow |

---

## 🖥️ Screenshots

| View | Description |
|------|-------------|
| List View | Full-screen table with filters sidebar |
| Detail Drawer | Slide-in panel with 3 evaluation tabs |
| Compare Mode | Side-by-side metric comparison |

---

## 👨‍💻 Author

Built as **Frontend Assignment 4** — Candidate Review Dashboard  
Time: ~5–7 hours  
Stack: React · Vite · CSS
<img width="1710" height="981" alt="Screenshot 2026-04-23 at 12 55 26 PM" src="https://github.com/user-attachments/assets/502d65e9-159a-4c70-81ee-7c10b76137df" />
