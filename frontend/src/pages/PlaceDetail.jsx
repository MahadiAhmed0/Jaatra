import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import StarRating from '../components/StarRating'
import Modal from '../components/Modal'
import {
  MapPinIcon,
  TagIcon,
  BuildingIcon,
  UtensilsIcon,
  LandmarkIcon,
  HeartIcon,
  HeartFilledIcon,
  ThumbsUpIcon,
  FlagIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  UploadIcon,
  XIcon,
  AlertIcon,
} from '../icons'

const categoryMeta = {
  hotel: { label: 'Hotel', Icon: BuildingIcon },
  restaurant: { label: 'Restaurant', Icon: UtensilsIcon },
  attraction: { label: 'Attraction', Icon: LandmarkIcon },
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function PlaceDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()

  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [mainImg, setMainImg] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({ rating: 5, comment: '', image: '' })
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [reportFor, setReportFor] = useState(null)
  const [reportReason, setReportReason] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([api.getPlace(id), api.getReviews(id)])
      .then(([p, r]) => {
        setPlace(p.data)
        setReviews(r.data)
        setMainImg(p.data.images?.[0] || '')
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!token) return
    api
      .getWishlist()
      .then((res) => setSaved(res.data.some((p) => p._id === id)))
      .catch(() => {})
  }, [token, id])

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" /> Loading
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="error-box">
        <div className="empty-icon">
          <AlertIcon size={44} />
        </div>
        <h3>{error || 'Place not found'}</h3>
        <p style={{ marginTop: 8 }}>
          <Link to="/" style={{ color: 'var(--accent)' }}>
            Back to discover
          </Link>
        </p>
      </div>
    )
  }

  const meta = categoryMeta[place.category] || { label: place.category, Icon: LandmarkIcon }
  const images = place.images || []

  const toggleSaved = async () => {
    setSaved(!saved)
    try {
      await (saved ? api.removeFromWishlist(id) : api.addToWishlist(id))
    } catch {
      setSaved(saved)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!form.comment.trim()) {
      setFormError('Please write a comment.')
      return
    }
    setBusy(true)
    setFormError('')
    try {
      if (editingId) {
        await api.updateReview(editingId, { rating: form.rating, comment: form.comment })
      } else {
        await api.createReview(id, { rating: form.rating, comment: form.comment })
      }
      setForm({ rating: 5, comment: '', image: '' })
      setEditingId(null)
      load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (review) => {
    setEditingId(review._id)
    setForm({ rating: review.rating, comment: review.comment, image: '' })
    setFormError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ rating: 5, comment: '', image: '' })
    setFormError('')
  }

  const removeReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await api.deleteReview(reviewId)
      if (editingId === reviewId) cancelEdit()
      load()
    } catch (err) {
      window.alert(err.message)
    }
  }

  const markHelpful = async (review) => {
    try {
      const res = await api.markHelpful(review._id)
      setReviews((rs) => rs.map((r) => (r._id === review._id ? res.data : r)))
    } catch (err) {
      window.alert(err.message)
    }
  }

  const submitReport = async (e) => {
    e.preventDefault()
    if (!reportReason.trim()) return
    setBusy(true)
    try {
      await api.reportReview(reportFor, { reason: reportReason })
      setReportFor(null)
      setReportReason('')
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  const uploadReviewImage = async (file) => {
    setFormError('')
    try {
      const url = await api.uploadImage(file)
      setForm((f) => ({ ...f, image: url }))
    } catch (err) {
      setFormError(err.message)
    }
  }

  const ownReview = (review) => user?._id === review.user?._id

  return (
    <div className="detail">
      <div className="detail-hero">
        {mainImg ? (
          <img src={mainImg} alt={place.name} />
        ) : (
          <div className="detail-hero-fallback">
            <meta.Icon size={70} />
          </div>
        )}
      </div>

      <div className="detail-layout">
        <div>
          <div className="detail-head">
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <span className="badge accent">
                <meta.Icon size={13} /> {meta.label}
              </span>
              {place.priceRange && (
                <span className="badge">
                  <TagIcon size={13} /> {place.priceRange}
                </span>
              )}
            </div>
            <h1>{place.name}</h1>
            <div className="detail-meta">
              <span className="item">
                <MapPinIcon size={15} /> {place.address}, {place.city}
              </span>
              <span className="item">
                <StarRating value={place.avgRating} />{' '}
                <b>{place.avgRating ? Number(place.avgRating).toFixed(1) : 'New'}</b>
                <span className="muted">({place.reviewCount || 0} reviews)</span>
              </span>
            </div>
            {place.description && <p className="detail-desc">{place.description}</p>}
          </div>

          {images.length > 0 && (
            <div className="gallery">
              <div className="gallery-main">
                <img src={mainImg} alt={place.name} />
              </div>
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`thumb${img === mainImg ? ' active' : ''}`}
                      onClick={() => setMainImg(img)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <h2 className="section-title">
            Reviews <span className="count">({reviews.length})</span>
          </h2>

          {token ? (
            <form className="review-form" onSubmit={submitReview}>
              <div className="form-title">{editingId ? 'Edit your review' : 'Write a review'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Rating</label>
                  <span className="star-input">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={n <= form.rating ? 'on' : ''}
                        onClick={() => setForm((f) => ({ ...f, rating: n }))}
                        aria-label={`${n} star`}
                      >
                        <StarIcon size={26} />
                      </button>
                    ))}
                  </span>
                </div>
                <div className="field">
                  <label>Comment</label>
                  <textarea
                    className="input"
                    maxLength={500}
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="How was your experience?"
                  />
                </div>
                <label className="upload-box">
                  <UploadIcon size={16} />
                  {form.image ? 'Image attached' : 'Attach a photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && uploadReviewImage(e.target.files[0])}
                  />
                </label>
                {form.image && (
                  <div className="img-list">
                    <div className="img-item">
                      <img src={form.image} alt="" />
                      <button type="button" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
                        <XIcon size={12} />
                      </button>
                    </div>
                  </div>
                )}
                {formError && <div className="form-error">{formError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn primary" disabled={busy}>
                    {editingId ? 'Update review' : 'Post review'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <p className="muted" style={{ marginBottom: 22, fontSize: 14 }}>
              <Link to="/login" style={{ color: 'var(--accent)' }}>
                Log in
              </Link>{' '}
              to write a review.
            </p>
          )}

          <div className="reviews">
            {reviews.length === 0 && (
              <div className="empty">
                <h3>No reviews yet</h3>
                <p>Be the first to review this place.</p>
              </div>
            )}
            {reviews.map((review) => (
              <article className="review" key={review._id}>
                <div className="review-head">
                  <span className="avatar">{(review.user?.name || 'U').charAt(0).toUpperCase()}</span>
                  <div>
                    <div className="review-author">{review.user?.name || 'Traveler'}</div>
                    <div className="review-date">
                      {formatDate(review.createdAt)} · <StarRating value={review.rating} size={12} />
                    </div>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                {review.images?.length > 0 && (
                  <div className="review-imgs">
                    {review.images.map((img, i) => (
                      <img key={i} src={img} alt="" loading="lazy" />
                    ))}
                  </div>
                )}
                <div className="review-actions">
                  {token && (
                    <button className="action-btn" onClick={() => markHelpful(review)}>
                      <ThumbsUpIcon size={13} /> Helpful · {review.helpfulCount}
                    </button>
                  )}
                  {token && (
                    <button
                      className="action-btn"
                      onClick={() => {
                        setReportFor(review._id)
                        setReportReason('')
                      }}
                    >
                      <FlagIcon size={13} /> Report
                    </button>
                  )}
                  {ownReview(review) && (
                    <>
                      <button className="action-btn" onClick={() => startEdit(review)}>
                        <EditIcon size={13} /> Edit
                      </button>
                      <button className="action-btn danger-text" onClick={() => removeReview(review._id)}>
                        <TrashIcon size={13} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="side-panel">
          <h3>Overview</h3>
          <div className="row">
            <span className="k">Rating</span>
            <span className="v">
              {place.avgRating ? Number(place.avgRating).toFixed(1) : '—'}
              <span className="muted"> / 5</span>
            </span>
          </div>
          <div className="row">
            <span className="k">Reviews</span>
            <span className="v">{place.reviewCount || 0}</span>
          </div>
          <div className="row">
            <span className="k">Category</span>
            <span className="v">{meta.label}</span>
          </div>
          <div className="row">
            <span className="k">Price</span>
            <span className="v">{place.priceRange || '—'}</span>
          </div>
          <div className="row">
            <span className="k">City</span>
            <span className="v">{place.city}</span>
          </div>
          {token && (
            <button className={`btn ${saved ? 'ghost' : 'primary'}`} onClick={toggleSaved}>
              {saved ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}
              {saved ? 'In wishlist' : 'Save to wishlist'}
            </button>
          )}
          {place.lat != null && place.lng != null && (
            <>
              <iframe
                className="map"
                title="Map"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.lng - 0.015}%2C${place.lat - 0.01}%2C${place.lng + 0.015}%2C${place.lat + 0.01}&layer=mapnik&marker=${place.lat}%2C${place.lng}`}
              />
              <a
                className="map-link"
                href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </>
          )}
        </aside>
      </div>

      {reportFor && (
        <Modal title="Report review" onClose={() => setReportFor(null)}>
          <form onSubmit={submitReport}>
            <div className="field">
              <label>Reason</label>
              <textarea
                className="input"
                maxLength={200}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this review?"
                required
              />
            </div>
            <button className="btn danger" disabled={busy || !reportReason.trim()}>
              <FlagIcon size={15} /> Submit report
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}