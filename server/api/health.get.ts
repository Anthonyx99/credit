export default defineEventHandler((): HealthStatus => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
})
