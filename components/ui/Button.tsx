'use client'

import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-1'

    const variants = {
      primary:   'bg-brand-navy text-white hover:bg-brand-navydark active:scale-[0.98]',
      secondary: 'bg-brand-teal text-white hover:bg-brand-tealdk active:scale-[0.98]',
      outline:   'border-2 border-brand-navy text-brand-navy hover:bg-brand-light active:scale-[0.98]',
      ghost:     'text-brand-navy hover:bg-brand-light active:scale-[0.98]',
      danger:    'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading…
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
export default Button
