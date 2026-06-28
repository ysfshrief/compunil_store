'use client'

import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

interface Props {
  title:      string
  subtitle?:  string
  href?:      string
  linkLabel?: string
}

export default function SectionHeader({ title, subtitle, href, linkLabel = 'View All' }: Props) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">{title}</h2>
        {subtitle && <p className="text-sm text-brand-muted mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-brand-teal hover:text-brand-navy transition-colors group"
        >
          {linkLabel}
          <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  )
}
