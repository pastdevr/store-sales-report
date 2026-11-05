# `@store-sales-report/widget`

Embeddable Store Sales Report Web Component. Import the `web-component` subpath once to register the `<store-sales-report>` element:

> This repository uses `@store-sales-report` as a provisional npm scope. Replace it in `package.json` and these install/import examples with the publisher's npm scope before publishing.

```sh
npm install @store-sales-report/widget
```

```ts
import '@store-sales-report/widget/web-component'
```

```html
<store-sales-report
  store-id="S-1042"
  language="en"
  from="2026-10-01"
  to="2026-10-30"
  theme="light"
></store-sales-report>
```

For a static HTML site without a bundler, copy `node_modules/@store-sales-report/widget/dist-web-component/store-sales-report.js` into the site's static assets and load it using a module script.

`store-id` is required. `language` defaults to `en`; `from` and `to` default to the latest 30 calendar days; and `theme` defaults to `light`. Attributes stay reactive after the element is mounted. Supported languages are English (`en`), Spanish (`es`), and French (`fr`); supported themes are `light` and `dark`.

Listen for `data-loaded`, `load-error`, and `filters-change` events. They bubble across the Shadow DOM boundary and carry one object in `event.detail`.

The package contains a self-contained browser bundle and does not require consumers to install Vue, the report's data workspace, or its chart/table libraries.
