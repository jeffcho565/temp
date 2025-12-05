import { useState } from 'react'

function WaterPage({ settings }) {
  const [, setRefresh] = useState(0)
  
  const waterValue = Number(localStorage.getItem('water_v1') || '0') || 0
  const waterUnit = localStorage.getItem('water_unit_v1') || 'ml'
  const waterGoal = Number(localStorage.getItem('water_goal_v1') || '0') || 0

  function addWaterAmount(amount) {
    const cur = Number(localStorage.getItem('water_v1') || '0') || 0
    localStorage.setItem('water_v1', String(cur + amount))
    setRefresh(r => r + 1)
  }

  function removeWaterAmount(amount) {
    const cur = Number(localStorage.getItem('water_v1') || '0') || 0
    localStorage.setItem('water_v1', String(Math.max(0, cur - amount)))
    setRefresh(r => r + 1)
  }

  function resetWaterAmount() {
    localStorage.setItem('water_v1', '0')
    setRefresh(r => r + 1)
  }

  function setWaterGoal(val) {
    const n = Number(val) || 0
    localStorage.setItem('water_goal_v1', String(Math.max(0, n)))
    setRefresh(r => r + 1)
  }

  function setWaterUnit(unit) {
    localStorage.setItem('water_unit_v1', unit)
    setRefresh(r => r + 1)
  }

  const fontFamilyMap = {
    'Arial': 'Arial, sans-serif',
    'Times New Roman': '"Times New Roman", serif',
    'Georgia': 'Georgia, serif',
    'Verdana': 'Verdana, sans-serif',
    'Courier New': '"Courier New", monospace',
    'Comic Sans MS': '"Comic Sans MS", cursive'
  }

  const waterPanelStyle = {
    background: settings.darkMode ? '#111' : '#fff',
    color: settings.darkMode ? '#eee' : '#111',
    fontWeight: settings.fontWeight,
    fontFamily: fontFamilyMap[settings.fontFamily] || fontFamilyMap['Arial'],
    padding: 12,
    border: '1px solid #f0f0f0',
    borderRadius: 6,
    boxSizing: 'border-box'
  }

  return (
    <section style={waterPanelStyle}>
      <h2 style={{ marginTop: 0 }}>Water Intake</h2>
      
      <div style={{ marginBottom: 16, width: '100%' }}>
        {(() => {
          const goal = Math.max(0, waterGoal || 0)
          const pct = goal ? Math.min(100, Math.round((waterValue / goal) * 100)) : 0
          return (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                <span>Daily Progress</span>
                <span style={{ color: settings.darkMode ? '#aaa' : '#666' }}>{waterValue} / {goal} {waterUnit} ({pct}%)</span>
              </div>
              <progress value={pct} max="100" style={{ width: '100%', height: 12 }} />
            </>
          )
        })()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: settings.darkMode ? '#aaa' : '#666' }}>Total</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{waterValue}</div>
          <select value={waterUnit} onChange={(e) => setWaterUnit(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="oz">oz</option>
            <option value="gal">gal</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Daily Goal ({waterUnit})</div>
            <input
              type="number"
              placeholder={`e.g. ${waterUnit === 'ml' ? '2000' : waterUnit === 'L' ? '2' : waterUnit === 'oz' ? '64' : '0.5'}`}
              value={waterGoal || ''}
              onChange={(e) => setWaterGoal(e.target.value)}
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {waterUnit === 'ml' && (
              <>
                <button onClick={() => setWaterGoal(2000)} style={{ padding: '6px 12px', fontSize: 12 }}>2000ml</button>
                <button onClick={() => setWaterGoal(2500)} style={{ padding: '6px 12px', fontSize: 12 }}>2500ml</button>
              </>
            )}
            {waterUnit === 'L' && (
              <>
                <button onClick={() => setWaterGoal(2)} style={{ padding: '6px 12px', fontSize: 12 }}>2L</button>
                <button onClick={() => setWaterGoal(3)} style={{ padding: '6px 12px', fontSize: 12 }}>3L</button>
              </>
            )}
            {waterUnit === 'oz' && (
              <>
                <button onClick={() => setWaterGoal(64)} style={{ padding: '6px 12px', fontSize: 12 }}>64oz</button>
                <button onClick={() => setWaterGoal(80)} style={{ padding: '6px 12px', fontSize: 12 }}>80oz</button>
              </>
            )}
            {waterUnit === 'gal' && (
              <>
                <button onClick={() => setWaterGoal(0.5)} style={{ padding: '6px 12px', fontSize: 12 }}>0.5gal</button>
                <button onClick={() => setWaterGoal(1)} style={{ padding: '6px 12px', fontSize: 12 }}>1gal</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Custom Amount</div>
            <input
              id="customWaterInput"
              type="number"
              placeholder="Enter amount"
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </label>
          <button onClick={() => { const input = document.getElementById('customWaterInput'); const amt = Number(input.value) || 0; if (amt > 0) { addWaterAmount(amt); input.value = '' } }} style={{ padding: '6px 12px' }}>Add</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Quick Add</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {waterUnit === 'ml' && (
              <>
                <button onClick={() => addWaterAmount(250)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 250ml</button>
                <button onClick={() => addWaterAmount(500)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 500ml</button>
                <button onClick={() => addWaterAmount(1000)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 1L</button>
              </>
            )}
            {waterUnit === 'L' && (
              <>
                <button onClick={() => addWaterAmount(0.25)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 0.25L</button>
                <button onClick={() => addWaterAmount(0.5)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 0.5L</button>
                <button onClick={() => addWaterAmount(1)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 1L</button>
              </>
            )}
            {waterUnit === 'oz' && (
              <>
                <button onClick={() => addWaterAmount(8)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 8oz</button>
                <button onClick={() => addWaterAmount(16)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 16oz</button>
                <button onClick={() => addWaterAmount(32)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 32oz</button>
              </>
            )}
            {waterUnit === 'gal' && (
              <>
                <button onClick={() => addWaterAmount(0.25)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 0.25gal</button>
                <button onClick={() => addWaterAmount(0.5)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 0.5gal</button>
                <button onClick={() => addWaterAmount(1)} style={{ padding: '6px 12px', fontSize: 12 }}>+ 1gal</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Quick Remove</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {waterUnit === 'ml' && (
              <>
                <button onClick={() => removeWaterAmount(250)} style={{ padding: '6px 12px', fontSize: 12 }}>- 250ml</button>
                <button onClick={() => removeWaterAmount(500)} style={{ padding: '6px 12px', fontSize: 12 }}>- 500ml</button>
                <button onClick={() => removeWaterAmount(1000)} style={{ padding: '6px 12px', fontSize: 12 }}>- 1L</button>
              </>
            )}
            {waterUnit === 'L' && (
              <>
                <button onClick={() => removeWaterAmount(0.25)} style={{ padding: '6px 12px', fontSize: 12 }}>- 0.25L</button>
                <button onClick={() => removeWaterAmount(0.5)} style={{ padding: '6px 12px', fontSize: 12 }}>- 0.5L</button>
                <button onClick={() => removeWaterAmount(1)} style={{ padding: '6px 12px', fontSize: 12 }}>- 1L</button>
              </>
            )}
            {waterUnit === 'oz' && (
              <>
                <button onClick={() => removeWaterAmount(8)} style={{ padding: '6px 12px', fontSize: 12 }}>- 8oz</button>
                <button onClick={() => removeWaterAmount(16)} style={{ padding: '6px 12px', fontSize: 12 }}>- 16oz</button>
                <button onClick={() => removeWaterAmount(32)} style={{ padding: '6px 12px', fontSize: 12 }}>- 32oz</button>
              </>
            )}
            {waterUnit === 'gal' && (
              <>
                <button onClick={() => removeWaterAmount(0.25)} style={{ padding: '6px 12px', fontSize: 12 }}>- 0.25gal</button>
                <button onClick={() => removeWaterAmount(0.5)} style={{ padding: '6px 12px', fontSize: 12 }}>- 0.5gal</button>
                <button onClick={() => removeWaterAmount(1)} style={{ padding: '6px 12px', fontSize: 12 }}>- 1gal</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={resetWaterAmount} style={{ flex: 1 }}>Reset</button>
        </div>

        <small style={{ color: settings.darkMode ? '#aaa' : '#666' }}>Track your daily water intake. Set a daily goal and use quick‑add buttons or manual entry.</small>
      </div>
    </section>
  )
}

export default WaterPage
