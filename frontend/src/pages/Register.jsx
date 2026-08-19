import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { CompassIcon } from '../icons'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.register(form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <span className="brand-mark">
            <CompassIcon size={24} />
          </span>
          <h1>Create account</h1>
          <p>Join Jaatra and start exploring.</p>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Name</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn primary" disabled={busy}>
            {busy ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}