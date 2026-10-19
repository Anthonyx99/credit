import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoanSummary from '~/components/LoanSummary.vue'

describe('LoanSummary', () => {
  it('renders the key indicators', async () => {
    const component = await mountSuspended(LoanSummary)
    const text = component.text()

    expect(text).toContain('Mensualité initiale')
    expect(text).toContain('Intérêts totaux')
    expect(text).toContain('Total remboursé')
    expect(text).toContain('€')
  })
})
