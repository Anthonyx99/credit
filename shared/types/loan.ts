export type RepaymentMode = 'duration' | 'payment'

export interface LoanInput {
  principal: number
  durationMonths: number
  annualRate: number
  repaymentMode: RepaymentMode
  reinvestDifference: boolean
  injections: number[]
}

export interface ScheduleRow {
  month: number
  year: number
  monthOfYear: number
  openingBalance: number
  installment: number
  injection: number
  reinvested: number
  payment: number
  interest: number
  principal: number
  installmentPrincipal: number
  extraPrincipal: number
  closingBalance: number
}

export interface LoanResult {
  rows: ScheduleRow[]
  initialInstallment: number
  totalInterest: number
  totalInjection: number
  totalPaid: number
  baselineTotalInterest: number
  interestSaved: number
  actualMonths: number
  monthsSaved: number
  balanceSeries: number[]
  baselineBalances: number[]
}

export interface LoanSimulationFile {
  version: number
  input: LoanInput
}
