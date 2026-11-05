import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useFetch } from '@vueuse/core'
import type { StoreSalesResponse } from '@store-sales-report/data'
import { getDefaultSalesRange } from '@store-sales-report/data'

export interface UseStoreSalesApiOptions {
  storeId: MaybeRefOrGetter<string>
  from?: MaybeRefOrGetter<string>
  to?: MaybeRefOrGetter<string>
  enabled?: MaybeRefOrGetter<boolean>
}

export function useStoreSalesApi(options: UseStoreSalesApiOptions) {
  const defaultRange = getDefaultSalesRange()
  const url = computed(() => {
    const from = options.from === undefined ? defaultRange.from : toValue(options.from)
    const to = options.to === undefined ? defaultRange.to : toValue(options.to)
    const query = new URLSearchParams({ from, to })

    return `/api/stores/${encodeURIComponent(toValue(options.storeId))}/sales?${query}`
  })

  const enabled = computed(() => options.enabled === undefined || toValue(options.enabled))
  const request = useFetch(url, { immediate: false }).get().json<StoreSalesResponse>()

  watch([url, enabled], ([, isEnabled]) => {
    if (!isEnabled) {
      request.abort()
      return
    }

    if (request.canAbort.value) request.abort()
    void request.execute()
  }, { immediate: true })

  return { ...request, requestUrl: url }
}
