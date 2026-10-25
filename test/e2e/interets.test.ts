import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  server: true,
})

describe('interest page', () => {
  it('renders the comparison sections', async () => {
    const html = await $fetch('/interets')

    expect(html).toContain('Rembourser ou placer')
    expect(html).toContain('Rendement net du placement')
    expect(html).toContain('Taux d’indifférence')
    expect(html).toContain('Écart de patrimoine')
    expect(html).toContain('Détail mois par mois')
  })
})
