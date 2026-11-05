<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const StoreSalesReport = defineAsyncComponent(() => import('storeSalesReport/vue'))
</script>

<template>
  <main class="host-shell">
    <header class="host-header">
      <p class="eyebrow">Example host application</p>
      <h1>Store dashboard</h1>
      <p class="intro">The report below is loaded from a separate federated Vue remote.</p>
    </header>

    <section class="widget-slot" aria-label="Store Sales Report widget">
      <Suspense>
        <StoreSalesReport />
        <template #fallback>
          <p class="status">Loading the Store Sales Report remote…</p>
        </template>
      </Suspense>
    </section>
  </main>
</template>
