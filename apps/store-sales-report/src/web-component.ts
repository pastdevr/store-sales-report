import { defineCustomElement } from 'vue'
import StoreSalesReport from './components/StoreSalesReport.vue'
import widgetStyles from './styles/widget.css?inline'

const tagName = 'store-sales-report'
const eventNames = ['data-loaded', 'load-error', 'filters-change'] as const
const VueStoreSalesReportElement = defineCustomElement(StoreSalesReport, {
  shadowRoot: true,
  styles: [widgetStyles],
})

class StoreSalesReportElement extends VueStoreSalesReportElement {
  private forwardingEvent = false

  constructor() {
    super()

    for (const eventName of eventNames) {
      this.addEventListener(eventName, (event) => {
        if (this.forwardingEvent) return

        const vueEvent = event as CustomEvent<unknown[]>
        const detail = Array.isArray(vueEvent.detail) && vueEvent.detail.length === 1
          ? vueEvent.detail[0]
          : vueEvent.detail

        event.stopImmediatePropagation()
        this.forwardingEvent = true
        this.dispatchEvent(new CustomEvent(eventName, {
          detail,
          bubbles: true,
          composed: true,
        }))
        this.forwardingEvent = false
      }, { capture: true })
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
  customElements.define(tagName, StoreSalesReportElement)
}

export { StoreSalesReportElement, tagName }
