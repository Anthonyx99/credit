import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  server: true,
})

describe('simulator page', () => {
  it('renders the simulator sections', async () => {
    const html = await $fetch('/simulateur')

    expect(html).toContain('Simulateur de crédit')
    expect(html).toContain('Paramètres du prêt')
    expect(html).toContain('Capital restant dû')
    expect(html).toContain('Mensualité initiale')
    expect(html).toContain('Injections de capital par année')
  })
})
