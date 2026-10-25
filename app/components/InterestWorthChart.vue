<script setup lang="ts">
const { result } = useInterestSimulator()

interface DeltaPoint {
  month: number
  year: number
  monthOfYear: number
  delta: number
  repayNetWorth: number
  investNetWorth: number
}

const data = computed<DeltaPoint[]>(() =>
  result.value.rows.map((row) => ({
    month: row.month,
    year: row.year,
    monthOfYear: row.monthOfYear,
    delta: row.delta,
    repayNetWorth: row.repayNetWorth,
    investNetWorth: row.investNetWorth,
  })),
)

const categories = {
  delta: { name: 'Placer − rembourser', color: '#0d9488' },
}

function tooltipTitle(point?: DeltaPoint): string {
  return point ? `Mois ${point.month} · An ${point.year}` : ''
}

function tooltipRows(point?: DeltaPoint): { label: string; value: string }[] {
  if (!point) {
    return []
  }

  return [
    { label: 'Patrimoine — placer', value: formatPrice(point.investNetWorth) },
    { label: 'Patrimoine — rembourser', value: formatPrice(point.repayNetWorth) },
    { label: 'Écart', value: formatPrice(point.delta) },
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
    <h2 class="text-lg font-semibold">Écart de patrimoine</h2>
    <p class="mt-1 text-sm text-slate-600">
      Au-dessus de zéro, mieux vaut placer ; en dessous, mieux vaut rembourser par anticipation.
    </p>
    <LineChart
      :data="data"
      :height="320"
      x-label="Mois"
      y-label="Écart"
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
