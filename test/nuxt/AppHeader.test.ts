import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '~/components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders the site name', async () => {
    const component = await mountSuspended(AppHeader)

    expect(component.text()).toContain('Credit')
  })
})
