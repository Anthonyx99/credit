<script setup lang="ts">
const { input, result, setInjection, fillRange } = useLoanSimulator()

const fillValue = ref(0)
const fromMonth = ref(1)
const toMonth = ref(input.value.durationMonths)

watch(
  () => input.value.durationMonths,
  (months) => {
    fromMonth.value = Math.min(fromMonth.value, months)
    toMonth.value = Math.min(toMonth.value, months)
  },
)

function applyRange() {
  fillRange(fromMonth.value, toMonth.value, fillValue.value)
}

function clearAll() {
  fillRange(1, input.value.durationMonths, 0)
  fillValue.value = 0
}

function onInjectionInput(index: number, event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  setInjection(index, Number.isFinite(value) ? value : 0)
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 p-6">
    <h2 class="text-lg font-semibold">Tableau d'amortissement</h2>
    <p class="mt-1 text-sm text-slate-600">
      Saisis une injection mois par mois, ou remplis une plage complète d'un coup.
    </p>

    <div class="mt-4 flex flex-wrap items-end gap-3 text-sm">
      <label class="flex flex-col gap-1">
        <span class="font-medium text-slate-700">Valeur</span>
        <input
          v-model.number="fillValue"
          type="number"
          min="0"
          step="10"
          class="w-28 rounded-md border border-slate-300 px-3 py-1.5"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="font-medium text-slate-700">Du mois</span>
        <input
          v-model.number="fromMonth"
          type="number"
          min="1"
          :max="input.durationMonths"
          class="w-24 rounded-md border border-slate-300 px-3 py-1.5"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="font-medium text-slate-700">Au mois</span>
        <input
          v-model.number="toMonth"
          type="number"
          min="1"
          :max="input.durationMonths"
          class="w-24 rounded-md border border-slate-300 px-3 py-1.5"
        />
      </label>
      <button
        type="button"
        class="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-500"
        @click="applyRange"
      >
        Remplir la plage
      </button>
      <button
        type="button"
        class="rounded-md border border-slate-300 px-4 py-2 font-medium hover:border-brand-500"
        @click="clearAll"
      >
        Tout effacer
      </button>
    </div>

    <div class="mt-4 max-h-[32rem] overflow-auto rounded-md border border-slate-200">
      <table class="w-full border-collapse text-sm">
        <thead class="sticky top-0 bg-slate-50 text-left">
          <tr>
            <th class="px-3 py-2 font-medium">Mois</th>
            <th class="px-3 py-2 font-medium">An</th>
            <th class="px-3 py-2 text-right font-medium">Solde début</th>
            <th class="px-3 py-2 text-right font-medium">Mensualité</th>
            <th class="px-3 py-2 text-right font-medium">Capital mens.</th>
            <th class="px-3 py-2 text-right font-medium">Injection</th>
            <th class="px-3 py-2 text-right font-medium">Réinvesti</th>
            <th class="px-3 py-2 text-right font-medium">Capital inj.</th>
            <th class="px-3 py-2 text-right font-medium">Intérêts</th>
            <th class="px-3 py-2 text-right font-medium">Sortie</th>
            <th class="px-3 py-2 text-right font-medium">Solde fin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in result.rows" :key="row.month" class="border-t border-slate-100">
            <td class="px-3 py-1 text-slate-500">{{ row.month }}</td>
            <td class="px-3 py-1 text-slate-500">{{ row.year }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.openingBalance) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.installment) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.installmentPrincipal) }}</td>
            <td class="px-3 py-1">
              <input
                :value="row.injection"
                type="number"
                min="0"
                step="10"
                class="w-24 rounded border border-slate-300 px-2 py-1 text-right"
                @input="onInjectionInput(row.month - 1, $event)"
              />
            </td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.reinvested) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.extraPrincipal) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.interest) }}</td>
            <td class="px-3 py-1 text-right font-medium">{{ formatPrice(row.payment) }}</td>
            <td class="px-3 py-1 text-right">{{ formatPrice(row.closingBalance) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
