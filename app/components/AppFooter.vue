<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-200">
    <p class="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-500">
      &copy; {{ year }} Credit — Built with Nuxt 4.
    </p>
  </footer>
</template>
