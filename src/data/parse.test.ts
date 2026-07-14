import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { classifyVoteStatus, parseChatControlData } from './parse.ts'
import { filterMeps } from './filter.ts'

const mepMarkdown = readFileSync(
  fileURLToPath(
    new URL(
      '../../data/all-meps--2021-to-2026-vote-history-and-contacts.md',
      import.meta.url,
    ),
  ),
  'utf8',
)
const ledgerMarkdown = readFileSync(
  fileURLToPath(new URL('../../sources/vote-ledger.md', import.meta.url)),
  'utf8',
)

describe('chat control data parser', () => {
  const dataset = parseChatControlData(mepMarkdown, ledgerMarkdown)

  it('loads the complete covered record', () => {
    expect(dataset.votes).toHaveLength(7)
    expect(dataset.meps).toHaveLength(1170)
    expect(dataset.countries).toHaveLength(27)
  })

  it('keeps ballot membership separate from attendance', () => {
    const anna = dataset.meps.find((mep) => mep.name === 'Anna STÜRGKH')
    expect(anna?.votes['2021-07-06-final-adoption'].kind).toBe('not-mep')
    expect(anna?.votes['2026-07-09-council-rejection'].kind).toBe(
      'not-recorded-present',
    )
  })

  it('resolves every non-vote against the sitting attendance register', () => {
    const alexander = dataset.meps.find(
      (mep) => mep.name === 'Alexander BERNHUBER',
    )
    expect(alexander?.votes['2024-04-10-extension-adoption'].kind).toBe(
      'present-no-vote',
    )
    expect(
      dataset.meps.flatMap((mep) => Object.values(mep.votes)).filter(
        (choice) => choice.kind === 'unknown-no-vote',
      ),
    ).toHaveLength(0)
  })

  it('records when a raw FOR vote points against the scanning measure', () => {
    const councilRejection = dataset.votes.find(
      (vote) => vote.id === '2026-07-09-council-rejection',
    )
    expect(councilRejection?.rawForKind).toBe('oppose')
    expect(councilRejection?.rawForMeaning).toContain('Reject')
  })

  it('normalizes every supported status label', () => {
    expect(classifyVoteStatus('in favor (mandate)')).toBe('support')
    expect(classifyVoteStatus('against (mandate)')).toBe('oppose')
    expect(classifyVoteStatus('abstained')).toBe('abstain')
    expect(classifyVoteStatus('no vote — present')).toBe('present-no-vote')
    expect(classifyVoteStatus('not an MEP / no record')).toBe('not-mep')
  })

  it('filters across names, countries, groups, and individual votes', () => {
    expect(filterMeps(dataset.meps, { query: 'Anna Stürgkh' })).toHaveLength(1)
    expect(filterMeps(dataset.meps, { country: 'Portugal' })).toHaveLength(49)

    const epp = filterMeps(dataset.meps, { groupId: 'epp' })
    expect(epp.length).toBeGreaterThan(0)
    expect(epp.every((mep) => mep.currentGroupId === 'epp')).toBe(true)

    const commissionOpponents = filterMeps(dataset.meps, {
      votes: { '2026-03-26-commission-proposal': ['oppose'] },
    })
    expect(commissionOpponents.length).toBeGreaterThan(0)
    expect(
      commissionOpponents.every(
        (mep) =>
          mep.votes['2026-03-26-commission-proposal'].kind === 'oppose',
      ),
    ).toBe(true)
  })
})
