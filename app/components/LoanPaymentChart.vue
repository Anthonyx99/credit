<script setup lang="ts">
const { input, result } = useLoanSimulator()

interface PaymentPoint {
  month: number
  year: number
  monthOfYear: number
  outlay: number
  reference: number
  installment: number
  injection: number
  reinvested: number
}

const data = computed<PaymentPoint[]>(() =>
  Array.from({ length: Math.round(input.value.durationMonths) }, (_, index) => {
    const row = result.value.rows[index]

    return {
      month: index + 1,
      year: Math.ceil((index + 1) / 12),
      monthOfYear: (index % 12) + 1,
      outlay: row?.payment ?? 0,
      reference: result.value.initialInstallment,
      installment: row?.installment ?? 0,
      injection: row?.injection ?? 0,
      reinvested: row?.reinvested ?? 0,
    }
  }),
)

const categories = {
  outlay: { name: 'Sortie de cash', color: '#1d4ed8' },
  reference: { name: 'Mensualité initiale', color: '#cbd5e1' },
}

function tooltipTitle(point?: PaymentPoint): string {
  return point ? `Mois ${point.month} · An ${point.year}` : ''
}

function tooltipRows(point?: PaymentPoint): { label: string; value: string }[] {
  if (!point) {
    return []
  }

  return [
    { label: `Mois ${point.monthOfYear} de l'année`, value: formatPrice(point.outlay) },
    { label: 'Mensualité', value: formatPrice(point.installment) },
    { label: 'Injection', value: formatPrice(point.injection) },
    { label: 'Réinvesti', value: formatPrice(point.reinvested) },
    { label: 'Mensualité initiale', value: formatPrice(point.reference) },
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
    <h2 class="text-lg font-semibold">Sortie de cash mensuelle</h2>
    <LineChart
      :data="data"
      :height="320"
      x-label="Mois"
      y-label="Montant"
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
