import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [27.7172, 85.324]

const pinIcon = L.divIcon({
  className: '',
  html: `<div class="pick-pin"><svg viewBox="0 0 24 24" width="26" height="26"><path fill="#e11d48" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></div>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -34],
})

function toNum(v) {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function LocationPicker({ lat, lng, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!containerRef.current) return
    const lat0 = toNum(lat)
    const lng0 = toNum(lng)
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      lat0 != null && lng0 != null ? [lat0, lng0] : DEFAULT_CENTER,
      lat0 != null && lng0 != null ? 14 : 7
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    if (lat0 != null && lng0 != null) {
      markerRef.current = L.marker([lat0, lng0], { icon: pinIcon }).addTo(map)
    }
    map.on('click', (e) => {
      const { lat: la, lng: ln } = e.latlng
      if (markerRef.current) markerRef.current.setLatLng([la, ln])
      else markerRef.current = L.marker([la, ln], { icon: pinIcon }).addTo(map)
      onChange(la, ln)
    })
    mapRef.current = map
    const t = setTimeout(() => map.invalidateSize(), 0)
    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const lat0 = toNum(lat)
    const lng0 = toNum(lng)
    if (!map || lat0 == null || lng0 == null) return
    if (markerRef.current) markerRef.current.setLatLng([lat0, lng0])
    else markerRef.current = L.marker([lat0, lng0], { icon: pinIcon }).addTo(map)
  }, [lat, lng])

  const searchPlace = async (e) => {
    e.preventDefault()
    if (!search.trim() || searching) return
    setSearching(true)
    setSearchError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search.trim())}`
      )
      if (!res.ok) throw new Error('Search failed')
      const results = await res.json()
      if (results.length === 0) {
        setSearchError('No matching location found.')
        return
      }
      const r = results[0]
      const la = parseFloat(r.lat)
      const ln = parseFloat(r.lon)
      mapRef.current.setView([la, ln], 15)
      if (markerRef.current) markerRef.current.setLatLng([la, ln])
      else markerRef.current = L.marker([la, ln], { icon: pinIcon }).addTo(mapRef.current)
      onChange(la, ln)
    } catch (err) {
      setSearchError(err.message)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <div className="pick-row">
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchPlace(e)}
          placeholder="Search address or place name…"
        />
        <button type="button" className="btn primary" onClick={searchPlace} disabled={searching || !search.trim()}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>
      {searchError && <div className="pick-error">{searchError}</div>}
      <div ref={containerRef} className="pick-map" />
      <div className="pick-hint">Click anywhere on the map to place the marker</div>
    </div>
  )
}