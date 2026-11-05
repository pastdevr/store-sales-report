export async function startMockApi(): Promise<void> {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK_API === 'true') {
    const { worker } = await import('./worker')
    await worker.start({ onUnhandledFrame: 'bypass' })
  }
}
