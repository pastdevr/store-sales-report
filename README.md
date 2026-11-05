# Host and a Store Sales Report widget

This workspace contains a Vue 3 + TypeScript host and a localized Store Sales Report remote built with Vite and Module Federation. The report is also available as a standalone Web Component. Both entry points use the shared MSW mock API during development.

## Requirements

- Node.js 22+
- npm 10+

## Run locally

```sh
npm install
npm run dev
```

The host runs at `http://localhost:5173` and the remote at `http://localhost:4174`. The host loads the remote's `./vue` exposure. Both servers should be running to see the sample report in the host. The plain HTML Web Component demo is at `http://localhost:4174/web-component-demo.html`. In development, MSW intercepts `/api/stores/{storeId}/sales` in both apps.

To build the host, federated remote, and standalone Web Component bundle:

```sh
npm run build
```

To serve the built host and remote locally:

```sh
npm run preview
```

## Run the production demo with Docker Compose

With Docker Engine and the Compose plugin installed, build and start the production host and federated remote:

```sh
docker compose up --build
```

Open `http://localhost:8080` to see the host page with the embedded report. Compose serves the host on port 8080 and the remote on port 8081. The host fetches the remote manifest from `http://localhost:8081/mf-manifest.json`; the remote static server allows cross-origin module loading. The production host bundle enables the MSW mock API for this self-contained demo. Stop the containers with `Ctrl+C` (or run `docker compose down` in another shell).

## Embedding to external consumers

### Native Vue component

The package provides a standalone Vue entry for applications that install it from npm:

```ts
import StoreSalesReport from '@store-sales-report/widget/vue'
import '@store-sales-report/widget/vue.css'
```

```vue
<script setup lang="ts">
import StoreSalesReport from 'storeSalesReport/vue'

function onDataLoaded(response: unknown) { /* update host state */ }
function onLoadError(error: unknown) { /* show host-level status */ }
function onFiltersChange(filters: unknown) { /* synchronize host filters */ }
</script>

<template>
  <StoreSalesReport
    store-id="S-1042"
    language="en"
    :from="'2026-10-01'"
    :to="'2026-10-30'"
    theme="light"
    @data-loaded="onDataLoaded"
    @load-error="onLoadError"
    @filters-change="onFiltersChange"
  />
</template>
```

`storeId` is required. `language` defaults to English; `from` and `to` default to the latest 30 calendar days; `theme` defaults to light. Settings remain reactive after mount. The widget keeps its internal selection when users change the language or filters.

### Plain HTML

Install the standalone Web Component package and import its registration entry:

> `@store-sales-report` is a provisional npm scope in this project. Change the package name and examples to the publisher's npm scope before publishing.

```sh
npm install @store-sales-report/widget
```

```js
import '@store-sales-report/widget/web-component'
```

The package registers `<store-sales-report>`. In a bundled app, use the package import. For a plain static HTML page, copy `node_modules/@store-sales-report/widget/dist-web-component/store-sales-report.js` into the site's static assets and load it as a module:

```html
<store-sales-report store-id="S-2048" language="fr" from="2026-10-01" to="2026-10-30" theme="dark"></store-sales-report>
<script type="module" src="/assets/web-component.js"></script>
<script type="module">
  document.querySelector('store-sales-report')?.addEventListener('data-loaded', (event) => {
    console.log(event.detail) // StoreSalesResponse object
  })
</script>
```

## Tests

Run the handler contract, calculation, component, table, chart, and embed-event tests with:

```sh
npm test
```
