<script setup lang="ts">
const { input, yearCount, setYearInjection } = useLoanSimulator()

function yearValue(year: number): number {
  return input.value.injections[(year - 1) * 12] ?? 0
}

function yearTotal(year: number): number {
  const start = (year - 1) * 12
  const end = Math.min(start + 12, input.value.durationMonths)
  let total = 0

  for (let index = start; index < end; index += 1) {
    total += input.value.injections[index] ?? 0
  }
  return total
}

function isUniform(year: number): boolean {
  const start = (year - 1) * 12
  const end = Math.min(start + 12, input.value.durationMonths)
  const first = input.value.injections[start] ?? 0

  for (let index = start + 1; index < end; index += 1) {
    if ((input.value.injections[index] ?? 0) !== first) {
      return false
    }
  }
  return true
}

function onYearInput(year: number, event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  setYearInjection(year, Number.isFinite(value) ? value : 0)
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 p-6">
    <h2 class="text-lg font-semibold">Injections de capital par année</h2>
    <p class="mt-1 text-sm text-slate-600">
      Montant ajouté chaque mois de l'année, en plus de la mensualité. Modifiable au mois près dans
      le tableau ci-dessous.
    </p>

    <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <label
        v-for="year in yearCount"
        :key="year"
        class="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm"
      >
        <span class="w-14 shrink-0 font-medium text-slate-700">An {{ year }}</span>
        <input
          :value="yearValue(year)"
          type="number"
          min="0"
          step="10"
          class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          @input="onYearInput(year, $event)"
        />
        <span class="w-24 shrink-0 text-right text-xs text-slate-500">
          {{ formatPrice(yearTotal(year)) }}
        </span>
        <span v-if="!isUniform(year)" class="shrink-0 text-xs text-amber-600">mixte</span>
      </label>
    </div>
  </section>
</template>
