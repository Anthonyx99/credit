export interface InterestInput {
  principal: number
  durationMonths: number
  annualRate: number
  monthlyAmount: number
  placementRate: number
  placementCap: number
  horizonMonths: number
}

export interface InterestMonthRow {
  month: number
  year: number
  monthOfYear: number
  repayBalance: number
  repayPlacement: number
  repayNetWorth: number
  investBalance: number
  investPlacement: number
  investNetWorth: number
  delta: number
}

export interface InterestResult {
  rows: InterestMonthRow[]
  horizonMonths: number
  scheduledInstallment: number
  repaymentMonths: number
  repayInterest: number
  investInterest: number
  repayFinal: number
  investFinal: number
  breakEvenMonth: number | null
  indifferenceRate: number | null
}
