<script setup lang="ts">
const { input, result, setDuration, setHorizonToDuration, reset } = useInterestSimulator()

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none'

function onDuration(event: Event) {
  setDuration(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 p-6">
    <h2 class="text-lg font-semibold">Paramètres</h2>
    <p class="mt-1 text-sm text-slate-600">
      La même somme est affectée chaque mois soit au remboursement anticipé, soit au placement.
    </p>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Capital restant dû</span>
        <input
          v-model.number="input.principal"
          type="number"
          min="0"
          step="1000"
          :class="inputClass"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Durée restante (mois)</span>
        <input
          :value="input.durationMonths"
          type="number"
          min="1"
          max="600"
          step="6"
          :class="inputClass"
          @input="onDuration"
        />
        <span class="text-xs text-slate-500">{{ formatDuration(input.durationMonths) }}</span>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Taux du prêt (%)</span>
        <input
          v-model.number="input.annualRate"
          type="number"
          min="0"
          step="0.05"
          :class="inputClass"
        />
      </label>
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Montant mensuel</span>
        <input
          v-model.number="input.monthlyAmount"
          type="number"
          min="0"
          step="50"
          :class="inputClass"
        />
        <span class="text-xs text-slate-500">Somme disponible chaque mois, hors mensualité.</span>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Rendement net du placement (% annuel)</span>
        <input
          v-model.number="input.placementRate"
          type="number"
          min="0"
          step="0.1"
          :class="inputClass"
        />
        <span class="text-xs text-slate-500">Frais et fiscalité déjà déduits.</span>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Plafond du placement</span>
        <input
          v-model.number="input.placementCap"
          type="number"
          min="0"
          step="1000"
          :class="inputClass"
        />
        <span class="text-xs text-slate-500">
          0 = pas de plafond. Au-delà, les versements ne rapportent plus rien.
        </span>
      </label>
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Horizon de comparaison (mois)</span>
        <input
          v-model.number="input.horizonMonths"
          type="number"
          min="1"
          max="1200"
          step="12"
          :class="inputClass"
        />
        <span class="text-xs text-slate-500">
          {{ formatDuration(result.horizonMonths) }} — fin du prêt par défaut.
        </span>
      </label>
      <div class="flex items-end gap-3">
        <button
          type="button"
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:border-brand-500"
          @click="setHorizonToDuration"
        >
          Fin du prêt
        </button>
        <button
          type="button"
          class="rounded-md border border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          @click="reset"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  </section>
</template>
