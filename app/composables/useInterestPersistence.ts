const STORAGE_KEY = 'interest-simulator-input'

export function useInterestPersistence() {
  const { input, load } = useInterestSimulator()

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
          JSON.stringify({ version: INTEREST_FILE_VERSION, input: value }),
        )
      },
      { deep: true },
    )
  }
}
