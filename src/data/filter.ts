import type { MepRecord, VoteStatusKind } from './types.ts'
import { normalizeSearch } from '#/lib/utils.ts'

export interface MepFilters {
  query?: string
  country?: string
  groupId?: string
  votes?: Partial<Record<string, VoteStatusKind[]>>
}

export function filterMeps(meps: MepRecord[], filters: MepFilters) {
  const normalizedQuery = normalizeSearch(filters.query?.trim() ?? '')

  return meps.filter((mep) => {
    if (
      normalizedQuery &&
      !normalizeSearch(`${mep.name} ${mep.nationalParty}`).includes(
        normalizedQuery,
      )
    ) {
      return false
    }
    if (filters.country && mep.country !== filters.country) return false
    if (filters.groupId && mep.currentGroupId !== filters.groupId) return false

    return Object.entries(filters.votes ?? {}).every(([voteId, kinds]) => {
      if (!kinds?.length) return true
      const choice = mep.votes[voteId]
      return choice ? kinds.includes(choice.kind) : false
    })
  })
}
