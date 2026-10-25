import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InterestSummary from '~/components/InterestSummary.vue'

describe('InterestSummary', () => {
  it('renders the verdict and key indicators', async () => {
    const component = await mountSuspended(InterestSummary)
    const text = component.text()

    expect(text).toContain('Verdict')
    expect(text).toContain('Taux d’indifférence')
    expect(text).toContain('Patrimoine final — rembourser')
    expect(text).toContain('€')
  })
})
