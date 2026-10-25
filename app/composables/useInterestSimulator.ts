export function useInterestSimulator() {
  const input = useState<InterestInput>('interest-simulator', createDefaultInterestInput)
  const result = computed(() => compareStrategies(input.value))

  function setDuration(months: number) {
    const next = Number.isFinite(months)
      ? Math.max(1, Math.round(months))
      : input.value.durationMonths
    const previous = input.value.durationMonths
    input.value.durationMonths = next

    if (input.value.horizonMonths === 0 || input.value.horizonMonths === previous) {
      input.value.horizonMonths = next
    }
  }

  function setHorizonToDuration() {
    input.value.horizonMonths = input.value.durationMonths
  }

  function reset() {
    input.value = createDefaultInterestInput()
  }

  function load(raw: string): boolean {
    const parsed = parseInterestSimulation(raw)
    if (!parsed) {
      return false
    }
    input.value = parsed
    return true
  }

  return {
    input,
    result,
    setDuration,
    setHorizonToDuration,
    reset,
    load,
  }
}
