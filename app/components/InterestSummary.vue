<script setup lang="ts">
const { input, result } = useInterestSimulator()

const verdict = computed(() => {
  const delta = result.value.investFinal - result.value.repayFinal

  if (Math.abs(delta) < 1) {
    return {
      label: 'Égalité',
      detail: 'Les deux stratégies donnent le même patrimoine à cet horizon.',
    }
  }

  return delta > 0
    ? {
        label: 'Placer',
        detail: `Placer rapporte ${formatPrice(delta)} de plus qu’un remboursement anticipé.`,
      }
    : {
        label: 'Rembourser',
        detail: `Le remboursement anticipé rapporte ${formatPrice(-delta)} de plus que le placement.`,
      }
})

const indifference = computed(() => {
  const rate = result.value.indifferenceRate
  return rate === null ? '—' : `${rate.toFixed(2).replace('.', ',')} %`
})

const breakEven = computed(() => {
  const month = result.value.breakEvenMonth
  return month === null ? '—' : `Mois ${month} (${formatDuration(month)})`
})

const stats = computed(() => [
  { label: 'Patrimoine final — rembourser', value: formatPrice(result.value.repayFinal) },
  { label: 'Patrimoine final — placer', value: formatPrice(result.value.investFinal) },
  { label: 'Intérêts payés — rembourser', value: formatPrice(result.value.repayInterest) },
  { label: 'Intérêts payés — placer', value: formatPrice(result.value.investInterest) },
  { label: 'Prêt soldé en — rembourser', value: formatDuration(result.value.repaymentMonths) },
  { label: 'Mensualité contractuelle', value: formatPrice(result.value.scheduledInstallment) },
])
</script>

<template>
  <section class="space-y-4">
    <div class="rounded-lg border border-slate-200 p-6">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-lg font-semibold">Verdict</h2>
        <p class="text-sm text-slate-500">
          {{ formatPrice(input.monthlyAmount) }} / mois pendant
          {{ formatDuration(result.horizonMonths) }}
        </p>
      </div>
      <p class="mt-2 text-2xl font-semibold text-brand-600">{{ verdict.label }}</p>
      <p class="mt-1 text-slate-600">{{ verdict.detail }}</p>

      <dl class="mt-4 grid gap-4 sm:grid-cols-3">
        <div class="rounded-md bg-slate-50 p-3">
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
            Taux d’indifférence
          </dt>
          <dd class="mt-1 text-lg font-semibold text-slate-900">{{ indifference }}</dd>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Bascule</dt>
          <dd class="mt-1 text-lg font-semibold text-slate-900">{{ breakEven }}</dd>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
            Écart à l’horizon
          </dt>
          <dd class="mt-1 text-lg font-semibold text-slate-900">
            {{ formatPrice(result.investFinal - result.repayFinal) }}
          </dd>
        </div>
      </dl>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="stat in stats" :key="stat.label" class="rounded-lg border border-slate-200 p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
        <p class="mt-1 text-xl font-semibold text-slate-900">{{ stat.value }}</p>
      </div>
    </div>
  </section>
</template>
