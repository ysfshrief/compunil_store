'use client'

import { FiStar } from 'react-icons/fi'
import { cn } from '../../lib/utils'

interface Props {
  rating:    number
  max?:      number
  size?:     number
  showCount?: boolean
  count?:    number
  className?: string
}

export default function StarRating({
  rating,
  max = 5,
  size = 14,
  showCount = false,
  count,
  className,
}: Props) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const filled = i + 1 <= Math.floor(rating)
          const half   = !filled && i < rating && rating % 1 >= 0.3
          return (
            <FiStar
              key={i}
              size={size}
              className={cn(
                filled || half ? 'text-yellow-400' : 'text-gray-200',
                filled         ? 'fill-yellow-400' : '',
              )}
            />
          )
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-brand-muted">({count})</span>
      )}
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  )
}
