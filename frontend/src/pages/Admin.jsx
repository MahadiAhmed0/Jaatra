import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Modal from '../components/Modal'
import {
  BuildingIcon,
  UtensilsIcon,
  LandmarkIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
  CheckIcon,
  ShieldIcon,
  AlertIcon,
} from '../icons'

const categoryOptions = [
  { value: 'hotel', label: 'Hotel', Icon: BuildingIcon },
  { value: 'restaurant', label: 'Restaurant', Icon: UtensilsIcon },
  { value: 'attraction', label: 'Attraction', Icon: LandmarkIcon },
]

const emptyForm = {
  name: '',
  category: 'hotel',
  description: '',
  address: '',
  city: '',
  priceRange: '$$',
  lat: '',
  lng: '',
  images: [],
}

function PlaceForm({ place, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    place
      ? {
          name: place.name,
          category: place.category,
          description: place.description || '',
          address: place.address,
          city: place.city,
          priceRange: place.priceRange || '$$',
          lat: place.lat ?? '',
          lng: place.lng ?? '',
          images: place.images || [],
        }
      : emptyForm
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = {
      ...form,
      lat: form.lat === '' ? undefined : Number(form.lat),
      lng: form.lng === '' ? undefined : Number(form.lng),
    }
    try {
      if (place) await api.updatePlace(place._id, body)
      else await api.createPlace(body)
      onSaved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const addImage = async (file) => {
    setUploading(true)
    setError('')
    try {
      const url = await api.uploadImage(file)
      set('images', [...form.images, url])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Name</label>
          <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Price range</label>
          <select className="input" value={form.priceRange} onChange={(e) => set('priceRange', e.target.value)}>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <textarea
            className="input"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Address</label>
          <input className="input" required value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="field">
          <label>City</label>
          <input className="input" required value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="field">
          <label>Latitude</label>
          <input
            className="input"
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => set('lat', e.target.value)}
            placeholder="23.8103"
          />
        </div>
        <div className="field">
          <label>Longitude</label>
          <input
            className="input"
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => set('lng', e.target.value)}
            placeholder="90.4125"
          />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Photos</label>
          <label className="upload-box">
            <UploadIcon size={16} /> {uploading ? 'Uploading…' : 'Upload a photo'}
            <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files[0] && addImage(e.target.files[0])} />
          </label>
          {form.images.length > 0 && (
            <div className="img-list" style={{ marginTop: 10 }}>
              {form.images.map((img, i) => (
                <div className="img-item" key={i}>
                  <img src={img} alt="" />
                  <button type="button" onClick={() => set('images', form.images.filter((_, x) => x !== i))}>
                    <XIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {place ? 'Save changes' : 'Create place'}
        </button>
      </div>
    </form>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('places')

  const [places, setPlaces] = useState([])
  const [placesLoading, setPlacesLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportStatus, setReportStatus] = useState('pending')

  const loadPlaces = useCallback(() => {
    setPlacesLoading(true)
    api
      .getPlaces({ limit: 100 })
      .then((res) => setPlaces(res.data))
      .catch(() => {})
      .finally(() => setPlacesLoading(false))
  }, [])

  const loadReports = useCallback(() => {
    setReportsLoading(true)
    api
      .getReports(reportStatus)
      .then((res) => setReports(res.data))
      .catch(() => {})
      .finally(() => setReportsLoading(false))
  }, [reportStatus])

  useEffect(() => {
    if (tab === 'places') loadPlaces()
    else loadReports()
  }, [tab, loadPlaces, loadReports])

  const deletePlace = async (place) => {
    if (!window.confirm(`Delete "${place.name}"?`)) return
    try {
      await api.deletePlace(place._id)
      loadPlaces()
    } catch (err) {
      window.alert(err.message)
    }
  }

  const resolveReport = async (report) => {
    try {
      await api.resolveReport(report._id)
      loadReports()
    } catch (err) {
      window.alert(err.message)
    }
  }

  const deleteReportedReview = async (report) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await api.deleteReview(report.review._id)
      loadReports()
    } catch (err) {
      window.alert(err.message)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="empty">
        <div className="empty-icon">
          <AlertIcon size={44} />
        </div>
        <h3>Access denied</h3>
        <p>You need an admin account to view this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-bar">
        <h1>Admin</h1>
        <div className="admin-tabs">
          <button className={`tab-btn${tab === 'places' ? ' active' : ''}`} onClick={() => setTab('places')}>
            <BuildingIcon size={15} /> Places
          </button>
          <button className={`tab-btn${tab === 'reports' ? ' active' : ''}`} onClick={() => setTab('reports')}>
            <ShieldIcon size={15} /> Reports
          </button>
        </div>
      </div>

      {tab === 'places' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn primary" onClick={() => { setEditing(null); setShowForm(true) }}>
              <PlusIcon size={16} /> Add place
            </button>
          </div>

          {placesLoading ? (
            <div className="loading">
              <span className="spinner" /> Loading places
            </div>
          ) : places.length === 0 ? (
            <div className="empty">
              <h3>No places yet</h3>
              <p>Add your first place to get started.</p>
            </div>
          ) : (
            <div className="table">
              <div className="table-head">
                <span>Name</span>
                <span>Category</span>
                <span>City</span>
                <span>Rating</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {places.map((place) => (
                <div className="table-row" key={place._id}>
                  <span>{place.name}</span>
                  <span className="muted" style={{ textTransform: 'capitalize' }}>{place.category}</span>
                  <span className="muted">{place.city}</span>
                  <span>{place.avgRating ? Number(place.avgRating).toFixed(1) : '—'} ({place.reviewCount || 0})</span>
                  <span className="table-actions">
                    <button
                      className="icon-btn"
                      onClick={() => { setEditing(place); setShowForm(true) }}
                      aria-label={`Edit ${place.name}`}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => deletePlace(place)} aria-label={`Delete ${place.name}`}>
                      <TrashIcon size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div>
          <div className="chips" style={{ marginBottom: 18 }}>
            {['pending', 'resolved', ''].map((s) => (
              <button
                key={s || 'all'}
                className={`chip${reportStatus === s ? ' active' : ''}`}
                onClick={() => setReportStatus(s)}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>

          {reportsLoading ? (
            <div className="loading">
              <span className="spinner" /> Loading reports
            </div>
          ) : reports.length === 0 ? (
            <div className="empty">
              <h3>No reports</h3>
              <p>Nothing to moderate here.</p>
            </div>
          ) : (
            <div className="report-list">
              {reports.map((report) => (
                <div className="report-card" key={report._id}>
                  <div className="report-main">
                    <div className="report-reason">{report.reason}</div>
                    <div className="report-detail">
                      Reported by {report.user?.name} · {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    {report.review && (
                      <div className="report-quote">
                        “{report.review.comment}” — {report.review.rating}/5
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span className={`report-status ${report.status}`}>{report.status}</span>
                    {report.review && (
                      <Link className="btn small" to={`/place/${report.review.place}`}>
                        View review
                      </Link>
                    )}
                    {report.review && (
                      <button className="btn small danger" onClick={() => deleteReportedReview(report)}>
                        <TrashIcon size={14} /> Delete review
                      </button>
                    )}
                    {report.status === 'pending' && (
                      <button className="btn small" onClick={() => resolveReport(report)}>
                        <CheckIcon size={14} /> Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? 'Edit place' : 'Add place'}
          wide
          onClose={() => setShowForm(false)}
        >
          <PlaceForm
            place={editing}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false)
              loadPlaces()
            }}
          />
        </Modal>
      )}
    </div>
  )
}