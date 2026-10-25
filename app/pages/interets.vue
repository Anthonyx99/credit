<script setup lang="ts">
useSeoMeta({
  title: 'Intérêts : rembourser ou placer',
  description:
    'Compare le remboursement anticipé d’un crédit et un placement, et trouve le taux à partir duquel placer devient plus rentable.',
})

useInterestPersistence()
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold">Rembourser ou placer ?</h1>
      <p class="text-slate-600">
        Pour une même somme disponible chaque mois, compare le remboursement anticipé du crédit et
        un placement, puis situe le point de bascule.
      </p>
    </header>

    <InterestForm />
    <InterestSummary />
    <InterestWorthChart />
    <InterestTable />
  </div>
</template>
