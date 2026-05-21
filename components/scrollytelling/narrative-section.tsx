"use client"

import { ReactNode } from "react"

interface NarrativeSectionProps {
  children: ReactNode
  className?: string
}

export function NarrativeSection({ children, className = "" }: NarrativeSectionProps) {
  return (
    <section className={`min-h-[50vh] flex items-center justify-center px-6 py-16 bg-background ${className}`}>
      <div className="max-w-2xl prose prose-lg prose-neutral">
        {children}
      </div>
    </section>
  )
}

interface NarrativeTextProps {
  children: ReactNode
}

export function NarrativeText({ children }: NarrativeTextProps) {
  return (
    <p className="text-lg leading-relaxed text-foreground mb-6">
      {children}
    </p>
  )
}

interface NarrativeHighlightProps {
  children: ReactNode
}

export function NarrativeHighlight({ children }: NarrativeHighlightProps) {
  return (
    <p className="text-xl font-semibold text-primary leading-relaxed mb-6">
      {children}
    </p>
  )
}
