import { useState, useEffect } from 'react'

// improved pie chart with donut style
function PieChart({ data = [], size = 160 }) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0)
  const r = size / 2
  const innerR = r * 0.6

  // If all values are 0, show a single solid color (use the first color or a neutral one)
  if (total === 0) {
    const fullCircle = `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${2 * r} A ${r} ${r} 0 1 1 ${r} 0 M ${r} ${r - innerR} A ${innerR} ${innerR} 0 1 0 ${r} ${r + innerR} A ${innerR} ${innerR} 0 1 0 ${r} ${r - innerR} Z`
    const fillColor = data.length > 0 ? data[0].color : '#e0e0e0'
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
        <g transform={`translate(0,0)`}>
          <path d={fullCircle} fill={fillColor} stroke="#fff" strokeWidth="2" />
        </g>
      </svg>
    )
  }

  const { segments } = data.reduce(
    (acc, d) => {
      const portion = Math.max(0, d.value) / total
      const sweep = portion * 360
      const startAngle = acc.cumulative
      const endAngle = startAngle + sweep
      const start = (startAngle * Math.PI) / 180
      const end = (endAngle * Math.PI) / 180
      const x1 = Math.cos(start) * r
      const y1 = Math.sin(start) * r
      const x2 = Math.cos(end) * r
      const y2 = Math.sin(end) * r
      const x3 = Math.cos(end) * innerR
      const y3 = Math.sin(end) * innerR
      const x4 = Math.cos(start) * innerR
      const y4 = Math.sin(start) * innerR
      const large = sweep > 180 ? 1 : 0
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`
      acc.segments.push({ path, color: d.color || '#ccc', label: d.label, value: d.value })
      acc.cumulative = endAngle
      return acc
    },
    { cumulative: -90, segments: [] }
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
      <g transform={`translate(${r},${r})`}>
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />
        ))}
      </g>
    </svg>
  )
}

function Home({ setView, settings }) {
  const [homeStats, setHomeStats] = useState({
    exercises: 0,
    exercisesPct: 0,
    macroEntries: 0,
    macrosPct: 0,
    water: 0,
    waterPct: 0,
    todos: 0,
    todosPct: 0,
    todosDone: 0,
    todosRemaining: 0,
    timers: 0,
    recentExercises: [],
    recentMacroEntries: [],
    recentTodos: []
  })

  function loadStats() {
    try {
      const wk = JSON.parse(localStorage.getItem('workouts_v1') || '[]')
      const macros = JSON.parse(localStorage.getItem('macros_v1') || '{}')
      const entries = Array.isArray(macros.entries) ? macros.entries.length : 0
      const water = Number(localStorage.getItem('water_v1') || '0') || 0

      const todosArr = (() => {
        try {
          const t = JSON.parse(localStorage.getItem('todos_v1') || '[]')
          return Array.isArray(t) ? t : []
        } catch { return [] }
      })()
      const todosCount = todosArr.length
      const todosDone = todosArr.filter((it) => it.done).length
      const todosRemaining = Math.max(0, todosCount - todosDone)

      const timers = Number(localStorage.getItem('timers_count_v1') || '0') || 0

      const settingsData = (() => {
        try { return JSON.parse(localStorage.getItem('workout_settings_v1') || '{}') } catch { return {} }
      })()
      const exercisesTarget = Number(settingsData.exercisesTarget) || 5

      const macrosTodayCal = (macros?.today && Number(macros.today.cal)) || 0
      const macrosTargetCal = (macros?.target && Number(macros.target.cal)) || 0
      const macrosPct = macrosTargetCal ? Math.round((macrosTodayCal / macrosTargetCal) * 100) : 0

      const exercisesPct = Math.min(100, Math.round(((Array.isArray(wk) ? wk.length : 0) / Math.max(1, exercisesTarget)) * 100))
      const todosPct = todosCount > 0 ? Math.round((todosDone / todosCount) * 100) : 0

      const waterGoal = Number(localStorage.getItem('water_goal_v1') || '0') || 0
      const waterGoalPct = waterGoal ? Math.min(100, Math.round((water / waterGoal) * 100)) : 0

      const recentExercises = (Array.isArray(wk) ? wk.slice(0, 5) : [])
      const recentMacroEntries = Array.isArray(macros.entries) ? macros.entries.slice(0, 5) : []
      const recentTodos = todosArr.slice(0, 5)

      setHomeStats({
        exercises: Array.isArray(wk) ? wk.length : 0,
        exercisesPct,
        macroEntries: entries,
        macrosPct,
        water,
        waterPct: waterGoalPct,
        todos: todosCount,
        todosPct,
        todosDone,
        todosRemaining,
        timers,
        recentExercises,
        recentMacroEntries,
        recentTodos
      })
    } catch {
      setHomeStats({ exercises: 0, exercisesPct: 0, macroEntries: 0, macrosPct: 0, water: 0, waterPct: 0, todos: 0, todosPct: 0, todosDone: 0, todosRemaining: 0, timers: 0, recentExercises: [], recentMacroEntries: [], recentTodos: [] })
    }
  }

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      loadStats()
    }, 0)
    window.addEventListener('storage', loadStats)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('storage', loadStats)
    }
  }, [])

  const fontFamilyMap = {
    'Arial': 'Arial, sans-serif',
    'Times New Roman': '"Times New Roman", serif',
    'Georgia': 'Georgia, serif',
    'Verdana': 'Verdana, sans-serif',
    'Courier New': '"Courier New", monospace',
    'Comic Sans MS': '"Comic Sans MS", cursive'
  }

  const homeStyle = {
    background: settings.darkMode ? '#111' : '#fff',
    color: settings.darkMode ? '#eee' : '#111',
    fontWeight: settings.fontWeight,
    fontFamily: fontFamilyMap[settings.fontFamily] || fontFamilyMap['Arial']
  }

  const quickButtonStyle = {
    padding: '6px 12px',
    fontSize: 12,
    border: '1px solid ' + (settings.darkMode ? '#444' : '#ccc'),
    background: settings.darkMode ? '#222' : '#f9f9f9',
    color: settings.darkMode ? '#eee' : '#111',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: settings.fontWeight,
    fontFamily: fontFamilyMap[settings.fontFamily] || fontFamilyMap['Arial']
  }

  return (
    <section style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 6, ...homeStyle }}>
      <h2 style={{ marginTop: 0 }}>Welcome</h2>
      <p style={{ color: settings.darkMode ? '#aaa' : '#666' }}>Overview of your tracked items — use the top-right navigation to open Exercise, Macros, or To‑Do.</p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <p style={{ margin: '0 0 6px 0', fontSize: 13, fontWeight: 600, color: settings.darkMode ? '#ccc' : '#333' }}>To‑Do Completion</p>
          </div>
          <PieChart
            size={160}
            data={[
              { label: 'Done', value: homeStats.todosDone || 0, color: '#50e3c2' },
              { label: 'Remaining', value: homeStats.todosRemaining || (homeStats.todos === 0 ? 1 : 0), color: '#f5a623' }
            ]}
          />
          <div style={{ marginTop: 10 }}>
            {(() => {
              const total = (homeStats.todosDone || 0) + (homeStats.todosRemaining || 0)
              const pct = total ? Math.round(((homeStats.todosDone || 0) / total) * 100) : 0
              return (
                <div style={{ width: 180 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <strong>Completed</strong>
                    <span style={{ color: settings.darkMode ? '#aaa' : '#666' }}>{pct}%</span>
                  </div>
                  <progress value={Math.min(100, pct)} max="100" style={{ width: '100%', height: 10 }} />
                </div>
              )
            })()}
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setView('todo')} style={quickButtonStyle}>View To‑Do list</button>
          </div>
        </div>

        <div style={{ minWidth: 240 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px 0', color: settings.darkMode ? '#ccc' : '#333' }}>Key Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 360 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, background: '#4a90e2', display: 'inline-block', borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <strong>Workouts</strong>
                    <span style={{ color: settings.darkMode ? '#aaa' : '#666' }}>{homeStats.exercisesPct ?? 0}%</span>
                  </div>
                  <progress value={Math.min(100, homeStats.exercisesPct || 0)} max="100" style={{ width: '100%', height: 8, marginTop: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, background: '#7ed321', display: 'inline-block', borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <strong>Water Goal</strong>
                    <span style={{ color: settings.darkMode ? '#aaa' : '#666' }}>{homeStats.waterPct ?? 0}%</span>
                  </div>
                  <progress value={Math.min(100, homeStats.waterPct || 0)} max="100" style={{ width: '100%', height: 8, marginTop: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, background: '#50e3c2', display: 'inline-block', borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <strong>Macros</strong>
                    <span style={{ color: settings.darkMode ? '#aaa' : '#666' }}>{homeStats.macrosPct ?? 0}%</span>
                  </div>
                  <progress value={Math.min(100, homeStats.macrosPct || 0)} max="100" style={{ width: '100%', height: 8, marginTop: 4 }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: settings.darkMode ? '#ccc' : '#333' }}>Recent To‑Dos</h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', maxHeight: 120, overflow: 'auto' }}>
                {(homeStats.recentTodos || []).map((t) => (
                  <li key={t.id} style={{ padding: 6, borderBottom: '1px solid #f3f3f3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13 }}>{t.text}</span>
                      <span style={{ fontSize: 12, color: t.done ? '#2ecc71' : '#e67e22' }}>{t.done ? 'Done' : 'Pending'}</span>
                    </div>
                  </li>
                ))}
                {(homeStats.recentTodos || []).length === 0 && <li style={{ color: settings.darkMode ? '#aaa' : '#666' }}>No to‑dos</li>}
              </ul>
            </div>

            <div>
              <h3 style={{ margin: '0 0 8px 0', color: settings.darkMode ? '#ccc' : '#333' }}>Recent Exercises</h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', maxHeight: 120, overflow: 'auto' }}>
                {(homeStats.recentExercises || []).map((ex) => (
                  <li key={ex.id} style={{ padding: 6, borderBottom: '1px solid #f3f3f3' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: settings.darkMode ? '#aaa' : '#666' }}>{ex.sets}×{ex.reps} {ex.weight ? `@ ${ex.weight}` : ''}</div>
                  </li>
                ))}
                {(homeStats.recentExercises || []).length === 0 && <li style={{ color: settings.darkMode ? '#aaa' : '#666' }}>No recent exercises</li>}
              </ul>
            </div>

            <div>
              <h3 style={{ margin: '0 0 8px 0', color: settings.darkMode ? '#ccc' : '#333' }}>Recent Meals</h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', maxHeight: 120, overflow: 'auto' }}>
                {(homeStats.recentMacroEntries || []).map((en) => (
                  <li key={en.id} style={{ padding: 6, borderBottom: '1px solid #f3f3f3' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{en.cal} kcal</div>
                    <div style={{ fontSize: 12, color: settings.darkMode ? '#aaa' : '#666' }}>{en.protein}g P • {en.carbs}g C • {en.fat}g F</div>
                  </li>
                ))}
                {(homeStats.recentMacroEntries || []).length === 0 && <li style={{ color: settings.darkMode ? '#aaa' : '#666' }}>No recent meals</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
