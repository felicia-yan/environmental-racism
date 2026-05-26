"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import type { CharacterType } from "./redlining-data"

const MIN_YEAR = 1
const MAX_YEAR = 40
const BAR_TRACK_HEIGHT = 220
const MAX_BAR_SCALE = 1.15

const ADULT_WIDTH = 52
const ADULT_HEIGHT = 68
const CHILD_WIDTH = 32
const CHILD_HEIGHT = 42

function getPaidProgress(year: number): number {
  const t = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)
  return 0.55 + t * 0.45
}

function getMortgageEquityProgress(year: number): number {
  const paid = getPaidProgress(year)
  const appreciation = 0.25 + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 0.32
  return Math.min(MAX_BAR_SCALE, paid + appreciation)
}

function getContractEquityProgress(_year: number): number {
  return 0
}

function getFamilySize(year: number): number {
  if (year <= 6) return 2
  if (year <= 12) return 3
  if (year <= 20) return 4
  return 4
}

function getCharacterSprite(characterType: CharacterType): string {
  return characterType === "yellow"
    ? "/redlining/yellow idle.png"
    : "/redlining/blue idle.png"
}

function barHeight(value: number): number {
  return (value / MAX_BAR_SCALE) * BAR_TRACK_HEIGHT
}

function ProgressColumn({
  label,
  value,
  fillClassName,
  align,
}: {
  label: string
  value: number
  fillClassName: string
  align: "left" | "right"
}) {
  const fillHeight = barHeight(value)

  return (
    <div
      className={`flex flex-col items-center gap-2 ${
        align === "right" ? "items-end" : "items-start"
      }`}
    >
      <span className="text-[13px] font-semibold tracking-tight text-foreground">
        {label}
      </span>
      <div
        className="relative w-[18px] overflow-hidden rounded-sm border border-foreground/20 bg-white/90"
        style={{ height: BAR_TRACK_HEIGHT }}
      >
        <div
          className={`absolute bottom-0 left-0 w-full transition-[height] duration-300 ease-out ${fillClassName}`}
          style={{ height: fillHeight }}
        />
      </div>
    </div>
  )
}

function SideBars({
  paid,
  equity,
  equityFillClassName,
  align,
}: {
  paid: number
  equity: number
  equityFillClassName: string
  align: "left" | "right"
}) {
  return (
    <div
      className={`flex gap-4 ${align === "right" ? "flex-row-reverse" : "flex-row"}`}
    >
      <ProgressColumn
        label="$ Paid"
        value={paid}
        fillClassName="bg-[#2d6a4f]"
        align={align}
      />
      <ProgressColumn
        label="Equity"
        value={equity}
        fillClassName={equityFillClassName}
        align={align}
      />
    </div>
  )
}

function FamilyLineup({
  characterType,
  year,
  side,
}: {
  characterType: CharacterType
  year: number
  side: "left" | "right"
}) {
  const familySize = getFamilySize(year)
  const adultCount = Math.min(2, familySize)
  const childCount = Math.max(0, familySize - adultCount)
  const sprite = getCharacterSprite(characterType)

  const members = [
    ...Array.from({ length: adultCount }, () => "adult" as const),
    ...Array.from({ length: childCount }, () => "child" as const),
  ]

  return (
    <div
      className={`absolute bottom-[22%] z-[5] flex items-end justify-center ${
        side === "left" ? "left-[30%] -translate-x-1/2" : "left-[65%] -translate-x-1/2"
      }`}
      aria-hidden
    >
      {members.map((role, index) => {
        const isChild = role === "child"
        const width = isChild ? CHILD_WIDTH : ADULT_WIDTH
        const height = isChild ? CHILD_HEIGHT : ADULT_HEIGHT

        return (
          <Image
            key={`${role}-${index}`}
            src={sprite}
            alt=""
            width={width}
            height={height}
            className={`origin-bottom object-contain drop-shadow-sm transition-all duration-300 ease-out ${
              index > 0 ? "-ml-3" : ""
            }`}
            style={{
              width,
              height,
              zIndex: index,
            }}
          />
        )
      })}
    </div>
  )
}

export function HomeownershipSimulation() {
  const [year, setYear] = useState(MIN_YEAR)

  const paid = useMemo(() => getPaidProgress(year), [year])
  const mortgageEquity = useMemo(() => getMortgageEquityProgress(year), [year])
  const contractEquity = useMemo(() => getContractEquityProgress(year), [year])
  const mortgageEquityExceedsPaid = mortgageEquity > paid

  return (
    <section className="my-8 w-screen overflow-hidden md:ml-[calc(50%-50vw)] md:mr-[calc(50%-50vw)]">
      <div className="relative min-h-[min(95vh,820px)] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#e8f0d8]" />

        <img
          src="/homeownership/bg-homeownership.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-0 border-l border-dashed border-foreground/35"
          aria-hidden
        />

        <div className="absolute inset-x-0 top-[4%] z-10 grid grid-cols-2 items-start">
          <h3 className="distressed-text pl-[5%] text-left text-[clamp(1rem,2.0vw,1.7em)] leading-none text-foreground">
            Contract for Deed
          </h3>
          <h3 className="distressed-text pr-[5%] text-right text-[clamp(1rem,2.0vw,1.7em)] leading-none text-foreground">
            Mortgage
          </h3>
        </div>

        <div className="absolute left-1/2 top-[4%] z-20 -translate-x-1/2">
          <span className="rounded-full bg-foreground px-5 py-1.5 text-sm font-semibold text-background shadow-md">
            Year {year}
          </span>
        </div>

        <FamilyLineup characterType="yellow" year={year} side="left" />
        <FamilyLineup characterType="blue" year={year} side="right" />

        <div className="absolute left-[3%] top-[18%] z-10">
          <SideBars
            paid={paid}
            equity={contractEquity}
            equityFillClassName="bg-transparent"
            align="left"
          />
        </div>

        <div className="absolute right-[3%] top-[18%] z-10">
          <SideBars
            paid={paid}
            equity={mortgageEquity}
            equityFillClassName="bg-foreground"
            align="right"
          />
        </div>

        {/* {mortgageEquityExceedsPaid && (
          <p className="absolute left-1/2 top-[13%] z-10 max-w-[280px] -translate-x-1/2 rounded-lg bg-white/85 px-4 py-2 text-center text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            Home value grew — mortgage equity can exceed what you&apos;ve paid
          </p>
        )} */}

        <div className="absolute inset-x-[6%] bottom-[6%] z-20">
          <label
            htmlFor="homeownership-time"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Time
          </label>
          <input
            id="homeownership-time"
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="homeownership-time-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground"
            aria-valuemin={MIN_YEAR}
            aria-valuemax={MAX_YEAR}
            aria-valuenow={year}
            aria-label="Years since purchase"
          />
        </div>
      </div>
    </section>
  )
}
