import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionHeadingProps {
  heading: string
  subheading: string
  className?: string
}

export function SectionHeading({ heading, subheading, className }: SectionHeadingProps) {
  return (
    <div className={cn('text-center', className)}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {heading}
      </h2>
      <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
        {subheading}
      </p>
    </div>
  )
}
