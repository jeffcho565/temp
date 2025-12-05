import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Exercise from './pages/Exercise'
import MacrosPage from './pages/MacrosPage'
import TodoPage from './pages/TodoPage'
import WaterPage from './pages/WaterPage'

function App() {
  const [view, setView] = useState('home')
  const [subPanel, setSubPanel] = useState('workout')

  const settings = (() => {
    try {
      const raw = localStorage.getItem('workout_settings_v1')
      if (!raw) return { darkMode: false, fontWeight: 400, fontFamily: 'Arial' }
      return { ...JSON.parse(raw) }
    } catch {
      return { darkMode: false, fontWeight: 400, fontFamily: 'Arial' }
    }
  })()

  return (
    <>
      <header
        className="app-header"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e6e6e6',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            Health & Fitness Tracker
          </h1>
          <small style={{ color: '#666', marginTop: 6 }}>Workouts, macros, water, timer, and more</small>
        </div>

        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setView('home')} className={view === 'home' ? 'active' : ''}>Home</button>
          <button onClick={() => setView('planner')} className={view === 'planner' ? 'active' : ''}>Exercise</button>
          <button onClick={() => setView('macros')} className={view === 'macros' ? 'active' : ''}>Macros</button>
          <button onClick={() => setView('water')} className={view === 'water' ? 'active' : ''}>Water</button>
          <button onClick={() => setView('todo')} className={view === 'todo' ? 'active' : ''}>To‑Do</button>
          <button 
            onClick={() => { setView('planner'); setSubPanel('settings'); }} 
            style={{ marginLeft: 8, padding: '6px 12px', fontSize: 13 }}
          >
            ⚙️ Settings
          </button>
        </nav>
      </header>

      {view === 'planner' && subPanel !== 'settings' && (
        <div style={{ padding: '0 16px 12px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSubPanel('workout')} style={{ fontWeight: subPanel === 'workout' ? 700 : 400 }}>Workout</button>
              <button onClick={() => setSubPanel('timer')} style={{ fontWeight: subPanel === 'timer' ? 700 : 400 }}>Timer</button>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          padding: '12px 16px',
          boxSizing: 'border-box',
          minHeight: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {view === 'home' && <Home setView={setView} settings={settings} />}
        {view === 'planner' && <Exercise activePanel={subPanel} />}
        {view === 'macros' && <MacrosPage />}
        {view === 'todo' && <TodoPage />}
        {view === 'water' && <WaterPage settings={settings} />}
      </main>

      <footer className="app-footer" style={{ padding: '12px 16px', color: '#666' }}>
        <p style={{ margin: 0 }}>Saved locally in your browser (localStorage)</p>
      </footer>
    </>
  )
}

export default App
