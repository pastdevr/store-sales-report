# Requirements for A Store Sales Report

## The task

Build a **Store Sales Report** widget with Vue 3 and TypeScript. A store owner uses it to see last month's sales at a glance. Other teams will embed it in their own products, so it must work without knowing anything about the page it runs in.

The widget is available in English, Spanish and French.

Stack: Vue 3, TypeScript and Vite. Everything else (state, i18n, UI, charts) is your choice.

## The data

There is no backend. Build a mock module for this endpoint. It responds after a random 300-800 ms delay and fails about 10% of the time.

`GET /api/stores/{storeId}/sales?from=YYYY-MM-DD&to=YYYY-MM-DD`

```json
{
    "storeId": "S-1042",
    "currency": "USD",
    "generatedAt": "2026-10-28T09:15:00Z",
    "transactions": [{
        "id": "T-000001",
        "timestamp": "2026-10-01T08-12:45Z",
        "category": "beverages",
        "paymentMethod": "card",
        "items": 3,
        "total": 12.47
    }]
}
```

- category: beverages, snacks, tobacco, grocery, lottery or household.
- payment method: cash, card, ebt or mobile.
- total: in the store currency, 2 decimals.

Generate about 2,000 transactions over 30 days for at least two stores: one in USD and one in CAD.

## What the store owner needs

- Key figures for the selected period: total revenue, number of transactions, average backet value and items sold
- Daily revenue ove the period, as a chart
- Revenue by category, as a table they can sort
- Filters for the date range (last 30 days by default) and the payment method
- The host page sets the starting language (en, es or fr); the store owner can switch it inside the widget
- It works on desktop and laptop screens, from 1024 px to 1440 px wide

### What the teams embedding it need

- Add it in a few lines: as a Vue component in a Vue app, and as a Web Component (custom element) in a plain HTML page
- Set the store, language, date range and a light or dark theme
- Know when data has loaded, when loading failed and when filters change
- Put several widgets on one page, without them affecting each other or the host page

## What to deliver

Deliver it the way you would hand it to another team:

- `docker compose up` builds the production version and serves it, with a page showing the widget embedded. A minimal static-server container (for example, Nginx) is enough
- The tests you would want before merging; `npm test` runs them
- A README for the teams who will embed your widget: how to add and configure it in Vue and in plain HTML
- A short `NOTES.md` for use: time spent, your key trade-offs, how you used AI tools, and what you would do next
