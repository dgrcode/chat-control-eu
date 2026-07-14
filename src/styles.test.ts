import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

describe('vote matrix column sizing', () => {
  it('lets vote columns absorb spare row width without shrinking below their baseline', () => {
    expect(styles).toMatch(
      /\.vote-column\s*{[^}]*flex:\s*1 0 10\.75rem;[^}]*min-width:\s*10\.75rem;/s,
    )
    expect(styles).toMatch(
      /@media \(max-width: 640px\)[\s\S]*\.vote-column\s*{[^}]*flex-basis:\s*10rem;[^}]*min-width:\s*10rem;/,
    )
    expect(styles).not.toMatch(/\.vote-column\s*{[^}]*max-width:/s)
  })
})
