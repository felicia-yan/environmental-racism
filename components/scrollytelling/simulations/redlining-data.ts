"use client"

export type RiskLevel = "hazardous" | "declining" | "still-desirable" | "best"
export type CharacterType = "blue" | "yellow"
export type ApplicantShape = "circle" | "square"

export type RiskFactorId =
  | "credit-history"
  | "applicant-shape"
  | "family-size"
  | "job"
  | "income"
  | "savings"
  | "value-of-home"
  | "nearby-businesses"
  | "neighborhood-shapes"
  | "distance-from-downtown"

export interface ApplicantRiskProfile {
  id: number
  name: string
  mortgage: number
  riskLevel: RiskLevel
  characterType: CharacterType
  targetHouse: number
  applicantShape: ApplicantShape
  factorScores: Record<RiskFactorId, number>
}

/** Redlined lending: only blue circles on green houses (6–10) are approved. */
export function shouldApproveApplicant(
  applicant: Pick<ApplicantRiskProfile, "characterType" | "applicantShape" | "targetHouse">
): boolean {
  return (
    applicant.characterType === "blue" &&
    applicant.applicantShape === "circle" &&
    applicant.targetHouse >= 6 &&
    applicant.targetHouse <= 10
  )
}

export const BASE_APPLICANTS: ApplicantRiskProfile[] = [
  {
    id: 1,
    name: "David",
    mortgage: 18200,
    riskLevel: "hazardous",
    characterType: "yellow",
    targetHouse: 1,
    applicantShape: "square",
    factorScores: {
      "credit-history": 1,
      "applicant-shape": 4,
      "family-size": 0,
      job: 1,
      income: 1,
      savings: 1,
      "value-of-home": 1,
      "nearby-businesses": 1,
      "neighborhood-shapes": 8,
      "distance-from-downtown": -1,
    },
  },
  {
    id: 2,
    name: "James",
    mortgage: 33800,
    riskLevel: "hazardous",
    characterType: "yellow",
    targetHouse: 7,
    applicantShape: "square",
    factorScores: {
      "credit-history": 2,
      "applicant-shape": 4,
      "family-size": 1,
      job: 2,
      income: 2,
      savings: 2,
      "value-of-home": 5,
      "nearby-businesses": 1,
      "neighborhood-shapes": 0,
      "distance-from-downtown": 0,
    },
  },
  {
    id: 3,
    name: "Robert",
    mortgage: 21400,
    riskLevel: "hazardous",
    characterType: "yellow",
    targetHouse: 3,
    applicantShape: "square",
    factorScores: {
      "credit-history": 0,
      "applicant-shape": 4,
      "family-size": -1,
      job: 1,
      income: 1,
      savings: 1,
      "value-of-home": 1,
      "nearby-businesses": 2,
      "neighborhood-shapes": 8,
      "distance-from-downtown": -1,
    },
  },
  {
    id: 4,
    name: "Michael",
    mortgage: 36100,
    riskLevel: "hazardous",
    characterType: "yellow",
    targetHouse: 9,
    applicantShape: "square",
    factorScores: {
      "credit-history": 1,
      "applicant-shape": 4,
      "family-size": 1,
      job: 1,
      income: 1,
      savings: 1,
      "value-of-home": 5,
      "nearby-businesses": 1,
      "neighborhood-shapes": 0,
      "distance-from-downtown": 1,
    },
  },
  {
    id: 5,
    name: "Kevin",
    mortgage: 19700,
    riskLevel: "declining",
    characterType: "blue",
    targetHouse: 5,
    applicantShape: "circle",
    factorScores: {
      "credit-history": -1,
      "applicant-shape": -4,
      "family-size": 2,
      job: 0,
      income: 0,
      savings: 1,
      "value-of-home": 1,
      "nearby-businesses": 2,
      "neighborhood-shapes": 8,
      "distance-from-downtown": 0,
    },
  },
  {
    id: 6,
    name: "Sasha",
    mortgage: 28400,
    riskLevel: "best",
    characterType: "blue",
    targetHouse: 6,
    applicantShape: "circle",
    factorScores: {
      "credit-history": 1,
      "applicant-shape": -4,
      "family-size": 0,
      job: 0,
      income: 1,
      savings: 1,
      "value-of-home": -4,
      "nearby-businesses": 0,
      "neighborhood-shapes": 0,
      "distance-from-downtown": 0,
    },
  },
  {
    id: 7,
    name: "Alice",
    mortgage: 30700,
    riskLevel: "still-desirable",
    characterType: "blue",
    targetHouse: 8,
    applicantShape: "circle",
    factorScores: {
      "credit-history": 0,
      "applicant-shape": -4,
      "family-size": 1,
      job: 0,
      income: 0,
      savings: 0,
      "value-of-home": 0,
      "nearby-businesses": -1,
      "neighborhood-shapes": 0,
      "distance-from-downtown": 1,
    },
  },
  {
    id: 8,
    name: "Elena",
    mortgage: 32600,
    riskLevel: "best",
    characterType: "blue",
    targetHouse: 10,
    applicantShape: "circle",
    factorScores: {
      "credit-history": 2,
      "applicant-shape": -4,
      "family-size": -1,
      job: -1,
      income: -1,
      savings: -1,
      "value-of-home": -4,
      "nearby-businesses": -1,
      "neighborhood-shapes": 0,
      "distance-from-downtown": -1,
    },
  },
  {
    id: 9,
    name: "Felicia",
    mortgage: 29500,
    riskLevel: "still-desirable",
    characterType: "blue",
    targetHouse: 7,
    applicantShape: "circle",
    factorScores: {
      "credit-history": -1,
      "applicant-shape": -4,
      "family-size": 0,
      job: 1,
      income: 1,
      savings: 0,
      "value-of-home": 0,
      "nearby-businesses": -2,
      "neighborhood-shapes": 0,
      "distance-from-downtown": 1,
    },
  },
  {
    id: 10,
    name: "Jennifer",
    mortgage: 27400,
    riskLevel: "best",
    characterType: "blue",
    targetHouse: 9,
    applicantShape: "circle",
    factorScores: {
      "credit-history": 1,
      "applicant-shape": -4,
      "family-size": -1,
      job: 0,
      income: 0,
      savings: -1,
      "value-of-home": -4,
      "nearby-businesses": -1,
      "neighborhood-shapes": 0,
      "distance-from-downtown": 0,
    },
  },
  {
    id: 11,
    name: "Marcus",
    mortgage: 35200,
    riskLevel: "hazardous",
    characterType: "yellow",
    targetHouse: 2,
    applicantShape: "square",
    factorScores: {
      "credit-history": 1,
      "applicant-shape": 4,
      "family-size": 0,
      job: 1,
      income: 1,
      savings: 2,
      "value-of-home": 5,
      "nearby-businesses": 1,
      "neighborhood-shapes": 8,
      "distance-from-downtown": 0,
    },
  },
  {
    id: 12,
    name: "Nina",
    mortgage: 30100,
    riskLevel: "declining",
    characterType: "blue",
    targetHouse: 4,
    applicantShape: "circle",
    factorScores: {
      "credit-history": 0,
      "applicant-shape": -4,
      "family-size": 1,
      job: 0,
      income: 0,
      savings: 1,
      "value-of-home": 1,
      "nearby-businesses": -1,
      "neighborhood-shapes": 8,
      "distance-from-downtown": 0,
    },
  },
]
