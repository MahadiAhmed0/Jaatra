import { StarIcon } from '../icons'

export default function StarRating({ value, max = 5, size = 14 }) {
  return (
    <span className="stars" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} size={size} className={i < Math.round(value || 0) ? 'star on' : 'star'} />
      ))}
    </span>
  )
}