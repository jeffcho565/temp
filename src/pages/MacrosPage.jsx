import { useState, useEffect } from 'react'

function MacrosPage() {
  const [state, setState] = useState({
    target: { cal: 2000, protein: 150, carbs: 200, fat: 70 },
    today: { cal: 0, protein: 0, carbs: 0, fat: 0 },
    entries: []
  })

  function loadMacros() {
    try {
      const raw = localStorage.getItem('macros_v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        setState({
          target: parsed.target || state.target,
          today: parsed.today || state.today,
          entries: Array.isArray(parsed.entries) ? parsed.entries : []
        })
      }
    } catch {
      // Keep defaults
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMacros()
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    localStorage.setItem('macros_v1', JSON.stringify(state))
  }, [state])

  function updateTarget(field, value) {
    const parsed = value === '' ? '' : Number(value)
    setState((s) => ({
      ...s,
      target: { ...s.target, [field]: isNaN(parsed) ? '' : parsed }
    }))
  }

  function addEntry(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const entry = {
      id: Date.now(),
      cal: Number(form.get('cal')) || 0,
      protein: Number(form.get('protein')) || 0,
      carbs: Number(form.get('carbs')) || 0,
      fat: Number(form.get('fat')) || 0,
      note: (form.get('note') || '').toString().trim(),
      createdAt: new Date().toISOString()
    }

    setState((s) => ({
      ...s,
      today: {
        cal: s.today.cal + entry.cal,
        protein: s.today.protein + entry.protein,
        carbs: s.today.carbs + entry.carbs,
        fat: s.today.fat + entry.fat
      },
      entries: [entry, ...s.entries].slice(0, 50)
    }))
    e.target.reset()
  }

  function deleteEntry(id) {
    setState((s) => {
      const remaining = s.entries.filter((en) => en.id !== id)
      const totals = remaining.reduce(
        (acc, it) => ({
          cal: acc.cal + (Number(it.cal) || 0),
          protein: acc.protein + (Number(it.protein) || 0),
          carbs: acc.carbs + (Number(it.carbs) || 0),
          fat: acc.fat + (Number(it.fat) || 0)
        }),
        { cal: 0, protein: 0, carbs: 0, fat: 0 }
      )
      return { ...s, entries: remaining, today: totals }
    })
  }

  function resetToday() {
    setState((s) => ({ ...s, today: { cal: 0, protein: 0, carbs: 0, fat: 0 }, entries: [] }))
  }

  const pct = (n, target) => {
    const t = Number(target)
    if (!t) return 0
    return Math.round((n / t) * 100)
  }

  return (
    <section style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
      <h2 style={{ marginTop: 0 }}>Macro & Diet Tracker</h2>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Daily Targets</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label style={{ flex: '1 1 120px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Calories</div>
            <input
              type="number"
              value={state.target.cal ?? ''}
              onChange={(e) => updateTarget('cal', e.target.value)}
              placeholder="e.g. 2000"
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </label>
          <label style={{ flex: '1 1 120px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Protein (g)</div>
            <input
              type="number"
              value={state.target.protein ?? ''}
              onChange={(e) => updateTarget('protein', e.target.value)}
              placeholder="e.g. 150"
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </label>
          <label style={{ flex: '1 1 120px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Carbs (g)</div>
            <input
              type="number"
              value={state.target.carbs ?? ''}
              onChange={(e) => updateTarget('carbs', e.target.value)}
              placeholder="e.g. 200"
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </label>
          <label style={{ flex: '1 1 120px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Fat (g)</div>
            <input
              type="number"
              value={state.target.fat ?? ''}
              onChange={(e) => updateTarget('fat', e.target.value)}
              placeholder="e.g. 70"
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Today's Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Calories', current: state.today.cal, target: state.target.cal, unit: '' },
            { label: 'Protein', current: state.today.protein, target: state.target.protein, unit: 'g' },
            { label: 'Carbs', current: state.today.carbs, target: state.target.carbs, unit: 'g' },
            { label: 'Fat', current: state.today.fat, target: state.target.fat, unit: 'g' }
          ].map(({ label, current, target, unit }) => (
            <div key={label} style={{ padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{current}{unit} / {target ?? 0}{unit}</div>
              <progress value={pct(current, target)} max="100" style={{ width: '100%', height: 6 }} />
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{pct(current, target)}%</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={addEntry} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input name="cal" placeholder="Calories" type="number" style={{ flex: '1 1 100px', padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
          <input name="protein" placeholder="Protein (g)" type="number" style={{ flex: '1 1 100px', padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
          <input name="carbs" placeholder="Carbs (g)" type="number" style={{ flex: '1 1 100px', padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
          <input name="fat" placeholder="Fat (g)" type="number" style={{ flex: '1 1 100px', padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        <input name="note" placeholder="Optional note (e.g., 'chicken breast')" style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ flex: 1 }}>Add Entry</button>
          <button type="button" onClick={resetToday} style={{ flex: 1 }}>Reset Today</button>
        </div>
      </form>

      <div>
        <h3 style={{ margin: '0 0 8px 0' }}>Recent Entries</h3>
        {state.entries.length === 0 && <p style={{ color: '#666' }}>No entries yet — add meals/snacks above.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {state.entries.map((en) => (
            <li key={en.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #f3f3f3' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{en.cal} kcal</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {en.protein}g P • {en.carbs}g C • {en.fat}g F
                </div>
                {en.note && <div style={{ fontSize: 12, fontStyle: 'italic', color: '#888' }}>{en.note}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{new Date(en.createdAt).toLocaleTimeString()}</div>
                <button onClick={() => deleteEntry(en.id)} style={{ padding: '4px 8px', fontSize: 12 }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default MacrosPage
