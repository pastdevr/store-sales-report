<script setup lang="ts">
import type { PaymentFilter } from '../types/report'
import { useWidgetI18n } from '../i18n/widget-i18n'

defineProps<{
  from: string
  to: string
  paymentMethod: PaymentFilter
  validRange: boolean
}>()

const emit = defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
  'update:paymentMethod': [value: PaymentFilter]
}>()

const { t } = useWidgetI18n()

const methods: Array<{ value: PaymentFilter; label: string }> = [
  { value: 'all', label: 'allPayments' },
  { value: 'cash', label: 'cash' },
  { value: 'card', label: 'card' },
  { value: 'ebt', label: 'ebt' },
  { value: 'mobile', label: 'mobile' },
]
</script>

<template>
  <section class="ssr-filters" :aria-label="t('filters')">
    <label class="ssr-field">
      <span>{{ t('from') }}</span>
      <input
        type="date"
        :value="from"
        :aria-invalid="!validRange"
        @input="emit('update:from', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label class="ssr-field">
      <span>{{ t('to') }}</span>
      <input
        type="date"
        :value="to"
        :aria-invalid="!validRange"
        @input="emit('update:to', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label class="ssr-field ssr-field-payment">
      <span>{{ t('paymentMethod') }}</span>
      <select
        :value="paymentMethod"
        @change="emit('update:paymentMethod', ($event.target as HTMLSelectElement).value as PaymentFilter)"
      >
        <option v-for="method in methods" :key="method.value" :value="method.value">
          {{ t(method.label) }}
        </option>
      </select>
    </label>
  </section>
  <p v-if="!validRange" class="ssr-validation" role="alert">{{ t('invalidRange') }}</p>
</template>
