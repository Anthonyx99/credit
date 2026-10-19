<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

function handleClearError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
    <p class="text-6xl font-bold text-brand-600">{{ error.statusCode }}</p>
    <h1 class="text-xl font-semibold">{{ error.statusMessage }}</h1>
    <button
      type="button"
      class="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      @click="handleClearError"
    >
      Retour à l'accueil
    </button>
  </div>
</template>
