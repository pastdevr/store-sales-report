<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createSortedRowModel,
  FlexRender,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/vue-table'
import { useWidgetI18n } from '../i18n/widget-i18n'
import type { CategoryRevenue } from '../types/report'

const props = defineProps<{
  rows: CategoryRevenue[]
  currency: string
}>()

const { locale, t } = useWidgetI18n()
const sorting = ref<SortingState>([{ id: 'revenue', desc: true }])
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})
const columns: ColumnDef<typeof features, CategoryRevenue>[] = [
  {
    accessorKey: 'category',
    header: () => t('category'),
    cell: (context) => t(`categories.${context.getValue<string>()}`),
  },
  {
    accessorKey: 'revenue',
    header: () => t('revenue'),
    cell: (context) => new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: props.currency,
    }).format(context.getValue<number>()),
  },
  { accessorKey: 'transactionCount', header: () => t('transactionCount') },
  { accessorKey: 'itemsSold', header: () => t('categoryItems') },
]
const table = useTable({
  features,
  columns,
  data: computed(() => props.rows),
  state: computed(() => ({ sorting: sorting.value })),
  onSortingChange: (next) => {
    sorting.value = typeof next === 'function' ? next(sorting.value) : next
  },
  getRowId: (row: CategoryRevenue) => row.category,
})

function sortLabel(columnId: string): string {
  const column = table.getColumn(columnId)
  const direction = column?.getIsSorted() === 'asc' ? t('sortDescending') : t('sortAscending')
  const headerLabels: Record<string, string> = {
    category: t('category'),
    revenue: t('revenue'),
    transactionCount: t('transactionCount'),
    itemsSold: t('categoryItems'),
  }
  return `${direction} ${headerLabels[columnId] ?? columnId}`
}
</script>

<template>
  <section class="ssr-panel ssr-table-panel">
    <h2 class="ssr-section-heading">{{ t('revenueByCategory') }}</h2>
    <div class="ssr-table-scroll">
      <table class="ssr-table">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :aria-sort="header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none'"
            >
              <button
                v-if="header.column.getCanSort()"
                type="button"
                class="ssr-sort-button"
                :aria-label="sortLabel(header.column.id)"
                @click="header.column.toggleSorting()"
              >
                <FlexRender v-if="!header.isPlaceholder" :header="header" />
                <span aria-hidden="true">{{ header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '↕' }}</span>
              </button>
              <FlexRender v-else-if="!header.isPlaceholder" :header="header" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getAllCells()" :key="cell.id">
              <FlexRender :cell="cell" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
