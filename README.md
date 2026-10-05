# Shikho Program Ops Dashboard

**A live BI dashboard for Shikho's class and exam schedule.** It reads the operations
schedule directly from Google Sheets and turns it into KPIs, charts, a daily schedule
view and automatic clash detection.

**Live:** https://program-operations.vercel.app

---

## What it shows

| View | What you get |
|---|---|
| **KPI cards** | Total sessions, live vs pre-recorded classes, exams, and more for the selected range |
| **Analytics** | Day distribution, time-of-day distribution, subject and batch breakdowns (Recharts) |
| **Daily schedule** | Every session with date, time, duration, batch, subject, topic, teacher, class type, exam type and platform |
| **Operations view: conflicts** | Flags overlapping sessions (e.g. the same teacher booked twice) and shows each clashing pair side by side, plus the most clash-prone teacher |
| **Drill-down** | Click any chart segment to see the sessions behind it |
| **Subject mapping** | Merge or rename messy subject names from the sheet, with per-subject overrides |

Filters for batch, subject and teacher apply to every view.

## How it works

```
Google Sheet (ops schedule)
   │  Google Apps Script web app → JSON
   ▼
src/lib/api.js  ──  normalises times (incl. the 1899 Sheets date quirk for Dhaka),
                    classifies class vs exam types, caches for 15 min (localforage)
   ▼
React dashboard (aggregations.js, conflicts.js)
```

## Tech stack

- **React 19** + **Vite**
- **Tailwind CSS**
- **Recharts** for charts, **date-fns** for dates
- **localforage** for client-side caching
- Deployed on **Vercel**

## Run locally

```bash
npm install
npm run dev
```

---

Built by [Sahidul Turab](https://github.com/sahidul-turab).
