<script setup lang="ts">
useSeoMeta({
  title: 'Simulateur de crédit',
  description:
    'Simule un crédit et l’impact d’injections de capital mensuelles sur la durée et les intérêts.',
})

useLoanPersistence()
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold">Simulateur de crédit</h1>
      <p class="text-slate-600">
        Capital, durée, taux et injections de capital mensuelles. Visualise l’effet sur la durée et
        les intérêts.
      </p>
    </header>

    <LoanForm />
    <LoanSummary />
    <LoanBalanceChart />
    <LoanPaymentChart />
    <InjectionYearPanel />
    <LoanScheduleTable />
  </div>
</template>
