<script setup lang="ts">
import type { SalesMetrics } from '../types/report'
import { useWidgetI18n } from '../i18n/widget-i18n'

defineProps<{
  metrics: SalesMetrics
  currency: string
}>()

const { locale, t } = useWidgetI18n()

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(value)
}
</script>

<template>
  <section class="ssr-kpis" :aria-label="t('transactions')">
    <article class="ssr-kpi">
      <span>{{ t('revenue') }}</span>
      <strong>{{ formatCurrency(metrics.revenue, currency) }}</strong>
    </article>
    <article class="ssr-kpi">
      <span>{{ t('transactions') }}</span>
      <strong>{{ new Intl.NumberFormat(locale).format(metrics.transactionCount) }}</strong>
    </article>
    <article class="ssr-kpi">
      <span>{{ t('averageBasket') }}</span>
      <strong>{{ formatCurrency(metrics.averageBasketValue, currency) }}</strong>
    </article>
    <article class="ssr-kpi">
      <span>{{ t('itemsSold') }}</span>
      <strong>{{ new Intl.NumberFormat(locale).format(metrics.itemsSold) }}</strong>
    </article>
  </section>
</template>
