import type { DefineComponent } from 'vue'
import type {
  StoreSalesReportProps as Props,
  StoreSalesReportVueEmits as VueEmits,
} from '../src/types/report'

export type {
  LoadErrorDetail,
  ReportFilters,
  ReportLocale,
  ReportTheme,
  StoreSalesReportDataLoadedDetail,
  StoreSalesReportEventDetails,
  StoreSalesReportProps,
  StoreSalesReportVueEmits,
} from '../src/types/report'

declare const StoreSalesReport: DefineComponent<
  Props,
  {},
  {},
  {},
  {},
  {},
  {},
  VueEmits
>

export default StoreSalesReport
