import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}))

import type { ChatControlDataset, VoteRecord } from '#/data/types.ts'
import {
  emailAddressesFromValue,
  firstXUrlFromValue,
  xHandleFromUrl,
  xHandlesFromValue,
} from '#/data/contacts.ts'
import { VoteFilterButton, VoteMatrix } from '#/components/vote-matrix.tsx'
import { TooltipProvider } from '#/components/ui/tooltip.tsx'

const vote: VoteRecord = {
  id: 'test-vote',
  date: '2026-07-09',
  dateLabel: '9 Jul 2026',
  shortTitle: 'Amended rejection',
  title: 'Test vote',
  procedure: 'Test procedure',
  rawResult: 'Test result',
  normalizedMapping: 'Test mapping',
  motionSummary: 'Test summary',
  rawForMeaning: 'Test for meaning',
  rawAgainstMeaning: 'Test against meaning',
  rawForKind: 'support',
  primarySources: [],
  structuredSources: [],
}

describe('VoteFilterButton', () => {
  it('keeps the active count inline with the filter control', () => {
    const markup = renderToStaticMarkup(
      <VoteFilterButton
        vote={vote}
        available={['support', 'oppose']}
        selected={['support']}
        onChange={() => undefined}
      />,
    )

    expect(markup).toContain(
      'aria-label="Filter Amended rejection by vote status, 1 active"',
    )
    expect(markup).toContain('>1</span>')
    expect(markup).not.toContain('-top-1')
    expect(markup).not.toContain('-right-1')
  })
})

describe('VoteMatrix', () => {
  it('applies the shared vote-column width contract to virtualized body cells', () => {
    const dataset: ChatControlDataset = {
      votes: [vote],
      countries: [
        { name: 'Austria', code: 'AT', flag: '🇦🇹', mepCount: 1 },
      ],
      groups: [
        {
          id: 'epp',
          name: "European People's Party",
          shortName: 'EPP',
          mark: 'EPP',
          color: '#1769aa',
        },
      ],
      meps: [
        {
          slug: 'test-mep',
          name: 'Test MEP',
          country: 'Austria',
          countryCode: 'AT',
          countryFlag: '🇦🇹',
          nationalParty: 'Test party',
          currentGroup: 'EPP',
          currentGroupId: 'epp',
          isCurrentMep: true,
          email: 'test.mep@europarl.europa.eu',
          twitterUrl: 'https://x.com/testmep; https://x.com/secondtestmep',
          profileUrl: null,
          profileLabel: 'European Parliament profile',
          votes: { [vote.id]: { kind: 'support', raw: 'FOR' } },
        },
      ],
    }

    const markup = renderToStaticMarkup(
      <TooltipProvider>
        <VoteMatrix
          dataset={dataset}
          filters={{}}
          onFiltersChange={() => undefined}
        />
      </TooltipProvider>,
    )
    const bodyMarkup = markup.slice(markup.indexOf('<tbody'))
    const headerMarkup = markup.slice(0, markup.indexOf('<tbody'))

    expect(headerMarkup).toContain(
      'aria-label="Copy 2 X handles for 1 filtered MEP"',
    )
    expect(headerMarkup).toContain(
      'aria-label="Copy 1 email address for 1 filtered MEP"',
    )
    expect(bodyMarkup).toContain('<td class="vote-column">')
    expect(bodyMarkup).toContain('aria-label="Open Test MEP on X"')
    expect(bodyMarkup).toContain('href="https://x.com/testmep"')
    expect(bodyMarkup).toContain('target="_blank"')
    expect(bodyMarkup).toContain('aria-label="Email Test MEP"')
    expect(bodyMarkup).toContain(
      'href="mailto:test.mep@europarl.europa.eu"',
    )
    expect(bodyMarkup).toMatch(
      /href="mailto:test\.mep@europarl\.europa\.eu"[^>]*target="_blank"/,
    )
    expect(bodyMarkup.indexOf('Open Test MEP on X')).toBeLessThan(
      bodyMarkup.indexOf('Email Test MEP'),
    )
  })
})

describe('contact copy values', () => {
  it('extracts X handles from profile, status, and login redirect URLs', () => {
    expect(xHandleFromUrl('https://x.com/testmep')).toBe('@testmep')
    expect(xHandleFromUrl('https://twitter.com/testmep/status/123')).toBe(
      '@testmep',
    )
    expect(
      xHandleFromUrl(
        'https://x.com/i/flow/login?redirect_after_login=%2Fredirectedmep',
      ),
    ).toBe('@redirectedmep')
  })

  it('extracts and deduplicates handles from compound X values', () => {
    const value =
      'https://x.com/herranzgarcia1; https://x.com/EstherHerranz8'

    expect(xHandlesFromValue(value)).toEqual([
      '@herranzgarcia1',
      '@EstherHerranz8',
    ])
    expect(firstXUrlFromValue(value)).toBe(
      'https://x.com/herranzgarcia1',
    )
    expect(
      xHandlesFromValue(
        'https://www.twitter.com/ALMA_EZCURRA/; https://x.com/alma_ezcurra',
      ),
    ).toEqual(['@ALMA_EZCURRA'])
  })

  it('copies every listed email while allowing the badge to count the MEP once', () => {
    expect(
      emailAddressesFromValue(
        'first@europarl.europa.eu; mailto:second@europarl.europa.eu',
      ),
    ).toEqual([
      'first@europarl.europa.eu',
      'second@europarl.europa.eu',
    ])
  })
})
