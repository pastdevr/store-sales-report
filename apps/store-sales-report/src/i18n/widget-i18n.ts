import { inject, provide, type InjectionKey } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from './messages'
import type { ReportLocale } from '../types/report'

export function normalizeLocale(locale: string | undefined): ReportLocale {
  return locale === 'es' || locale === 'fr' ? locale : 'en'
}

export function createWidgetI18n(initialLocale: ReportLocale) {
  const instance = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: 'en',
    messages,
    globalInjection: false,
  })

  return {
    locale: instance.global.locale,
    t: instance.global.t.bind(instance.global) as (key: string) => string,
    setLocale(locale: ReportLocale) {
      instance.global.locale.value = locale
    },
  }
}

export type WidgetI18n = ReturnType<typeof createWidgetI18n>
const widgetI18nKey: InjectionKey<WidgetI18n> = Symbol('store-sales-report-i18n')

export function provideWidgetI18n(i18n: WidgetI18n): void {
  // Every report instance provides its own composer to its child components.
  provide(widgetI18nKey, i18n)
}

export function useWidgetI18n(): WidgetI18n {
  const i18n = inject(widgetI18nKey)
  if (!i18n) throw new Error('Widget i18n context is missing.')
  return i18n
}
