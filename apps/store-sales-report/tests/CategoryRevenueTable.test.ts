import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createWidgetI18n, provideWidgetI18n } from '../src/i18n/widget-i18n'
import CategoryRevenueTable from '../src/components/CategoryRevenueTable.vue'
import type { CategoryRevenue } from '../src/types/report'

const rows: CategoryRevenue[] = [
  { category: 'beverages', revenue: 25, transactionCount: 4, itemsSold: 8 },
  { category: 'snacks', revenue: 12.5, transactionCount: 3, itemsSold: 5 },
]

function mountTable() {
  return mount(defineComponent({
    setup() {
      provideWidgetI18n(createWidgetI18n('en'))
      return () => h(CategoryRevenueTable, { rows, currency: 'USD' })
    },
  }))
}

describe('CategoryRevenueTable', () => {
  it('sorts category rows by revenue in both directions', async () => {
    const wrapper = mountTable()
    const revenueHeader = wrapper.find('button[aria-label="Sort ascending Revenue"]')

    expect(wrapper.find('tbody tr:first-child td:first-child').text()).toBe('Beverages')
    await revenueHeader.trigger('click')
    expect(wrapper.find('tbody tr:first-child td:first-child').text()).toBe('Snacks')
  })

  it('renders localized category names and currency values', async () => {
    const wrapper = mountTable()

    expect(wrapper.text()).toContain('Beverages')
    expect(wrapper.text()).toContain('$25.00')
    expect(wrapper.text()).toContain('Snacks')
  })
})
