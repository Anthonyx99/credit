<script setup lang="ts">
const { result } = useLoanSimulator()

const stats = computed(() => {
  const lastInstallment = result.value.rows.at(-1)?.installment ?? 0

  return [
    { label: 'Mensualité initiale', value: formatPrice(result.value.initialInstallment) },
    { label: 'Dernière mensualité', value: formatPrice(lastInstallment) },
    { label: 'Intérêts totaux', value: formatPrice(result.value.totalInterest) },
    { label: 'Économie d’intérêts', value: formatPrice(result.value.interestSaved) },
    { label: 'Durée réelle', value: formatDuration(result.value.actualMonths) },
    { label: 'Durée gagnée', value: formatDuration(result.value.monthsSaved) },
    { label: 'Total injecté', value: formatPrice(result.value.totalInjection) },
    { label: 'Total remboursé', value: formatPrice(result.value.totalPaid) },
  ]
})
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div v-for="stat in stats" :key="stat.label" class="rounded-lg border border-slate-200 p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
      <p class="mt-1 text-xl font-semibold text-slate-900">{{ stat.value }}</p>
    </div>
  </section>
</template>
