# Store Sales Report scaffold

This workspace contains a minimal Vue 3 + TypeScript host and a Store Sales Report remote built with Vite and Module Federation. The remote currently provides placeholders only; report UI, data, and behavior are intentionally not implemented.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Run locally

```sh
npm install
npm run dev
```

The host runs at `http://localhost:5173` and the remote at `http://localhost:4174`. The host loads the remote's `./vue` exposure. Both servers should be running to see the placeholder in the host.

To build the host, federated remote, and standalone Web Component bundle:

```sh
npm run build
```

To serve the built host and remote locally:

```sh
npm run preview
```

## Embed entry points

### Vue host

The remote exposes a Vue component at `storeSalesReport/vue` through Module Federation. The sample host imports this exposure and renders it as an async component. The host remote manifest URL can be changed with `VITE_STORE_SALES_REMOTE_ENTRY`; it defaults to `http://localhost:4174/mf-manifest.json`.

### Plain HTML

The standalone custom-element script is generated at `apps/store-sales-report/dist-web-component/store-sales-report.js`:

```html
<script type="module" src="/path/to/store-sales-report.js"></script>
<store-sales-report></store-sales-report>
```

The script registers the `store-sales-report` custom element. It currently renders a placeholder and has no configuration attributes or events.
