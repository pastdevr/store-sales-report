<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { ref } from 'vue'

const StoreSalesReport = defineAsyncComponent(() => import('storeSalesReport/vue'))
const hostStatus = ref('Waiting for report data…')

function onDataLoaded(response: { storeId: string; transactions: unknown[] }) {
  hostStatus.value = `${response.transactions.length} transactions loaded for ${response.storeId}.`
}

function onLoadError(detail: { message: string }) {
  hostStatus.value = detail.message
}
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
        <StoreSalesReport
          store-id="S-1042"
          language="en"
          theme="light"
          @data-loaded="onDataLoaded"
          @load-error="onLoadError"
        />
        <template #fallback>
          <p class="status">Loading the Store Sales Report remote…</p>
        </template>
      </Suspense>
      <p class="host-status" role="status">Host event: {{ hostStatus }}</p>
    </section>
  </main>
</template>
