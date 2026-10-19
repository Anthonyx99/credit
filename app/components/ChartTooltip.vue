<script setup lang="ts">
defineProps<{
  title: string
  rows: { label: string; value: string }[]
}>()
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-md">
    <p class="font-medium text-slate-900">{{ title }}</p>
    <dl class="mt-2 space-y-1">
      <div v-for="row in rows" :key="row.label" class="flex items-center justify-between gap-6">
        <dt class="text-slate-500">{{ row.label }}</dt>
        <dd class="font-medium text-slate-900">{{ row.value }}</dd>
      </div>
    </dl>
  </div>
</template>
