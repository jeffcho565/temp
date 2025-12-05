import { useState, useEffect } from 'react'

// Timer component
function Timer({ active, seconds, onStart, onPause, onReset, onTick }) {
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      onTick()
    }, 1000)
    return () => clearInterval(interval)
  }, [active, onTick])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <div style={{ textAlign: 'center', padding: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'monospace', marginBottom: 12, letterSpacing: 3, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        {display}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={active ? onPause : onStart} style={{ minWidth: 100, padding: '8px 16px', background: '#fff', color: '#667eea', fontWeight: 600, border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {active ? 'Pause' : 'Start'}
        </button>
        <button onClick={onReset} style={{ minWidth: 100, padding: '8px 16px', background: 'rgba(255,255,255,0.3)', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, cursor: 'pointer' }}>Reset</button>
      </div>
    </div>
  )
}

function Exercise({ activePanel }) {
  const [workouts, setWorkouts] = useState([])
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [settings, setSettings] = useState({ darkMode: false, fontWeight: 400, fontFamily: 'Arial', exercisesTarget: 5 })

  function loadWorkouts() {
    try {
      const wk = JSON.parse(localStorage.getItem('workouts_v1') || '[]')
      setWorkouts(Array.isArray(wk) ? wk : [])
    } catch {
      setWorkouts([])
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem('workout_settings_v1')
      if (raw) {
        setSettings(JSON.parse(raw))
      }
    } catch {
      // Keep defaults
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadWorkouts()
      loadSettings()
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  function addWorkout(name, sets, reps, weight) {
    const newWorkout = {
      id: Date.now(),
      name: name.trim(),
      sets: Number(sets) || 3,
      reps: Number(reps) || 8,
      weight: weight.trim(),
      createdAt: new Date().toISOString()
    }
    const updated = [newWorkout, ...workouts]
    setWorkouts(updated)
    localStorage.setItem('workouts_v1', JSON.stringify(updated))
  }

  function deleteWorkout(id) {
    const updated = workouts.filter(w => w.id !== id)
    setWorkouts(updated)
    localStorage.setItem('workouts_v1', JSON.stringify(updated))
  }

  function clearAllWorkouts() {
    if (!confirm('Clear all workouts?')) return
    setWorkouts([])
    localStorage.setItem('workouts_v1', JSON.stringify([]))
  }

  function saveSettings(newSettings) {
    setSettings(newSettings)
    localStorage.setItem('workout_settings_v1', JSON.stringify(newSettings))
  }

  // Timer panel
  if (activePanel === 'timer') {
    return (
      <section style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
        <h2 style={{ marginTop: 0 }}>Timer</h2>
        <Timer
          active={timerActive}
          seconds={timerSeconds}
          onStart={() => setTimerActive(true)}
          onPause={() => setTimerActive(false)}
          onReset={() => { setTimerActive(false); setTimerSeconds(0) }}
          onTick={() => setTimerSeconds(s => s + 1)}
        />
      </section>
    )
  }

  // Settings panel
  if (activePanel === 'settings') {
    return (
      <section style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          saveSettings({
            darkMode: formData.get('darkMode') === 'on',
            fontWeight: Number(formData.get('fontWeight')) || 400,
            fontFamily: formData.get('fontFamily') || 'Arial',
            exercisesTarget: Number(formData.get('exercisesTarget')) || 5
          })
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" name="darkMode" defaultChecked={settings.darkMode} />
              <span>Dark Mode</span>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Font Weight</span>
              <input type="number" name="fontWeight" defaultValue={settings.fontWeight} min="100" max="900" step="100" style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Font Family</span>
              <select name="fontFamily" defaultValue={settings.fontFamily} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Daily Exercise Target</span>
              <input type="number" name="exercisesTarget" defaultValue={settings.exercisesTarget} min="1" style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
            </label>
            <button type="submit" style={{ padding: '8px 16px' }}>Save Settings</button>
          </div>
        </form>
      </section>
    )
  }

  // Workout panel (default)
  return (
    <section style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
      <h2 style={{ marginTop: 0 }}>Workouts</h2>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const sets = formData.get('sets')
        const reps = formData.get('reps')
        const weight = formData.get('weight')
        if (name && name.trim()) {
          addWorkout(name, sets, reps, weight)
          e.target.reset()
        }
      }} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input name="name" placeholder="Exercise name (e.g., Squat)" style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }} required />
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="sets" type="number" placeholder="Sets" defaultValue="3" style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <input name="reps" type="number" placeholder="Reps" defaultValue="8" style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
          <input name="weight" placeholder="Weight (optional)" style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ flex: 1 }}>Add Workout</button>
          <button type="button" onClick={clearAllWorkouts} style={{ flex: 1 }}>Clear All</button>
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {workouts.map((w) => (
          <li key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #f3f3f3' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {w.sets} sets × {w.reps} reps {w.weight ? `@ ${w.weight}` : ''}
              </div>
            </div>
            <button onClick={() => deleteWorkout(w.id)} style={{ padding: '4px 8px' }}>Delete</button>
          </li>
        ))}
        {workouts.length === 0 && <li style={{ color: '#666', padding: 8 }}>No workouts logged</li>}
      </ul>
    </section>
  )
}

export default Exercise
