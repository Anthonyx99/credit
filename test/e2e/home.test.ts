import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  server: true,
})

describe('home page', () => {
  it('renders the home page', async () => {
    const html = await $fetch('/')

    expect(html).toContain('Bienvenue')
  })
})
