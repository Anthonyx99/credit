import type { LoanInput, LoanResult, ScheduleRow } from '../types/loan'

const BALANCE_EPSILON = 0.01

export function monthlyRate(annualRatePercent: number): number {
  return annualRatePercent / 100 / 12
}

export function computeInstallment(principal: number, months: number, rate: number): number {
  if (months <= 0) {
    return Math.max(0, principal)
  }
  if (rate <= 0) {
    return principal / months
  }
  const growth = Math.pow(1 + rate, months)
  return (principal * rate * growth) / (growth - 1)
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function buildRows(input: LoanInput): ScheduleRow[] {
  const rate = monthlyRate(input.annualRate)
  const months = Math.max(1, Math.round(input.durationMonths))
  const principal = Math.max(0, input.principal)
  const initialInstallment = computeInstallment(principal, months, rate)
  const rows: ScheduleRow[] = []
  let balance = principal

  for (let month = 1; month <= months && balance > BALANCE_EPSILON; month += 1) {
    const remaining = months - month + 1
    const openingBalance = balance
    const injection = Math.max(0, input.injections[month - 1] ?? 0)
    const installment = computeInstallment(balance, remaining, rate)
    const interest = balance * rate
    const difference = Math.max(0, initialInstallment - installment)
    const reinvested =
      input.repaymentMode === 'payment' || input.reinvestDifference ? difference : 0
    const requested = installment + injection + reinvested
    const payment = Math.min(requested, balance + interest)
    const principalPaid = payment - interest
    const installmentPrincipal = Math.max(0, Math.min(installment, payment) - interest)
    const extraPrincipal = Math.max(0, principalPaid - installmentPrincipal)
    balance = Math.max(0, balance - principalPaid)

    rows.push({
      month,
      year: Math.ceil(month / 12),
      monthOfYear: ((month - 1) % 12) + 1,
      openingBalance,
      installment,
      injection,
      reinvested,
      payment,
      interest,
      principal: principalPaid,
      installmentPrincipal,
      extraPrincipal,
      closingBalance: balance,
    })
  }

  return rows
}

export function buildSchedule(input: LoanInput): LoanResult {
  const months = Math.max(1, Math.round(input.durationMonths))
  const principal = Math.max(0, input.principal)
  const rate = monthlyRate(input.annualRate)
  const rows = buildRows({ ...input, principal, durationMonths: months })
  const baselineRows = buildRows({
    principal,
    durationMonths: months,
    annualRate: input.annualRate,
    repaymentMode: 'duration',
    reinvestDifference: false,
    injections: [],
  })
  const totalInterest = sum(rows.map((row) => row.interest))
  const baselineTotalInterest = sum(baselineRows.map((row) => row.interest))

  return {
    rows,
    initialInstallment: computeInstallment(principal, months, rate),
    totalInterest,
    totalInjection: sum(rows.map((row) => row.injection + row.reinvested)),
    totalPaid: sum(rows.map((row) => row.payment)),
    baselineTotalInterest,
    interestSaved: baselineTotalInterest - totalInterest,
    actualMonths: rows.length,
    monthsSaved: Math.max(0, months - rows.length),
    balanceSeries: rows.map((row) => row.closingBalance),
    baselineBalances: baselineRows.map((row) => row.closingBalance),
  }
}
