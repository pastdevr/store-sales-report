import type {
  ReportLocale,
  ReportTheme,
  StoreSalesReportEventDetails,
} from '../src/types/report'

export type {
  ReportLocale,
  ReportTheme,
  StoreSalesReportEventDetails,
  StoreSalesReportProps,
} from '../src/types/report'

export declare const tagName: 'store-sales-report'
export declare class StoreSalesReportElement extends HTMLElement {
  storeId: string
  language?: ReportLocale
  from?: string
  to?: string
  theme?: ReportTheme

  addEventListener<EventName extends keyof StoreSalesReportEventDetails>(
    type: EventName,
    listener: (this: StoreSalesReportElement, event: CustomEvent<StoreSalesReportEventDetails[EventName]>) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
}

declare global {
  interface HTMLElementTagNameMap {
    'store-sales-report': StoreSalesReportElement
  }
}
