"use client";

import Image from "next/image";
import { Clock, Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CharacterType } from "./redlining-data";

const MIN_YEAR = 1;
const MAX_YEAR = 40;
const BAR_TRACK_HEIGHT = 360;
const BAR_WIDTH = 22;
const EQUITY_OVERFLOW_OPACITY = 0.42;
const BAR_END_RADIUS = "rounded-b-full rounded-t-none";

const PAID_COLOR = "#00CB4C";
const EQUITY_COLOR = "#6C36FF";

/** 1965 dollars — $20,000 mortgage with principal paid shown in bars */
const PURCHASE_YEAR = 1965;
const MORTGAGE_PRINCIPAL = 20_000;
const MONTHLY_PAYMENT = 67;
const ANNUAL_PAYMENT = MONTHLY_PAYMENT * 12;
const MORTGAGE_TERM_YEARS = 30;
const TOTAL_PAID_AT_TERM = ANNUAL_PAYMENT * MORTGAGE_TERM_YEARS;
const HOME_VALUE_AT_PURCHASE = 20_000;
const ANNUAL_HOME_APPRECIATION = 0.04;

const ADULT_WIDTH = 52;
const ADULT_HEIGHT = 68;
const CHILD_WIDTH = 32;
const CHILD_HEIGHT = 42;

const EVICTION_YEAR = 20;
const EQUITY_ACCELERATION_START_YEAR = 20;

const PAID_TOOLTIP = `Total paid toward the home.`;
const EQUITY_TOOLTIP =
  "Value owned in the home, or stake if sold today, including appreciation.";

type ColumnDeltas = { paid: number | null; equity: number | null };
type YearDeltas = { left: ColumnDeltas; right: ColumnDeltas };

function getYearsOfPayments(year: number): number {
  return Math.min(Math.max(year, 0), MORTGAGE_TERM_YEARS);
}

function getCumulativePaid(year: number): number {
  return getYearsOfPayments(year) * ANNUAL_PAYMENT;
}

function getRemainingPrincipal(year: number): number {
  const principalPaid =
    (getYearsOfPayments(year) / MORTGAGE_TERM_YEARS) * MORTGAGE_PRINCIPAL;
  return Math.max(0, MORTGAGE_PRINCIPAL - principalPaid);
}

function getHomeValue(year: number): number {
  return (
    HOME_VALUE_AT_PURCHASE *
    (1 + ANNUAL_HOME_APPRECIATION) ** Math.max(year - 1, 0)
  );
}

function getPaidProgress(year: number): number {
  return getCumulativePaid(year) / TOTAL_PAID_AT_TERM;
}

function getMortgageEquityDollars(year: number): number {
  const paid = getPaidDollars(year);
  if (year <= EQUITY_ACCELERATION_START_YEAR) return paid;

  const yearsPastAcceleration = year - EQUITY_ACCELERATION_START_YEAR;
  const appreciationMultiplier =
    (1 + ANNUAL_HOME_APPRECIATION) ** yearsPastAcceleration - 1;
  const accelerationBonus =
    HOME_VALUE_AT_PURCHASE *
    appreciationMultiplier *
    (0.55 + yearsPastAcceleration / 35);

  return Math.round(paid + accelerationBonus);
}

function getMortgageEquityProgress(year: number): number {
  return getMortgageEquityDollars(year) / TOTAL_PAID_AT_TERM;
}

function getProgressScaleMax(): number {
  return getPaidProgress(MORTGAGE_TERM_YEARS);
}

function progressToHeight(progress: number): number {
  return (progress / getProgressScaleMax()) * BAR_TRACK_HEIGHT;
}

function getContractEquityProgress(_year: number): number {
  return 0;
}

function getPaidDollars(year: number): number {
  return getCumulativePaid(year);
}

function getContractEquityDollars(_year: number): number {
  return 0;
}

/** Contract for deed: payments stop after eviction (missed payment at year 30). */
function getContractPaymentYears(year: number): number {
  if (year >= EVICTION_YEAR) return EVICTION_YEAR - 1;
  return Math.min(Math.max(year, 0), MORTGAGE_TERM_YEARS);
}

function getContractPaidDollars(year: number): number {
  return getContractPaymentYears(year) * ANNUAL_PAYMENT;
}

function getContractPaidProgress(year: number): number {
  return getContractPaidDollars(year) / TOTAL_PAID_AT_TERM;
}

function formatMoney1965(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function getFamilySize(year: number): number {
  if (year <= 6) return 2;
  if (year <= 12) return 3;
  if (year <= 20) return 4;
  return 4;
}

function getCharacterSprite(characterType: CharacterType): string {
  return characterType === "yellow"
    ? "/redlining/yellow idle.png"
    : "/redlining/blue idle.png";
}

function formatDeltaCurrency(amount: number): string {
  const sign = amount >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US")}`;
}

function BarLabelTooltip({ description }: { description: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex rounded-full text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          aria-label="More information"
        >
          <Info className="h-3.5 w-3" strokeWidth={2.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[180px] text-left">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

function DeltaFloat({
  amount,
  color,
  fillHeight,
}: {
  amount: number;
  color: string;
  fillHeight: number;
}) {
  return (
    <span
      className="homeownership-delta-float pointer-events-none absolute left-[calc(100%+10px)] z-20 whitespace-nowrap text-sm font-bold tabular-nums"
      style={{
        bottom: Math.max(12, fillHeight - 4),
        color,
      }}
    >
      {formatDeltaCurrency(amount)}
    </span>
  );
}

function ProgressColumn({
  label,
  tooltip,
  amountText,
  value,
  fillColor,
  deltaAmount,
  deltaColor,
  allowEquityOverflow = false,
  paidReference,
}: {
  label: string;
  tooltip: string;
  amountText: string;
  value: number;
  fillColor: string;
  deltaAmount: number | null;
  deltaColor: string;
  allowEquityOverflow?: boolean;
  paidReference?: number;
}) {
  const fillHeight = progressToHeight(value);
  const overflowHeight = allowEquityOverflow
    ? Math.max(0, fillHeight - BAR_TRACK_HEIGHT)
    : 0;
  const inTrackFillHeight =
    overflowHeight > 0
      ? BAR_TRACK_HEIGHT
      : Math.min(fillHeight, BAR_TRACK_HEIGHT);

  const paidHeight =
    allowEquityOverflow && paidReference !== undefined
      ? progressToHeight(paidReference)
      : 0;
  const showPaidMarker =
    allowEquityOverflow &&
    value > 0 &&
    paidReference !== undefined &&
    paidReference > 0 &&
    fillHeight > paidHeight;

  const deltaAnchorHeight = allowEquityOverflow
    ? fillHeight
    : Math.min(fillHeight, BAR_TRACK_HEIGHT);

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            {label}
          </span>
          <BarLabelTooltip description={tooltip} />
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-foreground/85">
          {amountText}
        </span>
      </div>
      <div
        className="relative overflow-visible"
        style={{ width: BAR_WIDTH, height: BAR_TRACK_HEIGHT }}
      >
        {overflowHeight > 0 && (
          <div
            className="absolute left-0 z-[5] w-full rounded-none transition-[height] duration-300 ease-out"
            style={{
              height: overflowHeight,
              bottom: "100%",
              backgroundColor: fillColor,
              opacity: EQUITY_OVERFLOW_OPACITY,
            }}
          />
        )}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-0 border border-white/70 bg-white/90 shadow-sm",
            BAR_END_RADIUS
          )}
        />
        {value > 0 && inTrackFillHeight > 0 && (
          <div
            className={cn(
              "absolute bottom-0 left-0 z-10 w-full overflow-hidden",
              BAR_END_RADIUS
            )}
            style={{ height: BAR_TRACK_HEIGHT }}
          >
            <div
              className={cn(
                "absolute bottom-0 left-0 w-full transition-[height] duration-300 ease-out",
                BAR_END_RADIUS
              )}
              style={{
                height: inTrackFillHeight,
                backgroundColor: fillColor,
              }}
            />
          </div>
        )}
        {showPaidMarker && (
          <div
            className="pointer-events-none absolute left-[-3px] right-[-3px] z-20 border-t border-dashed border-foreground/45"
            style={{ bottom: paidHeight }}
            aria-hidden
          />
        )}
        {deltaAmount !== null && deltaAmount !== 0 && (
          <DeltaFloat
            amount={deltaAmount}
            color={deltaColor}
            fillHeight={deltaAnchorHeight}
          />
        )}
      </div>
    </div>
  );
}

function SideBars({
  paid,
  equity,
  paidDollars,
  equityDollars,
  deltas,
  showEquityOverflow = false,
}: {
  paid: number;
  equity: number;
  paidDollars: number;
  equityDollars: number;
  deltas: ColumnDeltas;
  showEquityOverflow?: boolean;
}) {
  return (
    <div className="flex gap-5 overflow-visible">
      <ProgressColumn
        label="$ Paid"
        tooltip={PAID_TOOLTIP}
        amountText={formatMoney1965(paidDollars)}
        value={paid}
        fillColor={PAID_COLOR}
        deltaAmount={deltas.paid}
        deltaColor={PAID_COLOR}
      />
      <ProgressColumn
        label="Equity"
        tooltip={EQUITY_TOOLTIP}
        amountText={formatMoney1965(equityDollars)}
        value={equity}
        fillColor={EQUITY_COLOR}
        deltaAmount={deltas.equity}
        deltaColor={EQUITY_COLOR}
        allowEquityOverflow={showEquityOverflow}
        paidReference={showEquityOverflow ? paid : undefined}
      />
    </div>
  );
}

function FamilyLineup({
  characterType,
  year,
  side,
}: {
  characterType: CharacterType;
  year: number;
  side: "left" | "right";
}) {
  const evicted = side === "left" && year >= EVICTION_YEAR;
  const familySize = evicted
    ? getFamilySize(EVICTION_YEAR - 1)
    : getFamilySize(year);
  const adultCount = Math.min(2, familySize);
  const childCount = Math.max(0, familySize - adultCount);
  const sprite = getCharacterSprite(characterType);

  const members = [
    ...Array.from({ length: adultCount }, () => "adult" as const),
    ...Array.from({ length: childCount }, () => "child" as const),
  ];

  return (
    <div
      className={cn(
        "absolute bottom-[22%] z-[5] flex items-end justify-center transition-transform duration-700 ease-in-out",
        side === "left"
          ? "left-[30%] -translate-x-1/2"
          : "left-[65%] -translate-x-1/2",
        evicted && "-translate-x-[280%] opacity-0"
      )}
      aria-hidden
    >
      {members.map((role, index) => {
        const isChild = role === "child";
        const width = isChild ? CHILD_WIDTH : ADULT_WIDTH;
        const height = isChild ? CHILD_HEIGHT : ADULT_HEIGHT;

        return (
          <Image
            key={`${role}-${index}`}
            src={sprite}
            alt=""
            width={width}
            height={height}
            className={cn(
              "origin-bottom object-contain drop-shadow-sm transition-all duration-300 ease-out",
              index > 0 && "-ml-3"
            )}
            style={{ width, height, zIndex: index }}
          />
        );
      })}
    </div>
  );
}

function computeYearDeltas(previousYear: number, nextYear: number): YearDeltas {
  const leftPaidDelta =
    getContractPaidDollars(nextYear) - getContractPaidDollars(previousYear);
  const rightPaidDelta =
    getPaidDollars(nextYear) - getPaidDollars(previousYear);
  const contractEquityDelta =
    getContractEquityDollars(nextYear) - getContractEquityDollars(previousYear);
  const mortgageEquityDelta =
    getMortgageEquityDollars(nextYear) - getMortgageEquityDollars(previousYear);

  return {
    left: {
      paid: leftPaidDelta !== 0 ? leftPaidDelta : null,
      equity: contractEquityDelta !== 0 ? contractEquityDelta : null,
    },
    right: {
      paid: rightPaidDelta !== 0 ? rightPaidDelta : null,
      equity: mortgageEquityDelta !== 0 ? mortgageEquityDelta : null,
    },
  };
}

export function HomeownershipSimulation() {
  const [year, setYear] = useState(MIN_YEAR);
  const [yearDeltas, setYearDeltas] = useState<YearDeltas | null>(null);
  const previousYearRef = useRef(MIN_YEAR);

  const mortgagePaid = useMemo(() => getPaidProgress(year), [year]);
  const contractPaid = useMemo(() => getContractPaidProgress(year), [year]);
  const mortgagePaidDollars = useMemo(() => getPaidDollars(year), [year]);
  const contractPaidDollars = useMemo(
    () => getContractPaidDollars(year),
    [year]
  );

  const mortgageEquity = useMemo(() => getMortgageEquityProgress(year), [year]);
  const mortgageEquityDollars = useMemo(
    () => getMortgageEquityDollars(year),
    [year]
  );
  const contractEquity = useMemo(() => getContractEquityProgress(year), [year]);
  const contractEquityDollars = useMemo(
    () => getContractEquityDollars(year),
    [year]
  );

  useEffect(() => {
    const previousYear = previousYearRef.current;
    if (previousYear === year) return;

    setYearDeltas(computeYearDeltas(previousYear, year));
    previousYearRef.current = year;

    const timeout = window.setTimeout(() => setYearDeltas(null), 1200);
    return () => window.clearTimeout(timeout);
  }, [year]);

  const leftDeltas = yearDeltas?.left ?? { paid: null, equity: null };
  const rightDeltas = yearDeltas?.right ?? { paid: null, equity: null };

  return (
    <TooltipProvider delayDuration={150}>
      <section className="my-8 w-screen overflow-x-hidden overflow-y-visible md:ml-[calc(50%-50vw)] md:mr-[calc(50%-50vw)]">
        <div className="relative min-h-[min(95vh,820px)] w-full overflow-x-hidden overflow-y-visible">
          <div className="absolute inset-0 bg-[#e8f0d8]" />

          <div className="absolute inset-0">
            {/* Base image */}
            <img
              src="/homeownership/bg-homeownership.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
              aria-hidden
            />

            {/* Grayscale left half */}
            {year >= EVICTION_YEAR && (
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                <img
                  src="/homeownership/bg-homeownership.png"
                  alt=""
                  className="absolute inset-0 h-full w-full min-w-[100vw] object-cover object-[center_42%] grayscale brightness-60"
                  aria-hidden
                />
              </div>
            )}

            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-0 border-l border-dashed border-foreground/35"
              aria-hidden
            />

            <div className="absolute">{/* rest of your content */}</div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-0 border-l border-dashed border-foreground/35"
            aria-hidden
          />

          <div className="absolute inset-x-0 top-[4%] z-10 grid grid-cols-2 items-start">
            <h3 className="distressed-text pl-[5%] text-left text-[clamp(1rem,2vw,1.7em)] leading-none text-foreground">
              Contract for Deed
            </h3>
            <h3 className="distressed-text pr-[5%] text-right text-[clamp(1rem,2vw,1.7em)] leading-none text-foreground">
              Mortgage
            </h3>
          </div>

          <div className="absolute left-1/2 top-[4%] z-20 -translate-x-1/2">
            <span className="rounded-full bg-foreground px-5 py-1.5 text-sm font-semibold text-background shadow-md">
              Year {year}
            </span>
          </div>

          {year >= EVICTION_YEAR && (
            <div className="absolute left-1/2 top-[12%] z-20 -translate-x-1/2 rounded-lg bg-white/90 px-3 py-2 text-center text-sm text-foreground shadow-sm max-w-[300px]">
              The family paying off their house with a contract for deed missed
              one payment and was evicted, losing their home.
            </div>
          )}

          {year == 1 && (
            <div className="absolute left-1/2 top-[12%] z-20 -translate-x-1/2 rounded-lg bg-white/90 px-3 py-2 text-center text-sm text-foreground shadow-sm max-w-[300px]">
              Families have moved in! Start moving the time slider to see what
              changes over the next 30 years.
            </div>
          )}

          {year > 8 && year < 15 && (
            <div className="absolute left-1/2 top-[12%] z-20 -translate-x-1/2 rounded-lg bg-white/90 px-3 py-2 text-center text-sm text-foreground shadow-sm max-w-[300px]">
              Both families have been making payments on time, but since the
              family with a contract for deed doesn't own their home yet, they
              don't have any equity yet.
            </div>
          )}

          {year > 25 && (
            <div className="absolute left-1/2 top-[12%] z-20 -translate-x-1/2 rounded-lg bg-white/90 px-3 py-2 text-center text-sm text-foreground shadow-sm max-w-[300px]">
              Home values are rising quickly! Because the mortgage family owns
              their home, the value of their investment is growing too.
            </div>
          )}

          <FamilyLineup characterType="yellow" year={year} side="left" />
          <FamilyLineup characterType="blue" year={year} side="right" />

          <div className="absolute left-[3%] top-[16%] z-10">
            <SideBars
              paid={contractPaid}
              equity={contractEquity}
              paidDollars={contractPaidDollars}
              equityDollars={contractEquityDollars}
              deltas={leftDeltas}
            />
          </div>

          <div className="absolute right-[3%] top-[16%] z-10 overflow-visible">
            <SideBars
              paid={mortgagePaid}
              equity={mortgageEquity}
              paidDollars={mortgagePaidDollars}
              equityDollars={mortgageEquityDollars}
              deltas={rightDeltas}
              showEquityOverflow
            />
          </div>

          <div className="absolute inset-x-[6%] bottom-[6%] z-20 flex items-center gap-4">
            <label
              htmlFor="homeownership-time"
              className="flex shrink-0 items-center gap-2 text-sm font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
            >
              <Clock className="h-4 w-4" strokeWidth={2.5} aria-hidden />
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
              className="homeownership-time-slider min-w-0 flex-1 cursor-pointer appearance-none"
              aria-valuemin={MIN_YEAR}
              aria-valuemax={MAX_YEAR}
              aria-valuenow={year}
              aria-label="Years since purchase"
            />
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
