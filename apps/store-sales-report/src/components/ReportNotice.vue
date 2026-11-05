<script setup lang="ts">
import { useWidgetI18n } from '../i18n/widget-i18n'

defineProps<{
  state: 'loading' | 'error' | 'empty' | 'invalid' | 'configuration'
  message?: string
}>()

defineEmits<{ retry: [] }>()
const { t } = useWidgetI18n()
</script>

<template>
  <div
    class="ssr-notice"
    :class="{ 'ssr-notice-error': state === 'error' || state === 'invalid' || state === 'configuration' }"
    :role="state === 'error' || state === 'invalid' || state === 'configuration' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <p v-if="state === 'loading'">{{ t('loading') }}</p>
    <p v-else-if="state === 'error'">{{ message || t('loadError') }}</p>
    <p v-else-if="state === 'invalid'">{{ t('invalidRange') }}</p>
    <p v-else-if="state === 'configuration'">{{ t('storeRequired') }}</p>
    <p v-else>{{ t('noTransactions') }}</p>
    <button v-if="state === 'error'" type="button" class="ssr-button" @click="$emit('retry')">
      {{ t('retry') }}
    </button>
  </div>
</template>
