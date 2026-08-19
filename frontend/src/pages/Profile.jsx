import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { ShieldIcon } from '../icons'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [savedCount, setSavedCount] = useState(0)
  const [form, setForm] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email })
  }, [user])

  const loadSavedCount = useCallback(() => {
    api
      .getWishlist()
      .then((res) => setSavedCount(res.data.length))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadSavedCount()
  }, [loadSavedCount])

  const saveProfile = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.updateMe(form)
      await refreshUser()
      setMessage('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return (
      <div className="loading">
        <span className="spinner" /> Loading
      </div>
    )
  }

  return (
    <div className="profile-grid">
      <aside className="panel">
        <div className="profile-top">
          <span className="avatar-lg">{user.name.charAt(0).toUpperCase()}</span>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          {user.role === 'admin' && (
            <span className="role-badge">
              <ShieldIcon size={12} /> Admin
            </span>
          )}
        </div>
        <div className="profile-stats">
          <div className="stat">
            <div className="num">{savedCount}</div>
            <div className="lbl">Saved places</div>
          </div>
          <div className="stat">
            <div className="num">{user.role}</div>
            <div className="lbl">Role</div>
          </div>
        </div>
      </aside>

      <section className="panel profile-edit">
        <h2>Profile</h2>
        <form onSubmit={saveProfile}>
          <div className="field">
            <label>Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <div>
            <button className="btn primary" disabled={busy}>
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
