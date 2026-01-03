"use client"

import { useState, useEffect } from "react"

// ======== OWASP DATA ========
const OWASP_CATEGORIES = [
  { id: "A01", label: "A01 – Broken Access Control", color: "bg-red-500", explanation: "Access control issues allow users to act outside intended permissions." },
  { id: "A03", label: "A03 – Injection", color: "bg-yellow-500", explanation: "Injection occurs when untrusted input reaches an interpreter." },
  { id: "A05", label: "A05 – Security Misconfiguration", color: "bg-blue-500", explanation: "Misconfigured systems can be exploited." },
  { id: "A07", label: "A07 – Auth Failures", color: "bg-pink-500", explanation: "Authentication flaws allow login bypass or privilege escalation." },
  { id: "A10", label: "A10 – SSRF", color: "bg-gray-500", explanation: "Server-side request forgery can access internal systems." },
]

// ======== CHECKLIST DATA ========
const CHECKLIST = [
  {
    id: "recon",
    title: "Recon on Wildcard Domain",
    description: "Learn recon techniques",
    items: [
      { id: "amass", label: "Run Amass", owasp: ["A03"] },
      { id: "subfinder", label: "Run Subfinder", owasp: ["A03"] },
    ],
  },
  {
    id: "auth",
    title: "Authentication Testing",
    description: "Check login systems",
    items: [
      { id: "user_enum", label: "User enumeration", owasp: ["A07"] },
      { id: "brute_force", label: "Brute force protection", owasp: ["A07"] },
    ],
  },
]

// ======== CTF CHALLENGES DATA ========
const CTF_CHALLENGES = [
  {
    id: "auth-logic-1",
    title: "Broken Login Logic",
    difficulty: "Beginner",
    path: "Beginner",
    owasp: ["A07"],
    order: 1,
    description: "Simulated login logic flaw. Analyze and find the issue.",
    explanation: "Authentication logic flaws allow bypass.",
    mcq: {
      question: "Why is this login system vulnerable?",
      options: [
        "Passwords too short",
        "Logic allows bypass",
        "UI design problem",
        "Server slow",
      ],
      correctIndex: 1,
    },
  },
  {
    id: "sql-inject-1",
    title: "Simulated SQL Injection",
    difficulty: "Intermediate",
    path: "Intermediate",
    owasp: ["A03"],
    order: 2,
    description: "Analyze the SQL query for issues.",
    explanation: "Unvalidated input can lead to SQL injection.",
    mcq: {
      question: "What causes this vulnerability?",
      options: [
        "Weak passwords",
        "Input not sanitized",
        "Slow network",
        "Unclear UI",
      ],
      correctIndex: 1,
    },
  },
]

// ======== MAIN COMPONENT ========
export default function Page() {
  // ===== STATES =====
  const [darkMode, setDarkMode] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [filterOwasp, setFilterOwasp] = useState<string[]>([])
  const [onlyUnchecked, setOnlyUnchecked] = useState(false)
  const [activeOwasp, setActiveOwasp] = useState<string | null>(null)
  const [ctfCompleted, setCtfCompleted] = useState<Record<string, boolean>>({})
  const [ctfAnswers, setCtfAnswers] = useState<Record<string, number | string>>({})
  const [ctfSearch, setCtfSearch] = useState("")
  const [ctfPath, setCtfPath] = useState<"ALL" | "Beginner" | "Intermediate">("ALL")

  // ===== LOCAL STORAGE =====
  useEffect(() => {
    const savedCheck = localStorage.getItem("checklist-progress")
    if (savedCheck) setChecked(JSON.parse(savedCheck))
    const savedCTF = localStorage.getItem("ctf-progress")
    if (savedCTF) setCtfCompleted(JSON.parse(savedCTF))
    const savedDark = localStorage.getItem("dark-mode")
    if (savedDark === "true") setDarkMode(true)
  }, [])

  useEffect(() => {
    localStorage.setItem("checklist-progress", JSON.stringify(checked))
  }, [checked])

  useEffect(() => {
    localStorage.setItem("ctf-progress", JSON.stringify(ctfCompleted))
  }, [ctfCompleted])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("dark-mode", String(darkMode))
  }, [darkMode])

  // ===== FUNCTIONS =====
  const toggleItem = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleFilter = (id: string) =>
    setFilterOwasp(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]))

  const isUnlocked = (order: number) => {
    if (order === 1) return true
    return Object.values(ctfCompleted).filter(Boolean).length >= order - 1
  }

  const submitMCQ = (challenge: any) => {
    const ans = ctfAnswers[challenge.id]
    if (ans === challenge.mcq.correctIndex) {
      setCtfCompleted(prev => ({ ...prev, [challenge.id]: true }))
      alert("✅ Correct!")
    } else alert("❌ Try again")
  }

  // ===== FILTER FUNCTIONS =====
  const filterChecklistItems = (item: any) => {
    if (filterOwasp.length && !item.owasp.some((o: string) => filterOwasp.includes(o))) return false
    if (onlyUnchecked && checked[item.id]) return false
    return true
  }

  const filterCTFs = (ch: any) => {
    const search = ctfSearch.toLowerCase()
    if (ctfPath !== "ALL" && ch.path !== ctfPath) return false
    if (ctfSearch && !(
      ch.title.toLowerCase().includes(search) ||
      ch.difficulty.toLowerCase().includes(search) ||
      ch.owasp.some((o: string) => o.toLowerCase().includes(search))
    )) return false
    return true
  }

  // ===== PROGRESS =====
  const totalChecklist = CHECKLIST.reduce((acc, sec) => acc + sec.items.length, 0)
  const completedChecklist = Object.values(checked).filter(Boolean).length
  const progressChecklist = Math.round((completedChecklist / totalChecklist) * 100)

  const pathChallenges = CTF_CHALLENGES.filter(ch => ctfPath === "ALL" ? true : ch.path === ctfPath)
  const completedPath = pathChallenges.filter(ch => ctfCompleted[ch.id]).length
  const progressCTF = Math.round((completedPath / pathChallenges.length) * 100)

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ===== DARK MODE ===== */}
      <div className="flex justify-end mb-2">
        <button onClick={() => setDarkMode(!darkMode)} className="border px-3 py-1 rounded text-sm">
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* ===== CHECKLIST ===== */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">📝 Bug Bounty Checklist</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-2">
          {OWASP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleFilter(cat.id)}
              className={`px-2 py-1 text-xs rounded border ${
                filterOwasp.includes(cat.id) ? "bg-blue-500 text-white" : ""
              }`}
            >
              {cat.id}
            </button>
          ))}
          <label className="flex items-center gap-2 text-sm ml-4">
            <input type="checkbox" checked={onlyUnchecked} onChange={() => setOnlyUnchecked(!onlyUnchecked)} />
            Show only unchecked
          </label>
        </div>

        {/* Progress */}
        <div className="mb-2">
          <div className="text-sm mb-1">Checklist Progress: {progressChecklist}%</div>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div className="bg-green-500 h-3 rounded" style={{ width: `${progressChecklist}%` }} />
          </div>
        </div>

        {/* Checklist Sections */}
        {CHECKLIST.map(sec => {
          const visibleItems = sec.items.filter(filterChecklistItems)
          if (!visibleItems.length) return null
          return (
            <section key={sec.id} className="space-y-2">
              <h2 className="text-xl font-semibold">{sec.title}</h2>
              <p className="text-gray-600 text-sm">{sec.description}</p>
              <ul className="space-y-1">
                {visibleItems.map(item => (
                  <li key={item.id} className="flex items-start gap-2">
                    <input type="checkbox" checked={!!checked[item.id]} onChange={() => toggleItem(item.id)} className="mt-1" />
                    <div>
                      <span>{item.label}</span>
                      <div className="flex gap-1 mt-0.5">
                        {item.owasp.map(tag => {
                          const cat = OWASP_CATEGORIES.find(c => c.id === tag)
                          return (
                            <span key={tag} className={`text-white text-xs px-2 py-0.5 rounded cursor-pointer ${cat?.color}`} onClick={() => setActiveOwasp(tag)}>
                              {tag}
                            </span>
                          )
                        })}
                      </div>

                      {/* Checklist → CTF recommendations */}
                      {checked[item.id] && (
                        <div className="ml-6 mt-1 text-xs text-blue-600">
                          Recommended CTFs:
                          <ul className="list-disc ml-4">
                            {CTF_CHALLENGES.filter(ch => ch.owasp.some(o => item.owasp.includes(o))).map(ch => (
                              <li key={ch.id}>
                                <a href="#ctf" className="underline">{ch.title}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </section>

      {/* ===== OWASP EXPLANATION MODAL ===== */}
      {activeOwasp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded max-w-sm">
            <h3 className="font-bold mb-2">{activeOwasp}</h3>
            <p className="text-sm">{OWASP_CATEGORIES.find(c => c.id === activeOwasp)?.explanation}</p>
            <button onClick={() => setActiveOwasp(null)} className="mt-4 text-sm underline">Close</button>
          </div>
        </div>
      )}

      {/* ===== CTF SECTION ===== */}
      <section id="ctf" className="space-y-4">
        <h1 className="text-3xl font-bold">🏁 CTF Challenges</h1>

        {/* Path & Search */}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {["ALL", "Beginner", "Intermediate"].map(p => (
            <button key={p} onClick={() => setCtfPath(p as any)} className={`px-3 py-1 text-sm rounded border ${ctfPath===p?"bg-green-500 text-white":""}`}>
              {p}
            </button>
          ))}
          <input type="text" placeholder="Search challenges..." value={ctfSearch} onChange={e=>setCtfSearch(e.target.value)} className="ml-4 border rounded px-3 py-1 text-sm flex-1"/>
        </div>

        {/* Progress */}
        <div className="mb-2">
          {ctfPath!=="ALL" && <div className="text-sm text-gray-600">{ctfPath} Path Progress: {progressCTF}%</div>}
        </div>

        {/* CTF Challenges */}
        {CTF_CHALLENGES.filter(filterCTFs).map(challenge => {
          const unlocked = isUnlocked(challenge.order)
          return (
            <div key={challenge.id} className="border rounded p-4 space-y-2">
              <h2 className="font-semibold">{challenge.title} {ctfCompleted[challenge.id] && "✅"}</h2>
              <div className="text-xs text-gray-500">Difficulty: {challenge.difficulty} | OWASP: {challenge.owasp.join(", ")}</div>
              <p className="text-sm">{challenge.description}</p>

              {!unlocked && <div className="text-sm text-gray-400 italic">🔒 Complete previous challenge to unlock</div>}

              {unlocked && !ctfCompleted[challenge.id] && challenge.mcq && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{challenge.mcq.question}</p>
                  {challenge.mcq.options.map((opt, idx) => (
                    <label key={idx} className="flex gap-2 text-sm">
                      <input type="radio" name={challenge.id} checked={ctfAnswers[challenge.id]===idx} onChange={()=>setCtfAnswers(prev=>({...prev,[challenge.id]:idx}))}/>
                      {opt}
                    </label>
                  ))}
                  <button onClick={()=>submitMCQ(challenge)} className="border px-3 py-1 text-sm rounded">Submit Answer</button>
                </div>
              )}

              {ctfCompleted[challenge.id] && <div className="text-sm text-green-600">{challenge.explanation}</div>}
            </div>
          )
        })}
      </section>
    </main>
  )
}
