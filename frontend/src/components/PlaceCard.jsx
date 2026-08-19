import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPinIcon,
  TagIcon,
  BuildingIcon,
  UtensilsIcon,
  LandmarkIcon,
  HeartIcon,
  HeartFilledIcon,
} from '../icons'

const categoryMeta = {
  hotel: { label: 'Hotel', Icon: BuildingIcon },
  restaurant: { label: 'Restaurant', Icon: UtensilsIcon },
  attraction: { label: 'Attraction', Icon: LandmarkIcon },
}

export function scoreLabel(value) {
  if (value >= 9) return 'Exceptional'
  if (value >= 8) return 'Wonderful'
  if (value >= 7) return 'Very good'
  if (value >= 6) return 'Pleasant'
  if (value > 0) return 'Fair'
  return 'New'
}

export default function PlaceCard({ place, saved, onToggleSaved, index = 0 }) {
  const meta = categoryMeta[place.category] || { label: place.category, Icon: LandmarkIcon }
  const cover = place.images && place.images[0]
  const score = Number(place.avgRating || 0)
  const [broken, setBroken] = useState(false)

  return (
    <article className="card" style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}>
      <div className="card-media-wrap">
        <Link to={`/place/${place._id}`} className="card-media">
          {cover && !broken ? (
            <img
              src={cover}
              alt={place.name}
              loading="lazy"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="card-media-fallback">
              <meta.Icon size={42} />
            </div>
          )}
        </Link>
        {onToggleSaved && (
          <button
            className={`icon-btn wish-btn${saved ? ' saved' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onToggleSaved()
            }}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {saved ? <HeartFilledIcon /> : <HeartIcon />}
          </button>
        )}
      </div>
      <div className="card-body">
        <span className="card-cat-text">
          {meta.label} in {place.city}
        </span>
        <h3 className="card-title">
          <Link to={`/place/${place._id}`}>{place.name}</Link>
        </h3>
        <p className="card-meta">
          <MapPinIcon size={13} /> {place.address}
        </p>
        <div className="card-foot">
          <div className="rating-block">
            {score > 0 && <span className="score-badge">{score.toFixed(1)}</span>}
            <span className="rating-meta">
              <span className="score-label">{scoreLabel(score)}</span>
              <span className="rating-count">{place.reviewCount || 0} reviews</span>
            </span>
          </div>
          {place.priceRange && (
            <span className="price">
              <TagIcon className="tag-icon" size={14} /> {place.priceRange}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}