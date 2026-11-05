<script setup lang="ts">
import { useStoreSales } from './composables/useStoreSales'

const { data, error, isFetching } = useStoreSales({ storeId: 'S-1042' })
</script>

<template>
  <article class="report-placeholder" aria-live="polite">
    <p class="eyebrow">Federated remote · Data connection</p>
    <h2>Store Sales Report</h2>
    <p v-if="isFetching">Loading sales data…</p>
    <p v-else-if="error" role="alert">Sales data could not be loaded: {{ error.message }}</p>
    <p v-else-if="data">
      Mock API connected for {{ data.storeId }} ({{ data.currency }}):
      {{ data.transactions.length }} transactions loaded.
    </p>
  </article>
</template>

<style scoped>
.report-placeholder {
  padding: 28px;
  border: 1px dashed #b7c2d4;
  border-radius: 12px;
  background: #f8faff;
  color: #172033;
}

.eyebrow {
  margin: 0 0 8px;
  color: #58647b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
}

p:last-child {
  margin: 10px 0 0;
  color: #58647b;
}
</style>
