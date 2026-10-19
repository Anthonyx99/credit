<script setup lang="ts">
const { input, result } = useLoanSimulator()

interface BalancePoint {
  month: number
  year: number
  monthOfYear: number
  withInjections: number
  withoutInjections: number
  installment: number
  payment: number
  injection: number
}

const data = computed<BalancePoint[]>(() =>
  Array.from({ length: Math.round(input.value.durationMonths) }, (_, index) => {
    const row = result.value.rows[index]

    return {
      month: index + 1,
      year: Math.ceil((index + 1) / 12),
      monthOfYear: (index % 12) + 1,
      withInjections: result.value.balanceSeries[index] ?? 0,
      withoutInjections: result.value.baselineBalances[index] ?? 0,
      installment: row?.installment ?? 0,
      payment: row?.payment ?? 0,
      injection: row?.injection ?? 0,
    }
  }),
)

const categories = {
  withInjections: { name: 'Avec injections', color: '#0d9488' },
  withoutInjections: { name: 'Sans injection', color: '#94a3b8' },
}

function tooltipTitle(point?: BalancePoint): string {
  return point ? `Mois ${point.month} · An ${point.year}` : ''
}

function tooltipRows(point?: BalancePoint): { label: string; value: string }[] {
  if (!point) {
    return []
  }

  return [
    { label: `Mois ${point.monthOfYear} de l'année`, value: formatPrice(point.withInjections) },
    { label: 'Capital sans injection', value: formatPrice(point.withoutInjections) },
    { label: 'Mensualité', value: formatPrice(point.installment) },
    { label: 'Injection', value: formatPrice(point.injection) },
    { label: 'Sortie de cash', value: formatPrice(point.payment) },
  ]
}

function xFormatter(tick: number): string {
  return `${tick + 1}`
}

function yFormatter(tick: number): string {
  return formatPrice(tick)
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 p-6">
    <h2 class="text-lg font-semibold">Capital restant dû</h2>
    <LineChart
      :data="data"
      :height="320"
      x-label="Mois"
      y-label="Capital"
      :categories="categories"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :x-num-ticks="6"
      :y-num-ticks="4"
      :y-grid-line="true"
      :curve-type="CurveType.MonotoneX"
      :legend-position="LegendPosition.BottomRight"
    >
      <template #tooltip="{ values }">
        <ChartTooltip :title="tooltipTitle(values)" :rows="tooltipRows(values)" />
      </template>
    </LineChart>
  </section>
</template>
