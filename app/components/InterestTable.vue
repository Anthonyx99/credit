<script setup lang="ts">
const { result } = useInterestSimulator()
</script>

<template>
  <section class="rounded-lg border border-slate-200 p-6">
    <h2 class="text-lg font-semibold">Détail mois par mois</h2>
    <p class="mt-1 text-sm text-slate-600">
      Patrimoine = placement − capital restant dû. L’écart positif signifie que placer est gagnant.
    </p>

    <div class="mt-4 max-h-[32rem] overflow-auto rounded-md border border-slate-200">
      <table class="w-full border-collapse text-sm">
        <thead class="sticky top-0 bg-slate-50 text-left">
          <tr>
            <th class="px-3 py-2 font-medium">Mois</th>
            <th class="px-3 py-2 font-medium">An</th>
            <th class="px-3 py-2 text-right font-medium">Prêt (remb.)</th>
            <th class="px-3 py-2 text-right font-medium">Placement (remb.)</th>
            <th class="px-3 py-2 text-right font-medium">Patrimoine (remb.)</th>
            <th class="px-3 py-2 text-right font-medium">Prêt (placer)</th>
            <th class="px-3 py-2 text-right font-medium">Placement (placer)</th>
            <th class="px-3 py-2 text-right font-medium">Patrimoine (placer)</th>
            <th class="px-3 py-2 text-right font-medium">Écart</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in result.rows" :key="row.month" class="border-t border-slate-100">
            <td class="px-3 py-1 text-slate-500">{{ row.month }}</td>
            <td class="px-3 py-1 text-slate-500">{{ row.year }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.repayBalance) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.repayPlacement) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.repayNetWorth) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.investBalance) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.investPlacement) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.investNetWorth) }}</td>
            <td class="px-3 py-1 text-right font-medium">{{ formatPrice(row.delta) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
