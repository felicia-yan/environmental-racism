"use client"

import { useState } from "react"
import { Check, X, HelpCircle } from "lucide-react"

type RiskLevel = "hazardous" | "declining" | "still-desirable" | "best"

interface Applicant {
  id: number
  houseName: string
  mortgage: number
  riskLevel: RiskLevel
  houseColor: "red" | "green" | "yellow" | "olive"
}

interface MortgageCardProps {
  applicant: Applicant
  onApprove: () => void
  onDeny: () => void
}

function getRiskStyles(risk: RiskLevel) {
  switch (risk) {
    case "hazardous":
      return { text: "text-red-600", bg: "bg-red-600", label: "hazardous" }
    case "declining":
      return { text: "text-orange-500", bg: "bg-orange-500", label: "declining" }
    case "still-desirable":
      return { text: "text-yellow-600", bg: "bg-yellow-600", label: "still desirable" }
    case "best":
      return { text: "text-green-600", bg: "bg-green-600", label: "best" }
  }
}

function MortgageCard({ applicant, onApprove, onDeny }: MortgageCardProps) {
  const riskStyles = getRiskStyles(applicant.riskLevel)
  
  return (
    <div className="speech-bubble p-6 max-w-xs">
      <p className="text-sm text-center text-foreground/70 mb-3">Requested House</p>
      
      {/* House Preview - placeholder for actual house image */}
      <div className="w-24 h-20 mx-auto mb-4 bg-muted rounded flex items-center justify-center">
        <div className={`w-16 h-12 rounded-sm ${
          applicant.houseColor === 'red' ? 'bg-red-400' :
          applicant.houseColor === 'green' ? 'bg-green-500' :
          applicant.houseColor === 'olive' ? 'bg-lime-600' :
          'bg-yellow-400'
        }`} />
      </div>
      
      {/* Mortgage Amount */}
      <p className="text-sm text-center text-foreground/70">Mortgage</p>
      <p className="text-3xl font-bold text-center text-foreground mb-4">
        ${applicant.mortgage.toLocaleString()}
      </p>
      
      {/* Risk Level */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <p className="text-sm text-foreground/70">Risk Level</p>
        <HelpCircle className="w-4 h-4 text-foreground/50" />
      </div>
      <p className={`distressed-text text-2xl text-center ${riskStyles.text} mb-2`}>
        {riskStyles.label}
      </p>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${riskStyles.bg}`}
          style={{ 
            width: applicant.riskLevel === 'hazardous' ? '100%' :
                   applicant.riskLevel === 'declining' ? '66%' :
                   applicant.riskLevel === 'still-desirable' ? '33%' : '15%'
          }}
        />
      </div>
    </div>
  )
}

interface RedliningSimulationProps {
  onComplete?: (results: { approved: number; denied: number }) => void
}

export function RedliningSimulation({ onComplete }: RedliningSimulationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<Array<'approved' | 'denied'>>([])
  
  const applicants: Applicant[] = [
    { id: 1, houseName: "Oak Street Home", mortgage: 20100, riskLevel: "hazardous", houseColor: "green" },
    { id: 2, houseName: "Maple Avenue", mortgage: 18500, riskLevel: "declining", houseColor: "yellow" },
    { id: 3, houseName: "Pine Road", mortgage: 25000, riskLevel: "still-desirable", houseColor: "olive" },
    { id: 4, houseName: "Elm Court", mortgage: 32000, riskLevel: "best", houseColor: "red" },
    { id: 5, houseName: "Cedar Lane", mortgage: 15800, riskLevel: "hazardous", houseColor: "green" },
  ]
  
  const currentApplicant = applicants[currentIndex]
  const isComplete = currentIndex >= applicants.length
  
  const handleDecision = (decision: 'approved' | 'denied') => {
    const newDecisions = [...decisions, decision]
    setDecisions(newDecisions)
    
    if (currentIndex + 1 >= applicants.length) {
      const approved = newDecisions.filter(d => d === 'approved').length
      const denied = newDecisions.filter(d => d === 'denied').length
      onComplete?.({ approved, denied })
    }
    
    setCurrentIndex(prev => prev + 1)
  }
  
  if (isComplete) {
    const approved = decisions.filter(d => d === 'approved').length
    const denied = decisions.filter(d => d === 'denied').length
    
    return (
      <div className="grass-bg min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="bg-cream-dark rounded-xl p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold mb-4">Review Complete</h3>
          <p className="text-lg mb-2">
            You approved <span className="text-green-600 font-bold">{approved}</span> applications
          </p>
          <p className="text-lg mb-6">
            You denied <span className="text-red-600 font-bold">{denied}</span> applications
          </p>
          <button 
            onClick={() => { setCurrentIndex(0); setDecisions([]) }}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="grass-bg min-h-[70vh] flex flex-col">
      {/* Houses on the lawn - placeholder positions */}
      <div className="flex-1 relative p-8">
        {/* Scattered houses */}
        <div className="absolute top-12 left-8 w-20 h-16 bg-red-400 rounded-t-lg opacity-80" />
        <div className="absolute top-24 left-48 w-18 h-14 bg-orange-300 rounded-t-lg opacity-80" />
        <div className="absolute top-16 left-96 w-16 h-12 bg-green-500 rounded-t-lg opacity-80" />
        <div className="absolute top-32 left-72 w-14 h-10 bg-lime-500 rounded-t-lg opacity-80" />
        <div className="absolute top-8 right-96 w-16 h-12 bg-yellow-400 rounded-t-lg opacity-80" />
        
        {/* Mortgage Card */}
        <div className="absolute top-4 right-8">
          <MortgageCard 
            applicant={currentApplicant}
            onApprove={() => handleDecision('approved')}
            onDeny={() => handleDecision('denied')}
          />
        </div>
      </div>
      
      {/* Decision Buttons */}
      <div className="flex justify-center gap-6 py-8 bg-grass-dark/50">
        <button
          onClick={() => handleDecision('approved')}
          className="flex items-center gap-3 px-8 py-4 bg-white text-foreground font-bold text-xl rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Check className="w-6 h-6" strokeWidth={3} />
          approve
        </button>
        <button
          onClick={() => handleDecision('denied')}
          className="flex items-center gap-3 px-8 py-4 bg-white text-foreground font-bold text-xl rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" strokeWidth={3} />
          deny
        </button>
      </div>
      
      {/* Instruction */}
      <div className="bg-grass-dark py-4 px-6 text-center">
        <p className="text-cream text-lg">
          For each applicant, decide whether to approve or deny their mortgage application.
        </p>
      </div>
    </div>
  )
}
