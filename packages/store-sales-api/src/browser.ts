export async function startMockApi(): Promise<void> {
  if (import.meta.env.DEV) {
    const { worker } = await import('./worker')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}
