"use client"

import { useState, useEffect } from "react"

interface HealthOutcomesSimulationProps {
  onComplete?: () => void
}

interface HealthMetric {
  name: string
  baseline: number
  nearHighway: number
  unit: string
}

export function HealthOutcomesSimulation({ onComplete }: HealthOutcomesSimulationProps) {
  const [yearsSimulated, setYearsSimulated] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  const healthMetrics: HealthMetric[] = [
    { name: "Asthma Rate", baseline: 8, nearHighway: 18, unit: "%" },
    { name: "Heart Disease", baseline: 12, nearHighway: 22, unit: "%" },
    { name: "Cancer Incidence", baseline: 5, nearHighway: 9, unit: "per 1000" },
    { name: "Life Expectancy", baseline: 79, nearHighway: 73, unit: "years" },
  ]
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && yearsSimulated < 30) {
      interval = setInterval(() => {
        setYearsSimulated(prev => {
          if (prev >= 30) {
            setIsRunning(false)
            onComplete?.()
            return prev
          }
          return prev + 1
        })
      }, 200)
    }
    return () => clearInterval(interval)
  }, [isRunning, yearsSimulated, onComplete])
  
  const progress = yearsSimulated / 30
  
  const getCurrentValue = (metric: HealthMetric) => {
    const diff = metric.nearHighway - metric.baseline
    return (metric.baseline + diff * progress).toFixed(1)
  }
  
  return (
    <div className="grass-bg min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <h3 className="text-cream text-2xl font-bold text-center mb-4">
          Health Outcomes Over Time
        </h3>
        <p className="text-cream/80 text-center mb-8">
          Compare health outcomes for communities near highways vs. those further away
        </p>
        
        {/* Timeline */}
        <div className="bg-cream-dark rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground/70">Year 0</span>
            <span className="font-bold text-lg">{yearsSimulated} years</span>
            <span className="text-sm text-foreground/70">Year 30</span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        
        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {healthMetrics.map((metric) => (
            <div key={metric.name} className="bg-cream-dark rounded-xl p-4">
              <p className="font-bold text-foreground mb-2">{metric.name}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-foreground/60">Away from highway</p>
                  <p className="text-lg font-mono">{metric.baseline} {metric.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/60">Near highway</p>
                  <p className={`text-2xl font-mono font-bold ${
                    metric.name === "Life Expectancy" ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {getCurrentValue(metric)} {metric.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Controls */}
        <div className="text-center">
          {yearsSimulated === 0 ? (
            <button
              onClick={() => setIsRunning(true)}
              className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-bold hover:bg-secondary/90"
            >
              Run Simulation
            </button>
          ) : yearsSimulated < 30 ? (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-bold hover:bg-secondary/90"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
          ) : (
            <button
              onClick={() => { setYearsSimulated(0); setIsRunning(false) }}
              className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-bold hover:bg-secondary/90"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
