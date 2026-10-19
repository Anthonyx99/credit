export function useLoanSimulator() {
  const input = useState<LoanInput>('loan-simulator', createDefaultLoanInput)
  const result = computed(() => buildSchedule(input.value))
  const yearCount = computed(() => Math.max(1, Math.ceil(input.value.durationMonths / 12)))

  function commit(injections: number[]) {
    input.value.injections = injections
  }

  function setInjection(index: number, value: number) {
    const injections = [...input.value.injections]
    injections[index] = Math.max(0, value)
    commit(injections)
  }

  function fillRange(fromMonth: number, toMonth: number, value: number) {
    const months = input.value.durationMonths
    const start = Math.max(1, Math.min(fromMonth, toMonth))
    const end = Math.min(months, Math.max(fromMonth, toMonth))
    const amount = Math.max(0, value)
    const injections = [...input.value.injections]

    for (let month = start; month <= end; month += 1) {
      injections[month - 1] = amount
    }
    commit(injections)
  }

  function setYearInjection(year: number, value: number) {
    fillRange((year - 1) * 12 + 1, year * 12, value)
  }

  function setDuration(months: number) {
    const next = Number.isFinite(months)
      ? Math.max(1, Math.round(months))
      : input.value.durationMonths
    input.value.durationMonths = next
    commit(Array.from({ length: next }, (_, index) => input.value.injections[index] ?? 0))
  }

  function reset() {
    input.value = createDefaultLoanInput()
  }

  function load(raw: string): boolean {
    const parsed = parseLoanSimulation(raw)
    if (!parsed) {
      return false
    }
    input.value = parsed
    return true
  }

  return {
    input,
    result,
    yearCount,
    setInjection,
    setYearInjection,
    fillRange,
    setDuration,
    reset,
    load,
  }
}
