import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import PlaceCard from '../components/PlaceCard'
import { HeartIcon } from '../icons'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

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

  const toggleSaved = async (id) => {
    const exists = wishlist.some((p) => p._id === id)
    setWishlist((w) => (exists ? w.filter((p) => p._id !== id) : w))
    try {
      await (exists ? api.removeFromWishlist(id) : api.addToWishlist(id))
    } catch {
      loadWishlist()
    }
  }

  return (
    <div>
      <div className="section-head">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <HeartIcon size={19} /> Wishlist
        </h2>
        <span className="muted">{wishlist.length} saved places</span>
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
    </div>
  )
}
