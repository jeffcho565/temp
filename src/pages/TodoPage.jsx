import { useState } from 'react'

function TodoPage() {
  const [, setRefresh] = useState(0)

  function submitQuickTodo(values) {
    try {
      const t = JSON.parse(localStorage.getItem('todos_v1') || '[]')
      t.unshift({ id: Date.now(), text: values.text.trim(), done: false, createdAt: new Date().toISOString() })
      localStorage.setItem('todos_v1', JSON.stringify(t))
    } finally {
      setRefresh(r => r + 1)
    }
  }

  function toggleTodoDone(id) {
    try {
      const t = JSON.parse(localStorage.getItem('todos_v1') || '[]')
      const updated = t.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
      localStorage.setItem('todos_v1', JSON.stringify(updated))
    } finally {
      setRefresh(r => r + 1)
    }
  }

  function deleteTodo(id) {
    try {
      const t = JSON.parse(localStorage.getItem('todos_v1') || '[]')
      const updated = t.filter((it) => it.id !== id)
      localStorage.setItem('todos_v1', JSON.stringify(updated))
    } finally {
      setRefresh(r => r + 1)
    }
  }

  function clearAllTodos() {
    if (!confirm('Clear all to‑dos?')) return
    localStorage.setItem('todos_v1', JSON.stringify([]))
    setRefresh(r => r + 1)
  }

  const todos = JSON.parse(localStorage.getItem('todos_v1') || '[]')

  return (
    <section style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
      <h2 style={{ marginTop: 0 }}>To‑Do</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.target.elements.todoInput
          if (input.value.trim()) {
            submitQuickTodo({ text: input.value.trim() })
            input.value = ''
          }
        }}
        style={{ marginTop: 8, marginBottom: 12, display: 'flex', gap: 8 }}
      >
        <input
          name="todoInput"
          placeholder="Add new task and press Enter or click Add"
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          autoFocus
        />
        <button type="submit">Add</button>
        <button type="button" onClick={clearAllTodos}>Clear All</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {todos.map((t) => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #f3f3f3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={!!t.done} onChange={() => toggleTodoDone(t.id)} />
              <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => deleteTodo(t.id)}>Delete</button>
            </div>
          </li>
        ))}
        {todos.length === 0 && <li style={{ color: '#666' }}>No to‑dos</li>}
      </ul>
    </section>
  )
}

export default TodoPage
