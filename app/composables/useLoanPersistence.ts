const STORAGE_KEY = 'loan-simulator-input'

export function useLoanPersistence() {
  const { input, load } = useLoanSimulator()

  if (import.meta.client) {
    onMounted(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        load(stored)
      }
    })

    watch(
      input,
      (value) => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: SIMULATION_FILE_VERSION, input: value }),
        )
      },
      { deep: true },
    )
  }
}
