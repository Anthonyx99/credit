<script setup lang="ts">
useSeoMeta({
  title: 'Accueil',
  description: 'Application Nuxt 4 en stack vanilla.',
})
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-bold">Bienvenue</h1>
    <p class="text-slate-600">
      Stack Nuxt 4 + TypeScript strict + Tailwind CSS v4, prête pour le SSR et le déploiement
      Vercel.
    </p>
    <NuxtLink
      to="/about"
      class="inline-block rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-500"
    >
      En savoir plus
    </NuxtLink>
  </section>
</template>
