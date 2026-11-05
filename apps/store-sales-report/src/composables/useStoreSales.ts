import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFetch } from '@vueuse/core'
import type { StoreSalesResponse } from '@store-sales-report/data'
import { getDefaultSalesRange } from '@store-sales-report/data'

export interface UseStoreSalesOptions {
  storeId: MaybeRefOrGetter<string>
  from?: MaybeRefOrGetter<string>
  to?: MaybeRefOrGetter<string>
}

export function useStoreSales(options: UseStoreSalesOptions) {
  const defaultRange = getDefaultSalesRange()
  const url = computed(() => {
    const from = options.from === undefined ? defaultRange.from : toValue(options.from)
    const to = options.to === undefined ? defaultRange.to : toValue(options.to)
    const query = new URLSearchParams({ from, to })

    return `/api/stores/${encodeURIComponent(toValue(options.storeId))}/sales?${query}`
  })

  return useFetch(url, { refetch: true }).get().json<StoreSalesResponse>()
}
