<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { BarChart } from 'echarts/charts'
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { init, use } from 'echarts/core'
import type { ECharts, EChartsCoreOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useWidgetI18n } from '../i18n/widget-i18n'
import type { DailyRevenue, ReportTheme } from '../types/report'

const props = defineProps<{
  rows: DailyRevenue[]
  currency: string
  theme: ReportTheme
}>()

const { locale, t } = useWidgetI18n()
const chartElement = ref<HTMLDivElement>()
let chart: ECharts | undefined

use([BarChart, AriaComponent, GridComponent, TooltipComponent, CanvasRenderer])

function currencyFormatter(): Intl.NumberFormat {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: props.currency })
}

function chartOptions(): EChartsCoreOption {
  const formatter = currencyFormatter()
  const dateFormatter = new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric', timeZone: 'UTC' })

  return {
    animationDuration: 250,
    aria: { enabled: true },
    grid: { left: 12, right: 20, top: 20, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: string | number) => formatter.format(Number(value)),
    },
    xAxis: {
      type: 'category',
      data: props.rows.map(({ date }) => date),
      axisTick: { show: false },
      axisLabel: {
        hideOverlap: true,
        formatter: (date: string) => dateFormatter.format(new Date(`${date}T00:00:00.000Z`)),
      },
    },
    yAxis: {
      type: 'value',
      name: t('revenue'),
      axisLabel: { formatter: (value: number) => formatter.format(value) },
      splitLine: { lineStyle: { color: props.theme === 'dark' ? '#30394a' : '#e7ebf1' } },
    },
    series: [{
      name: t('revenue'),
      type: 'bar',
      data: props.rows.map(({ revenue }) => revenue),
      barMaxWidth: 24,
      itemStyle: { color: props.theme === 'dark' ? '#8ab4ff' : '#315fd4', borderRadius: [4, 4, 0, 0] },
    }],
  }
}

function renderChart(): void {
  if (!chartElement.value) return
  if (!chart) chart = init(chartElement.value, props.theme === 'dark' ? 'dark' : undefined)
  chart.setOption(chartOptions(), true)
}

function updateTheme(): void {
  chart?.dispose()
  chart = undefined
  renderChart()
}

onMounted(renderChart)
watch(() => [props.rows, props.currency, locale.value], renderChart, { deep: true })
watch(() => props.theme, updateTheme)
useResizeObserver(chartElement, () => chart?.resize())

onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <section class="ssr-panel ssr-chart-panel">
    <h2 class="ssr-section-heading">{{ t('dailyRevenue') }}</h2>
    <div ref="chartElement" class="ssr-chart" role="img" :aria-label="t('chartLabel')" />
  </section>
</template>
