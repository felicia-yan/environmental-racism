"use client"

import { useState } from "react"

interface SacrificeZonesSimulationProps {
  onComplete?: () => void
}

export function SacrificeZonesSimulation({ onComplete }: SacrificeZonesSimulationProps) {
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  
  const zones = [
    { id: 1, name: "Affluent Suburbs", color: "bg-green-400", risk: "best", resistance: "high" },
    { id: 2, name: "Middle Class Area", color: "bg-yellow-400", risk: "desirable", resistance: "medium" },
    { id: 3, name: "Working Class", color: "bg-orange-400", risk: "declining", resistance: "low" },
    { id: 4, name: "Redlined District", color: "bg-red-400", risk: "hazardous", resistance: "very low" },
  ]
  
  const handleSubmit = () => {
    setSubmitted(true)
    if (onComplete && selectedZone === 4) {
      onComplete()
    }
  }
  
  return (
    <div className="grass-bg min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h3 className="text-cream text-2xl font-bold text-center mb-8">
          Where should the highway go?
        </h3>
        
        {/* City Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => !submitted && setSelectedZone(zone.id)}
              className={`
                p-6 rounded-lg border-4 transition-all
                ${zone.color}
                ${selectedZone === zone.id ? 'border-white scale-105' : 'border-transparent'}
                ${submitted && selectedZone === zone.id ? 'ring-4 ring-white' : ''}
                ${!submitted ? 'hover:scale-102 cursor-pointer' : 'cursor-default'}
              `}
            >
              <p className="font-bold text-lg text-foreground">{zone.name}</p>
              <p className="text-sm text-foreground/70">Land cost: {zone.risk === 'best' ? 'High' : zone.risk === 'desirable' ? 'Medium' : zone.risk === 'declining' ? 'Low' : 'Very Low'}</p>
              <p className="text-sm text-foreground/70">Political resistance: {zone.resistance}</p>
            </button>
          ))}
        </div>
        
        {/* Submit/Results */}
        {!submitted ? (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedZone}
              className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90"
            >
              Submit Proposal
            </button>
          </div>
        ) : (
          <div className="bg-cream-dark rounded-xl p-6 text-center">
            {selectedZone === 4 ? (
              <>
                <p className="text-green-600 font-bold text-xl mb-2">Proposal Approved!</p>
                <p className="text-foreground/80">
                  The highway will be built through the redlined district. Land was cheap and there was little political opposition.
                </p>
              </>
            ) : (
              <>
                <p className="text-red-600 font-bold text-xl mb-2">Proposal Rejected</p>
                <p className="text-foreground/80 mb-4">
                  {selectedZone === 1 && "The affluent residents organized strong opposition and the land costs were too high."}
                  {selectedZone === 2 && "Middle class homeowners voted against the proposal, citing property value concerns."}
                  {selectedZone === 3 && "Land costs were acceptable but community organizing delayed the project indefinitely."}
                </p>
                <button
                  onClick={() => { setSubmitted(false); setSelectedZone(null) }}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
