# Repository guidance

- Keep the host and Store Sales Report remote as separate npm workspaces under `apps/`.
- Keep the federated Vue entry and standalone Web Component build as separate public entry points.
- Keep UI implementation separate from the shared sales data and mock API package.
- Keep shared embedding contracts documented and typed once they are introduced.
- Keep UI contracts separated from backend/model contracts.
- Use TypeScript for app code and Vue single-file components for UI.

## Testing

- Do not test how MSW works although test some mock API handler's contracts

## Verification phase

- No need to verify each time that it works on desktop and laptop screens, from 1024 px to 1440 px wide
