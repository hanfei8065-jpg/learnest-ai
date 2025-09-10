'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AccordionItem {
  question: string
  answer: string
}

export interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* 使用 div 代替 button 来避免事件处理器错误 */}
          <div
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset transition-colors cursor-pointer"
            onClick={() => toggleItem(index)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleItem(index)
              }
            }}
            aria-expanded={openIndex === index}
            aria-controls={`accordion-content-${index}`}
          >
            <span className="font-medium text-gray-900 pr-4">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0',
                openIndex === index && 'rotate-180'
              )}
            />
          </div>
          <div
            id={`accordion-content-${index}`}
            className={cn(
              'overflow-hidden transition-all duration-200 ease-in-out',
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-6 pb-4 text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}