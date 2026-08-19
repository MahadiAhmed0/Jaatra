import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import PlaceCard from '../components/PlaceCard'
import {
  SearchIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingIcon,
  UtensilsIcon,
  LandmarkIcon,
  ArrowRightIcon,
  CompassIcon,
  StarIcon,
} from '../icons'

const categories = [
  { value: '', label: 'All', Icon: LandmarkIcon },
  { value: 'hotel', label: 'Hotels', Icon: BuildingIcon },
  { value: 'restaurant', label: 'Restaurants', Icon: UtensilsIcon },
  { value: 'attraction', label: 'Attractions', Icon: LandmarkIcon },
]

const sorts = [
  { value: '-avgRating', label: 'Top rated' },
  { value: 'avgRating', label: 'Rating: low to high' },
  { value: 'priceRange', label: 'Price: low to high' },
  { value: '-priceRange', label: 'Price: high to low' },
]

export default function Home() {
  const { token } = useAuth()
  const [params, setParams] = useSearchParams()
  const [places, setPlaces] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [query, setQuery] = useState({ category: '', city: '', sort: '-avgRating', search: '' })
  const [wishlist, setWishlist] = useState([])

  const resultsRef = useRef(null)
  const debounce = useRef(null)

  const category = params.get('category') || ''

  useEffect(() => {
    setPage(1)
    setQuery((q) => ({ ...q, category }))
  }, [category])

  const setCategory = (value) => {
    if (value) setParams({ category: value })
    else setParams({})
  }

  const setFilter = (key, value) => {
    setPage(1)
    setQuery((q) => ({ ...q, [key]: value }))
  }

  useEffect(() => {
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => setFilter('search', search), 450)
    return () => clearTimeout(debounce.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    const p = { page, limit: 12, sort: query.sort }
    if (query.category) p.category = query.category
    if (query.city.trim()) p.city = query.city.trim()
    if (query.search.trim()) p.search = query.search.trim()

    api
      .getPlaces(p)
      .then((res) => {
        setPlaces(res.data)
        setTotalItems(res.totalItems || 0)
        setTotalPages(res.totalPages || 1)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, query])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!token) {
      setWishlist([])
      return
    }
    api
      .getWishlist()
      .then((res) => setWishlist(res.data.map((p) => p._id)))
      .catch(() => {})
  }, [token])

  const toggleSaved = async (id) => {
    const exists = wishlist.includes(id)
    setWishlist((w) => (exists ? w.filter((x) => x !== id) : [...w, id]))
    try {
      await (exists ? api.removeFromWishlist(id) : api.addToWishlist(id))
    } catch {
      setWishlist((w) => (exists ? [...w, id] : w.filter((x) => x !== id)))
    }
  }

  const submitSearch = (e) => {
    e.preventDefault()
    setFilter('city', city)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heroPlace = [...places].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))[0]
  const heroImg = heroPlace?.images?.[0] || ''

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Where to <span className="hero-accent">next?</span>
            </h1>
            <p className="hero-sub">
              Hotels, restaurants and attractions — discovered and rated by real travelers.
            </p>

            <div className="hero-tabs">
              {categories.map((c) => (
                <button
                  key={c.value}
                  className={`hero-tab${query.category === c.value ? ' active' : ''}`}
                  onClick={() => setCategory(c.value)}
                >
                  <c.Icon size={14} /> {c.label}
                </button>
              ))}
            </div>

            <form className="search-card" onSubmit={submitSearch}>
              <div className="sc-field dest">
                <label>Destination</label>
                <input
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Where are you going?"
                  aria-label="Destination"
                />
              </div>
              <button className="btn primary btn-lg" type="submit">
                <SearchIcon size={17} /> Search
              </button>
            </form>
          </div>

          <div className="hero-visual">
            <div className="hero-photo">
              <svg
                className="hero-svg"
                viewBox="0 0 460 560"
                role="img"
                aria-label="Illustration of a scenic travel destination"
              >
                <defs>
                  <linearGradient id="hvSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8fbcff" />
                    <stop offset="1" stopColor="#e3edff" />
                  </linearGradient>
                </defs>
                <rect width="460" height="560" fill="url(#hvSky)" />
                <circle cx="332" cy="112" r="44" fill="#ffd98c" opacity="0.92" />
                <circle cx="332" cy="112" r="58" fill="#ffd98c" opacity="0.25" />
                <path
                  d="M0 380 L78 258 L158 348 L228 246 L330 382 L420 288 L460 330 L460 560 L0 560 Z"
                  fill="#4c86e0"
                  opacity="0.5"
                />
                <path
                  d="M0 432 C 90 372, 190 408, 270 366 C 350 324, 410 388, 460 356 L460 560 L0 560 Z"
                  fill="#1f56bf"
                />
                <path
                  d="M0 470 C 120 452, 200 478, 300 458 C 380 442, 420 470, 460 458 L460 560 L0 560 Z"
                  fill="#0f3f9e"
                  opacity="0.85"
                />
                <path d="M196 466 q34 18 68 0 l-7 12 h-54 z" fill="#fff" />
                <path d="M232 468 l8 8 h-16 z" fill="#fff" />
              </svg>
              {heroImg && (
                <img
                  className="hero-photo-img"
                  src={heroImg}
                  alt={heroPlace?.name || 'Travel destination'}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
            <div className="float-card top">
              <span className="fc-icon">
                <CompassIcon size={17} />
              </span>
              <span>
                <span className="fc-title">Top pick</span>
                <br />
                <span className="fc-sub">{heroPlace ? heroPlace.name : 'Recommended stays'}</span>
              </span>
            </div>
            <div className="float-card bottom">
              <span className="fc-icon">
                <StarIcon size={17} />
              </span>
              <span>
                <span className="fc-title">
                  {heroPlace && heroPlace.avgRating
                    ? `${Number(heroPlace.avgRating).toFixed(1)} rating`
                    : 'Top rated'}
                </span>
                <br />
                <span className="fc-sub">
                  {heroPlace ? `${heroPlace.reviewCount || 0} reviews` : 'From real travelers'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="cat-section">
        <div className="cat-head">
          <h2>Browse by category</h2>
          <span className="cat-head-sub">Plan your trip around what you love</span>
        </div>
        <div className="cat-cards">
          {categories
            .filter((c) => c.value)
            .map((c) => (
              <Link
                key={c.value}
                to={`/?category=${c.value}`}
                className="cat-card"
                onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="cat-icon">
                  <c.Icon size={22} />
                </span>
                <span>
                  <h3>{c.label}</h3>
                  <span className="cat-go">
                    Explore <ArrowRightIcon size={14} />
                  </span>
                </span>
              </Link>
            ))}
        </div>
      </section>

      <div className="toolbar" ref={resultsRef}>
        <p className="results-info">
          <b>{totalItems}</b> places{query.city ? ` in ${query.city}` : ''}
          {query.search ? ` matching “${query.search}”` : ''}
        </p>
        <div className="filter-right">
          <div className="filter-input">
            <SearchIcon className="icon" size={15} />
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              aria-label="Search by name"
            />
          </div>
          <select
            className="input compact"
            value={query.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            aria-label="Sort places"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">
          <span className="spinner" /> Loading places
        </div>
      ) : places.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <MapPinIcon size={44} />
          </div>
          <h3>No places found</h3>
          <p>Try a different destination or category.</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {places.map((place, i) => (
              <PlaceCard
                key={place._id}
                place={place}
                index={i}
                saved={token && wishlist.includes(place._id)}
                onToggleSaved={token ? () => toggleSaved(place._id) : undefined}
              />
            ))}
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <span className="page-info">
              Page {page} of {totalPages || 1}
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}