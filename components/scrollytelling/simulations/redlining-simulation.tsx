"use client"

import { useState, useEffect } from "react"
import { Check, X, HelpCircle } from "lucide-react"
import Image from "next/image"

type RiskLevel = "hazardous" | "declining" | "still-desirable" | "best"
type CharacterType = "green" | "yellow"

interface Applicant {
  id: number
  name: string
  mortgage: number
  riskLevel: RiskLevel
  characterType: CharacterType
  assignedHouse?: number
}

interface HousePosition {
  houseNumber: number
  x: number
  y: number
  occupied: boolean
  characterType?: CharacterType
  isWalking?: boolean
}

interface MortgageCardProps {
  applicant: Applicant
  onApprove: () => void
  onDeny: () => void
  approvalsDisabled: boolean
  denialTooltip?: string
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

function canApprove(risk: RiskLevel): boolean {
  return risk === "best" || risk === "still-desirable"
}

function MortgageCard({ applicant, onApprove, onDeny, approvalsDisabled, denialTooltip }: MortgageCardProps) {
  const riskStyles = getRiskStyles(applicant.riskLevel)
  const isApprovable = canApprove(applicant.riskLevel)
  
  return (
    <div className="speech-bubble p-6 max-w-xs">
      <p className="text-sm text-center text-foreground/70 mb-2 font-semibold">{applicant.name}</p>
      <p className="text-sm text-center text-foreground/70 mb-4">I want this one!</p>
      
      {/* Mortgage Amount */}
      <p className="text-sm text-center text-foreground/70">Requested</p>
      <p className="text-4xl font-bold text-center text-foreground mb-6">
        ${applicant.mortgage.toLocaleString()}
      </p>
      
      {/* Risk Level */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <p className="text-sm text-foreground/70">Risk Level</p>
        <HelpCircle className="w-4 h-4 text-foreground/50" />
      </div>
      <p className={`distressed-text text-xl text-center ${riskStyles.text} mb-2`}>
        {riskStyles.label}
      </p>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full ${riskStyles.bg}`}
          style={{ 
            width: applicant.riskLevel === 'hazardous' ? '100%' :
                   applicant.riskLevel === 'declining' ? '66%' :
                   applicant.riskLevel === 'still-desirable' ? '33%' : '15%'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onApprove}
          disabled={!isApprovable}
          title={!isApprovable ? (denialTooltip || "This loan is too hazardous, your company does not allow you to approve") : ""}
          className="flex items-center gap-2 px-4 py-2 bg-white text-foreground font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        >
          <Check className="w-5 h-5" strokeWidth={3} />
          approve
        </button>
        <button
          onClick={onDeny}
          className="flex items-center gap-2 px-4 py-2 bg-white text-foreground font-bold rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
          deny
        </button>
      </div>
    </div>
  )
}

interface CharacterPositionProps {
  x: number
  y: number
  isWalking: boolean
  characterType: CharacterType
}

function Character({ x, y, isWalking, characterType }: CharacterPositionProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  
  useEffect(() => {
    if (!isWalking) {
      setFrameIndex(0)
      return
    }
    
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % 2)
    }, 300)
    
    return () => clearInterval(interval)
  }, [isWalking])
  
  const imagePath = isWalking 
    ? `/redlining/${characterType} walking ${frameIndex + 1}.png`
    : `/redlining/${characterType} idle ${frameIndex + 1}.png`
  
  return (
    <div 
      className="absolute transition-all duration-500 ease-in-out"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <Image
        src={imagePath}
        alt="character"
        width={60}
        height={80}
        priority
      />
    </div>
  )
}

interface RedliningSimulationProps {
  onComplete?: (results: { approved: number; denied: number }) => void
}

const APPLICANTS: Applicant[] = [
  { id: 1, name: "Marcus", mortgage: 20100, riskLevel: "best", characterType: "green" },
  { id: 2, name: "David", mortgage: 18500, riskLevel: "declining", characterType: "yellow" },
  { id: 3, name: "Sarah", mortgage: 25000, riskLevel: "still-desirable", characterType: "green" },
  { id: 4, name: "James", mortgage: 32000, riskLevel: "hazardous", characterType: "yellow" },
  { id: 5, name: "Elena", mortgage: 15800, riskLevel: "best", characterType: "green" },
  { id: 6, name: "Robert", mortgage: 22300, riskLevel: "declining", characterType: "yellow" },
  { id: 7, name: "Lisa", mortgage: 28900, riskLevel: "still-desirable", characterType: "green" },
  { id: 8, name: "Michael", mortgage: 19200, riskLevel: "hazardous", characterType: "yellow" },
  { id: 9, name: "Jennifer", mortgage: 21500, riskLevel: "best", characterType: "green" },
  { id: 10, name: "Christopher", mortgage: 17600, riskLevel: "declining", characterType: "yellow" },
  { id: 11, name: "Amanda", mortgage: 24100, riskLevel: "still-desirable", characterType: "green" },
  { id: 12, name: "Daniel", mortgage: 31200, riskLevel: "hazardous", characterType: "yellow" },
  { id: 13, name: "Victoria", mortgage: 23400, riskLevel: "best", characterType: "green" },
  { id: 14, name: "Kevin", mortgage: 19900, riskLevel: "declining", characterType: "yellow" },
  { id: 15, name: "Patricia", mortgage: 26700, riskLevel: "still-desirable", characterType: "green" },
]

// House positions - left side (1-5) hazardous, right side (6-10) green
const HOUSE_POSITIONS: HousePosition[] = [
  { houseNumber: 1, x: 60, y: 280, occupied: false },
  { houseNumber: 2, x: 200, y: 240, occupied: false },
  { houseNumber: 3, x: 350, y: 300, occupied: false },
  { houseNumber: 4, x: 480, y: 200, occupied: false },
  { houseNumber: 5, x: 150, y: 400, occupied: false },
  { houseNumber: 6, x: 800, y: 280, occupied: false },
  { houseNumber: 7, x: 950, y: 200, occupied: false },
  { houseNumber: 8, x: 1100, y: 320, occupied: false },
  { houseNumber: 9, x: 1220, y: 240, occupied: false },
  { houseNumber: 10, x: 1350, y: 340, occupied: false },
]

export function RedliningSimulation({ onComplete }: RedliningSimulationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<Array<'approved' | 'denied'>>([])
  const [houses, setHouses] = useState<HousePosition[]>(HOUSE_POSITIONS)
  const [characterPosition, setCharacterPosition] = useState({ x: 550, y: 420 })
  const [isWalking, setIsWalking] = useState(false)
  const [targetHouse, setTargetHouse] = useState<HousePosition | null>(null)
  
  const currentApplicant = APPLICANTS[currentIndex]
  const isComplete = currentIndex >= APPLICANTS.length
  
  // Get next available house for the character type
  const getNextAvailableHouse = (characterType: CharacterType): HousePosition | null => {
    const availableHouses = characterType === 'green' 
      ? houses.filter(h => h.houseNumber >= 6 && !h.occupied)
      : houses.filter(h => h.houseNumber < 6 && !h.occupied)
    return availableHouses.length > 0 ? availableHouses[0] : null
  }
  
  // Animation for character walking to house
  useEffect(() => {
    if (!isWalking || !targetHouse) return
    
    const startX = characterPosition.x
    const startY = characterPosition.y
    const endX = targetHouse.x + 40
    const endY = targetHouse.y - 80
    
    const steps = 30
    let currentStep = 0
    
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      const newX = startX + (endX - startX) * progress
      const newY = startY + (endY - startY) * progress
      
      setCharacterPosition({ x: newX, y: newY })
      
      if (currentStep >= steps) {
        setIsWalking(false)
        clearInterval(interval)
      }
    }, 30)
    
    return () => clearInterval(interval)
  }, [isWalking, targetHouse, characterPosition.x, characterPosition.y])
  
  const handleDecision = (decision: 'approved' | 'denied') => {
    if (decision === 'approved') {
      const nextHouse = getNextAvailableHouse(currentApplicant.characterType)
      if (nextHouse) {
        setTargetHouse(nextHouse)
        setIsWalking(true)
        setHouses(houses.map(h => 
          h.houseNumber === nextHouse.houseNumber 
            ? { ...h, occupied: true, characterType: currentApplicant.characterType }
            : h
        ))
      }
    }
    
    const newDecisions = [...decisions, decision]
    setDecisions(newDecisions)
    
    if (currentIndex + 1 >= APPLICANTS.length) {
      setTimeout(() => {
        onComplete?.({ 
          approved: newDecisions.filter(d => d === 'approved').length,
          denied: newDecisions.filter(d => d === 'denied').length 
        })
      }, 1200)
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
    }, 800)
  }
  
  if (isComplete) {
    const approved = decisions.filter(d => d === 'approved').length
    const denied = decisions.filter(d => d === 'denied').length
    const greenHousesOccupied = houses.filter(h => h.houseNumber >= 6 && h.occupied).length
    const redHousesEmpty = houses.filter(h => h.houseNumber < 6 && !h.occupied).length
    
    return (
      <div className="grass-bg min-h-[70vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Scene */}
        <div className="absolute inset-0">
          <Image
            src="/redlining/bg-neighborhood.png"
            alt="neighborhood"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Houses at end state */}
        <div className="absolute inset-0">
          {houses.map(house => (
            <div 
              key={house.houseNumber}
              className="absolute"
              style={{ left: `${(house.x / 1400) * 100}%`, top: `${(house.y / 500) * 100}%` }}
            >
              <Image
                src={`/redlining/house-${house.houseNumber}.png`}
                alt={`house-${house.houseNumber}`}
                width={80}
                height={70}
              />
              {house.occupied && (
                <Character
                  x={0}
                  y={-60}
                  isWalking={false}
                  characterType={house.characterType!}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* End screen content */}
        <div className="relative z-10 bg-cream-dark rounded-xl p-8 max-w-2xl text-center border-4 border-tan shadow-xl">
          <h3 className="text-3xl font-bold mb-6 text-red-600">Review Complete</h3>
          
          <p className="text-lg mb-4">
            You approved <span className="text-green-600 font-bold text-xl">{approved}</span> applications
          </p>
          <p className="text-lg mb-8">
            You denied <span className="text-red-600 font-bold text-xl">{denied}</span> applications
          </p>
          
          <div className="bg-white p-6 rounded-lg mb-8 text-left">
            <h4 className="font-bold text-lg mb-3">What happened:</h4>
            <p className="text-sm mb-2">
              ✓ Green neighborhood (right): <span className="font-bold">{greenHousesOccupied} houses</span> occupied
            </p>
            <p className="text-sm mb-4">
              ✗ Red neighborhood (left): <span className="font-bold">{redHousesEmpty} houses</span> remain empty
            </p>
            <p className="text-sm text-foreground/70 italic">
              This is how redlining worked in America. Discriminatory lending practices created segregated neighborhoods by race, with investment flowing to white neighborhoods while disinvesting in communities of color.
            </p>
          </div>
          
          <button 
            onClick={() => { 
              setCurrentIndex(0)
              setDecisions([])
              setHouses(HOUSE_POSITIONS)
              setCharacterPosition({ x: 550, y: 420 })
              setTargetHouse(null)
            }}
            className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="grass-bg min-h-[70vh] flex flex-col relative overflow-hidden">
      {/* Background Scene */}
      <div className="absolute inset-0">
        <Image
          src="/redlining/bg-neighborhood.png"
          alt="neighborhood"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Houses */}
      <div className="absolute inset-0">
        {houses.map(house => (
          <div 
            key={house.houseNumber}
            className="absolute"
            style={{ left: `${(house.x / 1400) * 100}%`, top: `${(house.y / 500) * 100}%` }}
          >
            <Image
              src={`/redlining/house-${house.houseNumber}.png`}
              alt={`house-${house.houseNumber}`}
              width={80}
              height={70}
              priority
            />
            {house.occupied && (
              <Character
                x={0}
                y={-60}
                isWalking={false}
                characterType={house.characterType!}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Moving Character */}
      <div className="absolute inset-0 pointer-events-none">
        <Character
          x={characterPosition.x}
          y={characterPosition.y}
          isWalking={isWalking}
          characterType={currentApplicant.characterType}
        />
      </div>
      
      {/* UI Layer */}
      <div className="relative z-10 flex-1 flex items-center justify-between p-8">
        {/* Instructions */}
        <div className="text-cream max-w-sm">
          <p className="text-lg font-bold mb-2">Chapter 1: Redlining</p>
          <p className="text-sm">For each applicant, decide whether to approve or deny their mortgage application.</p>
        </div>
        
        {/* Mortgage Card */}
        <div className="flex-shrink-0">
          <MortgageCard 
            applicant={currentApplicant}
            onApprove={() => handleDecision('approved')}
            onDeny={() => handleDecision('denied')}
            approvalsDisabled={!canApprove(currentApplicant.riskLevel)}
            denialTooltip="This loan is too hazardous, your company does not allow you to approve"
          />
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="relative z-10 bg-grass-dark/80 px-8 py-4 text-center">
        <div className="flex gap-2 justify-center mb-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentIndex ? 'bg-cream' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-cream text-sm">Applicant {currentIndex + 1} of 15</p>
      </div>
    </div>
  )
}
