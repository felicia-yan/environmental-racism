"use client"

import { ReactNode } from "react"

interface SimulationWrapperProps {
  children: ReactNode
  instruction?: string
  className?: string
}

export function SimulationWrapper({ 
  children, 
  instruction,
  className = "" 
}: SimulationWrapperProps) {
  return (
    <section className={`min-h-screen flex flex-col ${className}`}>
      {/* Simulation Area */}
      <div className="flex-1 relative">
        {children}
      </div>
      
      {/* Instruction Text */}
      {instruction && (
        <div className="bg-grass-dark/90 py-4 px-6 text-center">
          <p className="text-cream text-lg max-w-xl mx-auto">
            {instruction}
          </p>
        </div>
      )}
    </section>
  )
}
