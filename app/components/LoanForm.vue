<script setup lang="ts">
const { input, reset, load, setDuration } = useLoanSimulator()

const fileInput = ref<HTMLInputElement | null>(null)
const fileError = ref('')

const reinvest = computed({
  get: () => input.value.repaymentMode === 'payment' || input.value.reinvestDifference,
  set: (value: boolean) => {
    input.value.reinvestDifference = value
  },
})

const reinvestLocked = computed(() => input.value.repaymentMode === 'payment')

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none'

function onDuration(event: Event) {
  setDuration(Number((event.target as HTMLInputElement).value))
}

function exportSimulation() {
  downloadJson('simulation-credit.json', {
    version: SIMULATION_FILE_VERSION,
    input: input.value,
  })
}

async function importSimulation(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }
  fileError.value = load(await file.text()) ? '' : 'Fichier JSON invalide.'
  target.value = ''
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 p-6">
    <h2 class="text-lg font-semibold">Paramètres du prêt</h2>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Capital emprunté</span>
        <input
          v-model.number="input.principal"
          type="number"
          min="0"
          step="1000"
          :class="inputClass"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Durée (mois)</span>
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
        <span class="font-medium text-slate-700">Taux annuel (%)</span>
        <input
          v-model.number="input.annualRate"
          type="number"
          min="0"
          step="0.05"
          :class="inputClass"
        />
      </label>
    </div>

    <fieldset class="mt-6">
      <legend class="text-sm font-medium text-slate-700">Règle de recalcul après injection</legend>
      <div class="mt-2 grid gap-2 sm:grid-cols-2">
        <label class="flex items-start gap-2 rounded-md border border-slate-200 p-3 text-sm">
          <input v-model="input.repaymentMode" type="radio" value="duration" class="mt-1" />
          <span>
            <span class="font-medium">Maintien de la durée</span>
            <span class="block text-slate-500">La mensualité est recalculée à la baisse.</span>
          </span>
        </label>
        <label class="flex items-start gap-2 rounded-md border border-slate-200 p-3 text-sm">
          <input v-model="input.repaymentMode" type="radio" value="payment" class="mt-1" />
          <span>
            <span class="font-medium">Maintien de la mensualité</span>
            <span class="block text-slate-500">La durée est raccourcie.</span>
          </span>
        </label>
      </div>
    </fieldset>

    <label class="mt-4 flex items-start gap-2 text-sm" :class="reinvestLocked ? 'opacity-70' : ''">
      <input v-model="reinvest" type="checkbox" class="mt-1" :disabled="reinvestLocked" />
      <span>
        <span class="font-medium">Réinvestir automatiquement la différence</span>
        <span class="block text-slate-500">
          La différence entre la mensualité initiale et la mensualité recalculée est ajoutée à
          chaque injection de capital.
        </span>
        <span v-if="reinvestLocked" class="block text-slate-500">
          Toujours actif en maintien de la mensualité.
        </span>
      </span>
    </label>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        @click="exportSimulation"
      >
        Exporter JSON
      </button>
      <button
        type="button"
        class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:border-brand-500"
        @click="fileInput?.click()"
      >
        Importer JSON
      </button>
      <button
        type="button"
        class="rounded-md border border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        @click="reset"
      >
        Réinitialiser
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="importSimulation"
      />
    </div>
    <p v-if="fileError" class="mt-2 text-sm text-red-600">{{ fileError }}</p>
  </section>
</template>
