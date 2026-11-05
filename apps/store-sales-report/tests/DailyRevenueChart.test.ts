import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createWidgetI18n, provideWidgetI18n } from '../src/i18n/widget-i18n'
import DailyRevenueChart from '../src/components/DailyRevenueChart.vue'

const chartMock = vi.hoisted(() => {
  const instance = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }
  return { instance, init: vi.fn(() => instance) }
})

vi.mock('echarts/core', () => ({ init: chartMock.init, use: vi.fn() }))
vi.mock('echarts/charts', () => ({ BarChart: {} }))
vi.mock('echarts/components', () => ({ AriaComponent: {}, GridComponent: {}, TooltipComponent: {} }))
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }))

describe('DailyRevenueChart', () => {
  it('renders daily revenue data and recreates the chart for a theme change', async () => {
    const Harness = defineComponent({
      setup() {
        const theme = ref<'light' | 'dark'>('light')
        provideWidgetI18n(createWidgetI18n('en'))
        return { theme }
      },
      render() {
        return h('div', [
          h('button', { onClick: () => { this.theme = 'dark' } }, 'Change theme'),
          h(DailyRevenueChart, {
            rows: [
              { date: '2026-10-01', revenue: 12.5 },
              { date: '2026-10-02', revenue: 0 },
            ],
            currency: 'USD',
            theme: this.theme,
          }),
        ])
      },
    })
    const wrapper = mount(Harness)

    await wrapper.vm.$nextTick()
    expect(chartMock.init).toHaveBeenCalledTimes(1)
    const initialOptions = chartMock.instance.setOption.mock.calls[0]?.[0] as {
      xAxis: { data: string[] }
      series: Array<{ data: number[] }>
    }
    expect(initialOptions.xAxis.data).toEqual(['2026-10-01', '2026-10-02'])
    expect(initialOptions.series[0]?.data).toEqual([12.5, 0])

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(chartMock.init).toHaveBeenLastCalledWith(expect.any(HTMLElement), 'dark')
    expect(chartMock.instance.dispose).toHaveBeenCalledTimes(1)
  })
})
