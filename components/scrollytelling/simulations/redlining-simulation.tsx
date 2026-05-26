"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type RefObject,
} from "react"
import { Check, X } from "lucide-react"
import Image from "next/image"
import {
  BASE_APPLICANTS,
  shouldApproveApplicant,
  type ApplicantRiskProfile,
  type CharacterType,
  type RiskLevel,
} from "./redlining-data"

type Applicant = ApplicantRiskProfile

interface HouseSlot {
  houseNumber: number
  /** 0–1 position on the map, aligned to baked-in houses on bg-neighborhood.png */
  anchorX: number
  anchorY: number
  occupied: boolean
  characterType?: CharacterType
}

const REDLINING_BG = "#B3DA9B"
const PLACED_CHARACTER_SCALE = 0.65
const CHARACTER_FOOT_TRANSFORM = "translate(-50%, -92%)"
/** Feet on the road at the bottom of the neighborhood map */
const BOTTOM_START = { x: 0.51, y: 1.0 }
const ROAD_BOTTOM_OFFSET = "7%"
const ROAD_CHARACTER_LEFT = "51.5%"
const WALK_FRAME_MS = 200
const MAX_DISCRETIONARY_DENIES = 1
const WALK_STEPS = 45
const WALK_STEP_MS = 35

interface DecisionControlsProps {
  applicant: Applicant
  onApprove: () => void
  onDeny: () => void
  denialMessage: string
  disabled: boolean
}

function getRiskStyles(risk: RiskLevel) {
  switch (risk) {
    case "hazardous":
      return { text: "text-red-600", bg: "bg-red-600", label: "hazardous" }
    case "declining":
      return { text: "text-yellow-600", bg: "bg-yellow-600", label: "declining" }
    case "still-desirable":
      return { text: "text-blue-600", bg: "bg-blue-600", label: "still desirable" }
    case "best":
      return { text: "text-green-600", bg: "bg-green-600", label: "best" }
  }
}

function getRiskBarWidth(risk: RiskLevel): string {
  switch (risk) {
    case "hazardous":
      return "100%"
    case "declining":
      return "66%"
    case "still-desirable":
      return "33%"
    default:
      return "15%"
  }
}

function getCharacterSprite(characterType: CharacterType, isWalking: boolean): string {
  if (characterType === "yellow") {
    return isWalking ? "/redlining/yellow walking.png" : "/redlining/yellow idle.png"
  }
  return isWalking ? "/redlining/blue walking.png" : "/redlining/blue idle.png"
}

const NEIGHBORHOOD_BG_CLASS = "object-cover object-bottom"

function DecisionControls({
  applicant,
  onApprove,
  onDeny,
  denialMessage,
  disabled,
}: DecisionControlsProps) {
  const riskStyles = getRiskStyles(applicant.riskLevel)
  const isApprovable = shouldApproveApplicant(applicant)

  const approveDisabled = !isApprovable || disabled
  const showDenialTooltip = !isApprovable && Boolean(denialMessage)

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex gap-4 justify-center">
        <div
          className={`relative group ${showDenialTooltip ? "cursor-not-allowed" : ""}`}
        >
          {showDenialTooltip && (
            <div
              id="approve-denial-tooltip"
              role="tooltip"
              className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)] w-64 px-3 py-2.5 text-sm text-foreground font-medium leading-snug text-center bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-foreground/15 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-50 pointer-events-none"
            >
              {denialMessage}
            </div>
          )}
          <button
            type="button"
            onClick={onApprove}
            disabled={approveDisabled}
            aria-describedby={showDenialTooltip ? "approve-denial-tooltip" : undefined}
            className={`flex items-center gap-2 px-8 py-3 bg-white text-foreground font-bold rounded-full border-2 border-foreground shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors ${
              showDenialTooltip ? "pointer-events-none" : ""
            }`}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
            approve
          </button>
        </div>
        <button
          type="button"
          onClick={onDeny}
          disabled={disabled}
          className="flex items-center gap-2 px-8 py-3 bg-white text-foreground font-bold rounded-full border-2 border-foreground shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
          deny
        </button>
      </div>

      <div className="w-full max-w-xs text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <p className="text-sm text-foreground/80 font-medium">Risk Level</p>
          {/* <HelpCircle className="w-4 h-4 text-foreground/50" aria-hidden /> */}
        </div>
        <p className={`distressed-text text-2xl ${riskStyles.text} mb-1`}>
          {riskStyles.label}
        </p>
        <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full ${riskStyles.bg} transition-all`}
            style={{ width: getRiskBarWidth(applicant.riskLevel) }}
          />
        </div>
      </div>
    </div>
  )
}

function SpeechBubble({ applicant }: { applicant: Applicant }) {
  return (
    <div
      className="relative flex flex-col items-center text-center min-w-[320px] min-h-[270px] px-14 pt-11 pb-16 scale-110"
      style={{
        backgroundImage: "url(/redlining/bubble.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <p className="text-sm text-foreground/80 mb-2 mt-1">I want this one!</p>
      <p className="text-2xl font-bold text-foreground mb-4">
        ${applicant.mortgage.toLocaleString()}
      </p>
      <div className="mt-auto pb-2">
        <Image
          src={`/redlining/house-${applicant.targetHouse}.png`}
          alt=""
          width={80}
          height={70}
          className="opacity-95"
          aria-hidden
        />
      </div>
    </div>
  )
}

/** Matches floating copy blocks on the highway intro scene */
const FLOATING_HEADER_CLASS =
  "text-lg md:text-xl font-medium text-foreground leading-relaxed bg-white/80 backdrop-blur-sm px-6 py-4 rounded-lg shadow-sm"

function ResultsTicker({
  approved,
  denied,
  onTryAgain,
}: {
  approved: number
  denied: number
  onTryAgain: () => void
}) {
  return (
    <div className="absolute top-4 left-0 right-0 z-40 flex flex-col items-center gap-3 px-6 pointer-events-none">
      <div className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
        <p className={`${FLOATING_HEADER_CLASS} tabular-nums`}>
          Approved: <span className="font-bold">{approved}</span>
        </p>
        <p className={`${FLOATING_HEADER_CLASS} tabular-nums`}>
          Denied: <span className="font-bold">{denied}</span>
        </p>
      </div>
      <p className={`${FLOATING_HEADER_CLASS} text-center max-w-xl`}>
        Hmm, where&apos;d all the squares go?
      </p>
      <button
        type="button"
        onClick={onTryAgain}
        className="pointer-events-auto text-sm font-medium text-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:bg-white transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

function GameplayHeaderOverlay({
  applicant,
  onApprove,
  onDeny,
  denialMessage,
  controlsDisabled,
}: {
  applicant: Applicant
  onApprove: () => void
  onDeny: () => void
  denialMessage: string
  controlsDisabled: boolean
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-6 pb-4 pointer-events-none lg:min-h-[200px]">
      <div className="max-w-[280px] text-foreground mb-6 lg:mb-0 lg:absolute lg:left-6 lg:top-6 pointer-events-auto bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
        <p className="text-sm">
          For each applicant, decide whether to approve or deny their mortgage application. The
          goal is to approve as many as you can!
        </p>
      </div>
      <div className="w-full flex justify-center lg:absolute lg:left-1/2 lg:top-6 lg:-translate-x-1/2 lg:w-max lg:max-w-none pointer-events-auto">
        <DecisionControls
          applicant={applicant}
          onApprove={onApprove}
          onDeny={onDeny}
          denialMessage={denialMessage}
          disabled={controlsDisabled}
        />
      </div>
    </div>
  )
}

function NeighborhoodScene({
  mapRef,
  children,
}: {
  mapRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <div
      ref={mapRef}
      className="relative flex-1 min-h-[95vh] w-full"
      style={{ backgroundColor: REDLINING_BG }}
    >
      <div className="absolute inset-0">
        <Image
          src="/redlining/bg-neighborhood.png"
          alt=""
          fill
          className={NEIGHBORHOOD_BG_CLASS}
          priority
        />
      </div>
      {children}
    </div>
  )
}

function ApplicantProgress({
  currentIndex,
  total,
}: {
  currentIndex: number
  total: number
}) {
  return (
    <div className="absolute top-4 right-4 z-40 px-4 py-3 rounded-lg bg-black/40 backdrop-blur-sm text-right pointer-events-none">
      <div className="flex gap-1.5 justify-end mb-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < currentIndex ? "bg-cream" : "bg-white/30"}`}
          />
        ))}
      </div>
      <p className="text-cream text-sm whitespace-nowrap">
        Applicant {currentIndex + 1} of {total}
      </p>
    </div>
  )
}

function countDiscretionaryDenies(
  decisions: Array<"approved" | "denied">,
  applicantList: Applicant[]
): number {
  return decisions.reduce((count, decision, index) => {
    if (decision === "denied" && applicantList[index] && shouldApproveApplicant(applicantList[index])) {
      return count + 1
    }
    return count
  }, 0)
}

function ExcessiveDenyOverlay({ onTryAgain }: { onTryAgain: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-cream-dark rounded-xl p-8 max-w-md text-center border-4 border-tan shadow-xl">
        <h3 className="text-2xl font-bold mb-4 text-red-600">Approve more mortgages</h3>
        <p className="text-sm mb-6 leading-relaxed">
          You can only deny one application you were allowed to approve. Try again and approve
          more mortgages to fill the neighborhood.
        </p>
        <button
          type="button"
          onClick={onTryAgain}
          className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-bold"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

function shuffleApplicants(applicants: Applicant[]): Applicant[] {
  const shuffled = [...applicants]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function BottomApplicantScene({ applicant }: { applicant: Applicant }) {
  return (
    <div
      key={applicant.id}
      className="absolute z-20 -translate-x-1/2 pointer-events-none"
      style={{ bottom: ROAD_BOTTOM_OFFSET, left: ROAD_CHARACTER_LEFT }}
    >
      <div className="redlining-pop-in flex flex-col items-center">
        <div className="mb-5">
          <SpeechBubble applicant={applicant} />
        </div>
        <div className="relative flex flex-col items-center">
          <p className="text-xs font-bold bg-foreground text-white px-2 py-0.5 rounded mb-0.5">
            {applicant.name}
          </p>
          <CharacterSprite characterType={applicant.characterType} isWalking={false} />
        </div>
      </div>
    </div>
  )
}

function CharacterSprite({
  characterType,
  isWalking,
  scale = 1,
  width = 64,
  height = 84,
}: {
  characterType: CharacterType
  isWalking: boolean
  scale?: number
  width?: number
  height?: number
}) {
  const [useWalkPose, setUseWalkPose] = useState(false)

  useEffect(() => {
    if (!isWalking) {
      setUseWalkPose(false)
      return
    }
    const interval = setInterval(() => {
      setUseWalkPose((prev) => !prev)
    }, WALK_FRAME_MS)
    return () => clearInterval(interval)
  }, [isWalking])

  return (
    <Image
      src={getCharacterSprite(characterType, isWalking && useWalkPose)}
      alt=""
      width={width}
      height={height}
      priority
      className="drop-shadow-sm origin-bottom"
      style={{ transform: `scale(${scale})` }}
    />
  )
}

interface RedliningSimulationProps {
  onComplete?: (results: { approved: number; denied: number }) => void
}

const HOUSE_SLOTS: HouseSlot[] = [
  { houseNumber: 1, anchorX: 0.11, anchorY: 0.68, occupied: false },
  { houseNumber: 2, anchorX: 0.21, anchorY: 0.62, occupied: false },
  { houseNumber: 3, anchorX: 0.31, anchorY: 0.72, occupied: false },
  { houseNumber: 4, anchorX: 0.4, anchorY: 0.58, occupied: false },
  { houseNumber: 5, anchorX: 0.17, anchorY: 0.80, occupied: false },
  { houseNumber: 6, anchorX: 0.61, anchorY: 0.74, occupied: false },
  { houseNumber: 7, anchorX: 0.67, anchorY: 0.61, occupied: false },
  { houseNumber: 8, anchorX: 0.82, anchorY: 0.55, occupied: false },
  { houseNumber: 9, anchorX: 0.72, anchorY: 0.90, occupied: false },
  { houseNumber: 10, anchorX: 0.94, anchorY: 0.85, occupied: false },
]

/** All applicants in a row — shown before the simulation starts */
export function RedliningApplicantLineup() {
  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex justify-center items-end gap-2 sm:gap-4 px-6 w-max mx-auto">
      {BASE_APPLICANTS.map((applicant) => (
        <div key={applicant.id} className="shrink-0 flex flex-col items-center">
          <Image
            src={getCharacterSprite(applicant.characterType, false)}
            alt=""
            width={44}
            height={58}
            className="drop-shadow-sm origin-bottom"
          />
        </div>
      ))}
      </div>
    </div>
  )
}

function getDenialMessage(risk: RiskLevel): string {
    return "This loan is too hazardous. Your company does not allow you to approve."
}

function getHouseAnchor(house: HouseSlot) {
  return { x: house.anchorX, y: house.anchorY }
}

function PlacedCharacter({
  anchorX,
  anchorY,
  characterType,
}: {
  anchorX: number
  anchorY: number
  characterType: CharacterType
}) {
  return (
    <div
      className="absolute z-[18] pointer-events-none"
      style={{
        left: `${anchorX * 100}%`,
        top: `${anchorY * 100}%`,
        transform: CHARACTER_FOOT_TRANSFORM,
      }}
    >
      <CharacterSprite
        characterType={characterType}
        isWalking={false}
        scale={PLACED_CHARACTER_SCALE}
        width={52}
        height={68}
      />
    </div>
  )
}

function OccupiedCharacters({ houses }: { houses: HouseSlot[] }) {
  return (
    <>
      {houses
        .filter((h) => h.occupied && h.characterType)
        .map((house) => (
          <PlacedCharacter
            key={house.houseNumber}
            anchorX={house.anchorX}
            anchorY={house.anchorY}
            characterType={house.characterType!}
          />
        ))}
    </>
  )
}

export function RedliningSimulation({ onComplete }: RedliningSimulationProps) {
  const [applicants, setApplicants] = useState(() => shuffleApplicants(BASE_APPLICANTS))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<Array<"approved" | "denied">>([])
  const [houses, setHouses] = useState<HouseSlot[]>(HOUSE_SLOTS)
  const [characterPosition, setCharacterPosition] = useState(BOTTOM_START)
  const [characterScale, setCharacterScale] = useState(1)
  const [isWalking, setIsWalking] = useState(false)
  const [showWalkingCharacter, setShowWalkingCharacter] = useState(false)
  const [walkerType, setWalkerType] = useState<CharacterType | null>(null)
  const [controlsLocked, setControlsLocked] = useState(false)
  const [showExcessiveDeny, setShowExcessiveDeny] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const walkTargetRef = useRef<HouseSlot | null>(null)
  const walkingApplicantRef = useRef<Applicant | null>(null)
  const pendingDecisionsRef = useRef<Array<"approved" | "denied">>([])

  const currentApplicant = applicants[currentIndex]
  const isComplete = currentIndex >= applicants.length

  const advanceApplicant = useCallback(
    (newDecisions: Array<"approved" | "denied">) => {
      setControlsLocked(false)
      setShowWalkingCharacter(false)
      setWalkerType(null)
      setIsWalking(false)
      setCharacterPosition(BOTTOM_START)
      setCharacterScale(1)
      walkTargetRef.current = null
      walkingApplicantRef.current = null

      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= applicants.length) {
          onComplete?.({
            approved: newDecisions.filter((d) => d === "approved").length,
            denied: newDecisions.filter((d) => d === "denied").length,
          })
        }
        return next
      })
    },
    [onComplete, applicants.length]
  )

  useEffect(() => {
    if (!isWalking || !walkTargetRef.current) return

    const target = walkTargetRef.current
    const end = getHouseAnchor(target)
    const walker = walkingApplicantRef.current
    let step = 0

    const interval = setInterval(() => {
      step++
      const progress = Math.min(step / WALK_STEPS, 1)

      setCharacterPosition({
        x: BOTTOM_START.x + (end.x - BOTTOM_START.x) * progress,
        y: BOTTOM_START.y + (end.y - BOTTOM_START.y) * progress,
      })
      setCharacterScale(1 - progress * (1 - PLACED_CHARACTER_SCALE))

      if (step >= WALK_STEPS) {
        clearInterval(interval)
        setIsWalking(false)
        setCharacterPosition(end)
        setCharacterScale(PLACED_CHARACTER_SCALE)

        if (target && walker) {
          setHouses((prev) =>
            prev.map((h) =>
              h.houseNumber === target.houseNumber
                ? { ...h, occupied: true, characterType: walker.characterType }
                : h
            )
          )
        }

        window.setTimeout(() => {
          setShowWalkingCharacter(false)
          setWalkerType(null)
          walkTargetRef.current = null
          walkingApplicantRef.current = null
          advanceApplicant(pendingDecisionsRef.current)
        }, 450)
      }
    }, WALK_STEP_MS)

    return () => clearInterval(interval)
  }, [isWalking, advanceApplicant])

  const resetSimulation = useCallback(() => {
    setApplicants(shuffleApplicants(BASE_APPLICANTS))
    setCurrentIndex(0)
    setDecisions([])
    setHouses(HOUSE_SLOTS)
    setCharacterPosition(BOTTOM_START)
    setCharacterScale(1)
    setShowWalkingCharacter(false)
    setWalkerType(null)
    setIsWalking(false)
    setControlsLocked(false)
    setShowExcessiveDeny(false)
    walkTargetRef.current = null
    walkingApplicantRef.current = null
    pendingDecisionsRef.current = []
  }, [])

  const handleDecision = (decision: "approved" | "denied") => {
    if (controlsLocked || isComplete || showExcessiveDeny) return

    if (
      decision === "denied" &&
      shouldApproveApplicant(currentApplicant) &&
      countDiscretionaryDenies(decisions, applicants) >= MAX_DISCRETIONARY_DENIES
    ) {
      setShowExcessiveDeny(true)
      return
    }

    const newDecisions = [...decisions, decision]
    setDecisions(newDecisions)
    setControlsLocked(true)

    if (decision === "approved") {
      const slot = houses.find((h) => h.houseNumber === currentApplicant.targetHouse)
      if (slot && !slot.occupied) {
        pendingDecisionsRef.current = newDecisions
        walkingApplicantRef.current = currentApplicant
        walkTargetRef.current = slot
        setWalkerType(currentApplicant.characterType)
        setCharacterPosition(BOTTOM_START)
        setCharacterScale(1)
        setShowWalkingCharacter(true)
        setIsWalking(true)
        return
      }
    }

    pendingDecisionsRef.current = newDecisions
    advanceApplicant(newDecisions)
  }

  const simulationShell = (children: ReactNode) => (
    <div className="min-h-[95vh] relative overflow-hidden">{children}</div>
  )

  if (isComplete) {
    const approved = decisions.filter((d) => d === "approved").length
    const denied = decisions.filter((d) => d === "denied").length

    return simulationShell(
      <NeighborhoodScene mapRef={mapRef}>
        <OccupiedCharacters houses={houses} />
        <ResultsTicker
          approved={approved}
          denied={denied}
          onTryAgain={resetSimulation}
        />
      </NeighborhoodScene>
    )
  }

  return simulationShell(
    <NeighborhoodScene mapRef={mapRef}>
      <ApplicantProgress currentIndex={currentIndex} total={applicants.length} />

      <GameplayHeaderOverlay
        applicant={currentApplicant}
        onApprove={() => handleDecision("approved")}
        onDeny={() => handleDecision("denied")}
        denialMessage={getDenialMessage(currentApplicant.riskLevel)}
        controlsDisabled={controlsLocked}
      />

      <OccupiedCharacters houses={houses} />

      {showWalkingCharacter && walkerType && (
        <div
          className="absolute z-[22] pointer-events-none"
          style={{
            left: `${characterPosition.x * 100}%`,
            top: `${characterPosition.y * 100}%`,
            transform: CHARACTER_FOOT_TRANSFORM,
          }}
        >
          <CharacterSprite
            characterType={walkerType}
            isWalking={isWalking}
            scale={characterScale}
          />
        </div>
      )}

      {!showWalkingCharacter && !controlsLocked && currentApplicant && (
        <BottomApplicantScene applicant={currentApplicant} />
      )}

      {showExcessiveDeny && <ExcessiveDenyOverlay onTryAgain={resetSimulation} />}
    </NeighborhoodScene>
  )
}
