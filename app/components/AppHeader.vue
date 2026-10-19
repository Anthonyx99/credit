<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <header class="border-b border-slate-200">
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <NuxtLink to="/" class="text-lg font-semibold text-brand-600">
        {{ appConfig.site.name }}
      </NuxtLink>
      <ul class="flex items-center gap-4 text-sm">
        <li>
          <NuxtLink to="/" class="hover:text-brand-600">Accueil</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/about" class="hover:text-brand-600">À propos</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
