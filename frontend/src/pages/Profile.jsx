import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import PlaceCard from '../components/PlaceCard'
import { HeartIcon, ShieldIcon, UserIcon } from '../icons'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email })
  }, [user])

  const loadWishlist = useCallback(() => {
    setLoading(true)
    api
      .getWishlist()
      .then((res) => setWishlist(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

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

  const toggleSaved = async (id) => {
    const exists = wishlist.some((p) => p._id === id)
    setWishlist((w) => (exists ? w.filter((p) => p._id !== id) : w))
    try {
      await (exists ? api.removeFromWishlist(id) : api.addToWishlist(id))
    } catch {
      loadWishlist()
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
            <div className="num">{wishlist.length}</div>
            <div className="lbl">Saved places</div>
          </div>
          <div className="stat">
            <div className="num">—</div>
            <div className="lbl">Role</div>
          </div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
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

        <section>
          <div className="section-head">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              <UserIcon size={19} /> Wishlist
            </h2>
          </div>

          {loading ? (
            <div className="loading">
              <span className="spinner" /> Loading wishlist
            </div>
          ) : wishlist.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <HeartIcon size={44} />
              </div>
              <h3>Nothing saved yet</h3>
              <p>Tap the heart on any place to save it here.</p>
            </div>
          ) : (
            <div className="grid">
              {wishlist.map((place, i) => (
                <PlaceCard
                  key={place._id}
                  place={place}
                  index={i}
                  saved
                  onToggleSaved={() => toggleSaved(place._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}