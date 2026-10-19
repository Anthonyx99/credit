<script setup lang="ts">
useSeoMeta({
  title: 'À propos',
})

const { count, increment, decrement } = useCounter()
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-bold">À propos</h1>
    <p class="text-slate-600">Compteur de démonstration : {{ count }}</p>
    <div class="flex gap-2">
      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
        @click="decrement"
      >
        -1
      </button>
      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
        @click="increment"
      >
        +1
      </button>
    </div>
  </section>
</template>
