<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getDefaultSalesRange } from '@store-sales-report/data'
import ReportFilters from './ReportFilters.vue'
import KpiCards from './KpiCards.vue'
import DailyRevenueChart from './DailyRevenueChart.vue'
import CategoryRevenueTable from './CategoryRevenueTable.vue'
import ReportNotice from './ReportNotice.vue'
import { createWidgetI18n, normalizeLocale, provideWidgetI18n } from '../i18n/widget-i18n'
import { isValidDateRange, aggregateSales } from '../utils/sales-aggregation'
import type {
  LoadErrorDetail,
  PaymentFilter,
  ReportFilters as ReportFilterValues,
  ReportLocale,
  StoreSalesReportEmits,
  StoreSalesReportProps,
  StoreSalesReportDataLoadedDetail,
  ReportTheme,
} from '../types/report'
import { useStoreSales } from '../composables/useStoreSales'
import '../styles/widget.css'

const props = withDefaults(defineProps<StoreSalesReportProps>(), {
  language: 'en',
  theme: 'light',
})

const emit = defineEmits<StoreSalesReportEmits>()

const defaultRange = getDefaultSalesRange()
const from = ref(props.from ?? defaultRange.from)
const to = ref(props.to ?? defaultRange.to)
const paymentMethod = ref<PaymentFilter>('all')
const selectedLocale = ref<ReportLocale>(normalizeLocale(props.language))
const i18n = createWidgetI18n(selectedLocale.value)
provideWidgetI18n(i18n)
const { t } = i18n

watch(() => props.from, (value) => { from.value = value ?? defaultRange.from })
watch(() => props.to, (value) => { to.value = value ?? defaultRange.to })
watch(() => props.language, (value) => {
  selectedLocale.value = normalizeLocale(value)
  i18n.setLocale(selectedLocale.value)
})

const validRange = computed(() => isValidDateRange(from.value, to.value))
const hasStoreId = computed(() => Boolean(props.storeId?.trim()))
const sales = useStoreSales({
  storeId: computed(() => props.storeId),
  from,
  to,
  enabled: computed(() => validRange.value && hasStoreId.value),
})

watch([from, to, paymentMethod], () => {
  const filters: ReportFilterValues = { from: from.value, to: to.value, paymentMethod: paymentMethod.value }
  emit('filters-change', filters)
})

watch(sales.data, (response) => {
  if (response) emit('data-loaded', response satisfies StoreSalesReportDataLoadedDetail)
})

sales.onFetchError(({ error, response, context }) => {
  if (sales.aborted.value || context.url !== sales.requestUrl.value) return
  const message = error instanceof Error ? error.message : t('loadError')
  emit('load-error', {
    storeId: props.storeId,
    message,
    ...(response ? { status: response.status } : {}),
  })
})

const aggregated = computed(() => aggregateSales(sales.data.value?.transactions ?? [], {
  from: from.value,
  to: to.value,
  paymentMethod: paymentMethod.value,
}))
const isEmpty = computed(() => Boolean(sales.data.value) && aggregated.value.transactions.length === 0)
const languageOptions: Array<{ value: ReportLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
]

function setLanguage(event: Event): void {
  selectedLocale.value = normalizeLocale((event.target as HTMLSelectElement).value)
  i18n.setLocale(selectedLocale.value)
}

function retry(): void {
  if (validRange.value && hasStoreId.value) void sales.execute()
}
</script>

<template>
  <section class="ssr-widget" :data-theme="theme">
    <header class="ssr-header">
      <div class="ssr-header-copy">
        <h1>{{ t('title') }}</h1>
        <p class="ssr-subtitle">{{ t('subtitle') }}</p>
      </div>
      <label class="ssr-field ssr-language-field">
        <span>{{ t('language') }}</span>
        <select :value="selectedLocale" @change="setLanguage">
          <option v-for="option in languageOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </header>

    <ReportFilters
      :from="from"
      :to="to"
      :payment-method="paymentMethod"
      :valid-range="validRange"
      @update:from="from = $event"
      @update:to="to = $event"
      @update:payment-method="paymentMethod = $event"
    />

    <ReportNotice v-if="!hasStoreId" state="configuration" />
    <ReportNotice v-else-if="!validRange" state="invalid" />
    <ReportNotice v-else-if="sales.error.value && !sales.aborted.value" state="error" :message="t('loadError')" @retry="retry" />
    <ReportNotice v-else-if="sales.isFetching.value && !sales.data.value" state="loading" />
    <ReportNotice v-else-if="isEmpty" state="empty" />

    <template v-if="sales.data.value && !isEmpty && validRange && hasStoreId && !sales.error.value">
      <p v-if="sales.isFetching.value" class="ssr-refreshing" role="status">{{ t('loading') }}</p>
      <KpiCards :metrics="aggregated.metrics" :currency="sales.data.value.currency" />
      <div class="ssr-report-grid">
        <DailyRevenueChart
          :rows="aggregated.dailyRevenue"
          :currency="sales.data.value.currency"
          :theme="theme"
        />
        <CategoryRevenueTable :rows="aggregated.categories" :currency="sales.data.value.currency" />
      </div>
    </template>
  </section>
</template>
