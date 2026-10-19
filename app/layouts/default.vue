<template>
  <div class="flex min-h-screen flex-col bg-white text-slate-900">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
