# Note for reviewers

## Time spent

Approximately 5 hours of implementation and verification to date, including the report, host/remote integration, and publishable Web Component package with production deployment using Docker.

## AI usage

- store original task assignment to provide context

- start in plan mode
    ```text
    let scaffold the web app with Vue 3, TypeScript and Module Federation plugin with VIte
    host will be embedding a Store Sales Report widget, host can be empty placeholder at the start
    let a Store Sales Report be a remote which in the end will expose the report as Vue component and Web Component separately (thing about different export paths)

    use [TASK_ASSIGNMENT.md](TASK_ASSIGNMENT.md) if necessary for functional and non-functional requirements

    skip deployment part and widget implementation
    ```

- all features implemented with AI (Codex, GPT-6 Luna)

- maintain `AGENTS.md` with some basic rules
    - especially make it clear to avoid some requirements from task source that may delay every prompt/command invocation (for example, make sure works on desktop and laptop sizes)
    - what not to test
    - project workspaces structure, etc

- example of promt to refactor `StoreSalesReport.vue` component
    - purpose avoid busines logic placement in utils; consolide business logic inside one "feature" composable; introduce API resource layer
    - prompt
        ```text
            currently we have [useStoreSales.ts](apps/store-sales-report/src/composables/useStoreSales.ts) as composable to work with store sales API, wrapper around http client
            it then used in [StoreSalesReport.vue](apps/store-sales-report/src/components/StoreSalesReport.vue) component directly

            can we switch to the following architecture useStoreSales composable becomes useStoreSalesApi, while sales state is managed inside new useStoreSales composable
            utils [sales-aggregation.ts](apps/store-sales-report/src/utils/sales-aggregation.ts) moves to new composable

            then [StoreSalesReport.vue](apps/store-sales-report/src/components/StoreSalesReport.vue) referencing new component for using sales and reacting to updates
        ``` 

## Implementation notes

> The plain HTML Web Component demo is at `http://localhost:4174/web-component-demo.html` and is outside of task scope. I've added it to test Web Component variant locally.

### Trade-offs

- Monorepo based on npm workspaces helps to structure the project boundaries.
- Module Federation is used on purpose (I can predict some scenarios how report can be used in real app as part of host app serving different micro-frontends).
- MSW provides a great experience for API level mocking during local development; the mock API provides 1,000 generated transactions for each sample store.
- The report uses VueUse `useFetch` with an abortable request; an embedded production host must serve the documented API contract.
- ECharts is registered through modular imports to keep the chart bundle limited to its required chart, components, and renderer. TanStack Vue Table supplies headless category sorting.
- Each widget instance owns its locale composer, filters, fetch state, chart, and table state. The Web Component puts the same Vue implementation and styles in Shadow DOM.
- The app workspace builds and publishes two package subpaths from the same widget source: a self-contained Web Component and a Vue library entry.

### Next steps

- Connect the real sales service to the existing endpoint contract and confirm its authentication/CORS requirements.
- The report widget itself is quite complex and thus we can justify http client and query managed inside but I would question this once it integrated in other app.
- Run browser-based accessibility and integration checks in the consuming host, particularly around chart screen-reader support and multiple widget instances (it is important because we need to test web component variant after publishing npm package, it can function differently from dev env).
- Publish widgets to npm public/private registry.
