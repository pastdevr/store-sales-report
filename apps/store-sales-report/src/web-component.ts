import { defineCustomElement } from 'vue'
import StoreSalesReportElement from './ReportPlaceholder.ce.vue'

const tagName = 'store-sales-report'

if (!customElements.get(tagName)) {
  customElements.define(tagName, defineCustomElement(StoreSalesReportElement))
}

export { StoreSalesReportElement, tagName }
