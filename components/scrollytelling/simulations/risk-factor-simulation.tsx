"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import {
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  Coins,
  HandCoins,
  Home,
  MapPinned,
  RotateCcw,
  Shapes,
  X,
  type LucideIcon,
} from "lucide-react"
import {
  BASE_APPLICANTS,
  shouldApproveApplicant,
  type ApplicantRiskProfile,
  type CharacterType,
  type RiskFactorId,
  type RiskLevel,
} from "./redlining-data"

const RISK_LEVELS: RiskLevel[] = ["best", "still-desirable", "declining", "hazardous"]
const APPROVAL_BUCKETS = ["approve", "deny"] as const
type ApprovalBucket = (typeof APPROVAL_BUCKETS)[number]
const CORRECT_FACTORS: RiskFactorId[] = ["applicant-shape", "neighborhood-shapes"]
const SCALE_SLOT_COUNT = CORRECT_FACTORS.length

const FACTORS: Array<{
  id: RiskFactorId
  label: string
  tone: "personal" | "home"
  icon: LucideIcon
}> = [
  { id: "credit-history", label: "credit\nhistory", tone: "personal", icon: CircleDollarSign },
  { id: "income", label: "income", tone: "personal", icon: HandCoins },
  { id: "job", label: "job", tone: "personal", icon: BriefcaseBusiness },
  { id: "applicant-shape", label: "shape\n(circle or\nsquare)", tone: "personal", icon: Shapes },
  { id: "savings", label: "savings", tone: "personal", icon: Coins },
  { id: "value-of-home", label: "value of\nhome", tone: "home", icon: Home },
  { id: "nearby-businesses", label: "nearby\nbusinesses", tone: "home", icon: Building2 },
  { id: "neighborhood-shapes", label: "shapes\nliving in\nthe area", tone: "home", icon: Shapes },
  { id: "distance-from-downtown", label: "distance to\ndowntown", tone: "home", icon: MapPinned },
]

const SCALE_POSITIONS = [
  { left: "36.5%", top: "22.5%" },
  { left: "63.5%", top: "22.5%" },
]

function classifyRisk(score: number, factorCount: number): RiskLevel {
  if (factorCount === 0) return "still-desirable"
  const normalizedScore = score / factorCount

  if (normalizedScore >= 2.85) return "hazardous"
  if (normalizedScore >= 1.5) return "declining"
  if (normalizedScore > -2.5) return "still-desirable"
  return "best"
}

function getApplicantRisk(applicant: ApplicantRiskProfile, selectedFactors: RiskFactorId[]) {
  const score = selectedFactors.reduce(
    (total, factorId) => total + applicant.factorScores[factorId],
    0
  )

  return classifyRisk(score, selectedFactors.length)
}

function canApprove(riskLevel: RiskLevel): boolean {
  return riskLevel === "best" || riskLevel === "still-desirable"
}

function approvalMatchesOriginal(
  applicant: ApplicantRiskProfile,
  selectedFactors: RiskFactorId[]
): boolean {
  return (
    canApprove(getApplicantRisk(applicant, selectedFactors)) ===
    shouldApproveApplicant(applicant)
  )
}

function groupApplicantsByRisk(
  applicants: ApplicantRiskProfile[],
  selectedFactors: RiskFactorId[] | null
) {
  const groups: Record<RiskLevel, ApplicantRiskProfile[]> = {
    best: [],
    "still-desirable": [],
    declining: [],
    hazardous: [],
  }

  applicants.forEach((applicant) => {
    const riskLevel = selectedFactors
      ? getApplicantRisk(applicant, selectedFactors)
      : applicant.riskLevel
    groups[riskLevel].push(applicant)
  })

  return groups
}

function createEmptyGroups(): Record<RiskLevel, ApplicantRiskProfile[]> {
  return {
    best: [],
    "still-desirable": [],
    declining: [],
    hazardous: [],
  }
}

function createEmptyApprovalGroups(): Record<ApprovalBucket, ApplicantRiskProfile[]> {
  return {
    approve: [],
    deny: [],
  }
}

function groupApplicantsByApproval(
  applicants: ApplicantRiskProfile[],
  selectedFactors: RiskFactorId[] | null
) {
  const groups = createEmptyApprovalGroups()

  applicants.forEach((applicant) => {
    const approved = selectedFactors
      ? canApprove(getApplicantRisk(applicant, selectedFactors))
      : shouldApproveApplicant(applicant)
    groups[approved ? "approve" : "deny"].push(applicant)
  })

  return groups
}

function getCardPositions(
  side: "left" | "right",
  bucket: ApprovalBucket,
  count: number
): Array<{ left: number; top: number; rotate: number }> {
  const rowTopOffsets: Record<ApprovalBucket, number> = {
    approve: 0,
    deny: 44,
  }

  const rowTop = rowTopOffsets[bucket]
  const rotationBase = side === "left" ? -6 : 6

  if (count <= 0) return []

  const maxLeft = side === "left" ? 332 : 338
  const minLeft = side === "left" ? 18 : 24
  const spread = Math.max(maxLeft - minLeft, 1)
  const tiltOffsets = [-4, 2, -1, 5, -3, 4, -2, 3]

  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1)
    const arcOffset = index % 2 === 0 ? 16 : 0
    const heightOffset = (index % 3) * 24

    return {
      left: Math.round(minLeft + spread * progress),
      top: rowTop + arcOffset + heightOffset,
      rotate: rotationBase + tiltOffsets[index % tiltOffsets.length],
    }
  })
}

function getCharacterSprite(characterType: CharacterType): string {
  return characterType === "yellow" ? "/redlining/yellow idle.png" : "/redlining/blue idle.png"
}

function FactorCircle({
  factorId,
  disabled,
  selected = false,
  highlighted = false,
  onClick,
  onDragStart,
}: {
  factorId: RiskFactorId
  disabled?: boolean
  selected?: boolean
  highlighted?: boolean
  onClick?: () => void
  onDragStart?: (factorId: RiskFactorId) => void
}) {
  const factor = FACTORS.find((item) => item.id === factorId)!
  const backgroundImage =
    factor.tone === "personal" ? "/risk/factor-personal.png" : "/risk/factor-home.png"
  const Icon = factor.icon

  return (
    <button
      type="button"
      draggable={!disabled && Boolean(onDragStart)}
      onDragStart={() => onDragStart?.(factorId)}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-full text-center transition-transform ${
        selected ? "scale-[0.96]" : "hover:-translate-y-0.5"
      } ${highlighted ? "ring-4 ring-[#72d777] ring-offset-2 ring-offset-[#f3ebe3]" : ""} ${
        disabled ? "opacity-35" : ""
      }`}
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        className="object-cover"
        sizes="84px"
        aria-hidden
      />
      <div
        className={`relative z-10 flex flex-col items-center gap-1 whitespace-pre-line px-2 ${
          factor.tone === "personal" ? "text-white" : "text-foreground"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
        <span className="text-[9px] font-semibold leading-[1.02]">{factor.label}</span>
      </div>
    </button>
  )
}

function ApplicationCard({
  applicant,
  position,
}: {
  applicant: ApplicantRiskProfile
  position: { left: number; top: number; rotate: number }
}) {
  return (
    <div
      className="absolute z-0 transition-[z-index] duration-0 hover:z-30"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: `rotate(${position.rotate}deg)`,
      }}
    >
      <div className="relative h-[126px] w-[96px] transition-transform duration-200 hover:-translate-y-6 hover:scale-[1.03] hover:drop-shadow-[0_18px_28px_rgba(0,0,0,0.24)]">
        <Image
          src="/risk/bg-application.png"
          alt=""
          fill
          className="object-contain"
          sizes="96px"
          aria-hidden
        />
        <div className="absolute inset-0 px-2.5 pb-1 pt-4">
          <p className="pl-0.5 text-[15px] font-black tracking-tight text-foreground">
            ${applicant.mortgage.toLocaleString()}
          </p>
          <div className="relative mt-4 h-[44px] w-full">
            <Image
              src={`/redlining/house-${applicant.targetHouse}.png`}
              alt=""
              fill
              className="object-contain"
              sizes="68px"
              aria-hidden
            />
          </div>
          <div className="mt-1.5 flex justify-end">
            <div className="flex flex-col items-center">
              <span className="mb-0.5 rounded-full bg-[#4a4a4a] px-2.5 py-0.5 text-[9px] font-medium leading-none text-white">
                {applicant.name}
              </span>
              <div className="relative h-[40px] w-[32px] shrink-0">
                <Image
                  src={getCharacterSprite(applicant.characterType)}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="32px"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreOverlay({
  side,
  applicantsByApproval,
  className = "",
}: {
  side: "left" | "right"
  applicantsByApproval: Record<ApprovalBucket, ApplicantRiskProfile[]>
  className?: string
}) {
  return (
    <div className={`absolute h-[440px] w-[410px] ${className}`}>
      {APPROVAL_BUCKETS.map((bucket) => (
        <div
          key={bucket}
          className="absolute left-0 w-[410px]"
          style={{ top: bucket === "approve" ? "18px" : "250px" }}
        >
          {applicantsByApproval[bucket].map((applicant, index, list) => (
            <ApplicationCard
              key={applicant.id}
              applicant={applicant}
              position={getCardPositions(side, bucket, list.length)[index]}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function ScaleScene({
  selectedFactors,
  draggingFactorId,
  hasExactCorrectFactors,
  onDropIntoSlot,
  onRemoveFactor,
  onReset,
}: {
  selectedFactors: Array<RiskFactorId | null>
  draggingFactorId: RiskFactorId | null
  hasExactCorrectFactors: boolean
  onDropIntoSlot: (slotIndex: number) => void
  onRemoveFactor: (slotIndex: number) => void
  onReset: () => void
}) {
  return (
    <div className="relative flex h-[360px] w-[320px] flex-col items-center">
      <Image
        src="/risk/risk scale.png"
        alt=""
        fill
        className="object-contain opacity-80"
        sizes="320px"
        aria-hidden
      />
      {SCALE_POSITIONS.map((position, slotIndex) => {
        const factorId = selectedFactors[slotIndex]

        return (
          <button
            key={slotIndex}
            type="button"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDropIntoSlot(slotIndex)}
            onClick={factorId ? () => onRemoveFactor(slotIndex) : undefined}
            className={`absolute h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
              draggingFactorId && !factorId ? "bg-white/15" : ""
            }`}
            style={{ left: position.left, top: position.top }}
            aria-label={factorId ? "Remove factor from scale" : "Drop factor onto scale"}
          >
            {factorId ? (
              <FactorCircle
                factorId={factorId}
                selected
                highlighted={hasExactCorrectFactors && CORRECT_FACTORS.includes(factorId)}
                onClick={() => onRemoveFactor(slotIndex)}
              />
            ) : (
              <Image
                src="/risk/factor-slot.png"
                alt=""
                fill
                className="object-contain opacity-70"
                sizes="84px"
                aria-hidden
              />
            )}
          </button>
        )
      })}
      <button
        type="button"
        onClick={onReset}
        className="absolute bottom-[6px] inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-1.5 text-[12px] font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset factors
      </button>
    </div>
  )
}

export function RiskFactorSimulation() {
  const [selectedFactors, setSelectedFactors] = useState<Array<RiskFactorId | null>>(
    () => Array.from({ length: SCALE_SLOT_COUNT }, () => null)
  )
  const [draggingFactorId, setDraggingFactorId] = useState<RiskFactorId | null>(null)

  const activeFactors = selectedFactors.filter(Boolean) as RiskFactorId[]
  const originalApprovalGroups = useMemo(
    () => groupApplicantsByApproval(BASE_APPLICANTS, null),
    []
  )

  const yourApprovalGroups = useMemo(
    () =>
      activeFactors.length === 0
        ? createEmptyApprovalGroups()
        : groupApplicantsByApproval(BASE_APPLICANTS, activeFactors),
    [activeFactors]
  )

  const matchingCount = useMemo(
    () =>
      activeFactors.length === 0
        ? 0
        :
      BASE_APPLICANTS.filter((applicant) =>
        approvalMatchesOriginal(applicant, activeFactors)
      ).length,
    [activeFactors]
  )
  const hasExactCorrectFactors = useMemo(() => {
    if (activeFactors.length !== CORRECT_FACTORS.length) return false
    return CORRECT_FACTORS.every((factorId) => activeFactors.includes(factorId))
  }, [activeFactors])

  const addFactor = (factorId: RiskFactorId) => {
    setSelectedFactors((current) => {
      if (current.includes(factorId)) return current
      const firstEmptySlot = current.findIndex((slot) => slot === null)
      if (firstEmptySlot === -1) return current
      const next = [...current]
      next[firstEmptySlot] = factorId
      return next
    })
  }

  const removeFactor = (slotIndex: number) => {
    setSelectedFactors((current) =>
      current.map((slot, index) => (index === slotIndex ? null : slot))
    )
  }

  const dropFactorIntoSlot = (slotIndex: number) => {
    if (!draggingFactorId) return

    setSelectedFactors((current) => {
      const next = current.map((slot) => (slot === draggingFactorId ? null : slot))
      next[slotIndex] = draggingFactorId
      return next
    })
    setDraggingFactorId(null)
  }

  const resetFactors = () => {
    setSelectedFactors(Array.from({ length: SCALE_SLOT_COUNT }, () => null))
    setDraggingFactorId(null)
  }

  return (
    <section className="my-8 w-screen overflow-hidden md:ml-[calc(50%-50vw)] md:mr-[calc(50%-50vw)]">
      <div className="relative min-h-[95vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#f3ebe3]" />
        <img
          src="/risk/bg-risk.png"
          alt=""
          className="absolute left-0 top-1/2 w-full -translate-y-1/2"
          aria-hidden
        />

        <div className="absolute left-1/2 top-[24px] z-10 -translate-x-1/2">
          <p className="mb-2 text-center text-[14px] font-semibold text-foreground">
            Personal factors
          </p>
          <div className="flex gap-3">
            {FACTORS.filter((factor) => factor.tone === "personal").map((factor) => (
              <FactorCircle
                key={factor.id}
                factorId={factor.id}
                disabled={activeFactors.includes(factor.id)}
                onClick={() => addFactor(factor.id)}
                onDragStart={setDraggingFactorId}
              />
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 top-[156px] z-10 -translate-x-1/2">
          <p className="mb-2 text-center text-[14px] font-semibold text-foreground">
            Home/neighborhood factors
          </p>
          <div className="flex gap-3">
            {FACTORS.filter((factor) => factor.tone === "home").map((factor) => (
              <FactorCircle
                key={factor.id}
                factorId={factor.id}
                disabled={activeFactors.includes(factor.id)}
                onClick={() => addFactor(factor.id)}
                onDragStart={setDraggingFactorId}
              />
            ))}
          </div>
        </div>

        <div className="absolute left-[28px] top-[164px] z-10 w-[410px]">
          <h3 className="distressed-text text-[36px] leading-none text-foreground">
            Original Scores
          </h3>
          <ScoreOverlay
            side="left"
            applicantsByApproval={originalApprovalGroups}
            className="left-0 top-0"
          />
          <div className="absolute left-[-28px] top-[232px] w-[438px]">
            <div className="h-[3px] w-full bg-red-500" />
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-red-500" />
            <div className="absolute right-[6px] top-[-28px] flex items-center gap-1 text-[15px] font-semibold text-foreground">
              <Check className="h-4 w-4" strokeWidth={3} />
              <span>APPROVE</span>
            </div>
            <div className="absolute right-[34px] top-[6px] flex items-center gap-1 text-[15px] font-semibold text-red-600">
              <X className="h-4 w-4" strokeWidth={3} />
              <span>DENY</span>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-[346px] z-20 -translate-x-1/2">
          <ScaleScene
            selectedFactors={selectedFactors}
            draggingFactorId={draggingFactorId}
            hasExactCorrectFactors={hasExactCorrectFactors}
            onDropIntoSlot={dropFactorIntoSlot}
            onRemoveFactor={removeFactor}
            onReset={resetFactors}
          />
        </div>

        <div className="absolute right-[28px] top-[164px] z-10 w-[410px]">
          <h3 className="distressed-text text-right text-[36px] leading-none text-foreground">
            Your Scores
          </h3>
          <ScoreOverlay
            side="right"
            applicantsByApproval={yourApprovalGroups}
            className="left-0 top-0"
          />
          <div className="absolute left-0 top-[232px] w-[438px]">
            <div className="h-[3px] w-full bg-red-500" />
            <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-red-500" />
            <div className="absolute left-[8px] top-[-28px] flex items-center gap-1 text-[15px] font-semibold text-foreground">
              <Check className="h-4 w-4" strokeWidth={3} />
              <span>APPROVE</span>
            </div>
            <div className="absolute left-[38px] top-[6px] flex items-center gap-1 text-[15px] font-semibold text-red-600">
              <X className="h-4 w-4" strokeWidth={3} />
              <span>DENY</span>
            </div>
          </div>
        </div>

        <div
          className={`absolute right-6 top-6 z-20 rounded-full px-4 py-2 text-[12px] font-medium shadow-sm backdrop-blur-sm ${
            matchingCount === BASE_APPLICANTS.length
              ? "bg-white/95 text-[#2f9e44] ring-2 ring-[#72d777]"
              : "bg-white/90 text-foreground"
          }`}
        >
          {matchingCount} of {BASE_APPLICANTS.length} match the original decisions
        </div>

        {hasExactCorrectFactors && (
          <div className="absolute left-1/2 top-[255px] z-20 -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-[16px] font-semibold text-[#2f9e44] shadow-sm ring-2 ring-[#72d777] backdrop-blur-sm">
            Scores match!
          </div>
        )}

        <div className="absolute left-6 top-6 z-10 max-w-[280px] rounded-lg bg-white/80 p-4 text-foreground shadow-sm backdrop-blur-sm">
          <p className="text-sm">
            Drag and drop factors to weigh. First, consider what risk factors you think are fair.
            Then, try to replicate the original risk scores. Hint: see any trends?
          </p>
        </div>
      </div>
    </section>
  )
}
