import {
  voteStatusKinds,
  type MepRecord,
  type VoteStatusKind,
} from './types.ts'
import { normalizeSearch } from '#/lib/utils.ts'

export type VoteFilters = Partial<Record<string, VoteStatusKind[]>>

export interface MepFilters {
  query?: string
  country?: string
  groupId?: string
  votes?: VoteFilters
}

const voteStatusKindSet = new Set<VoteStatusKind>(voteStatusKinds)
const voteStatusKindOrder = new Map(
  voteStatusKinds.map((kind, index) => [kind, index]),
)

export function parseVoteFilters(
  value: unknown,
  allowedVoteIds?: ReadonlySet<string>,
): VoteFilters {
  if (typeof value !== 'string' || !value) return {}

  const filters: VoteFilters = {}

  for (const entry of value.split(';')) {
    const separatorIndex = entry.indexOf(':')
    if (separatorIndex < 1) continue

    const voteId = entry.slice(0, separatorIndex)
    if (allowedVoteIds && !allowedVoteIds.has(voteId)) continue

    const kinds = Array.from(
      new Set(
        entry
          .slice(separatorIndex + 1)
          .split(',')
          .filter((kind): kind is VoteStatusKind =>
            voteStatusKindSet.has(kind as VoteStatusKind),
          ),
      ),
    )

    if (kinds.length) filters[voteId] = kinds
  }

  return filters
}

export function serializeVoteFilters(filters: VoteFilters | undefined) {
  return Object.entries(filters ?? {})
    .filter((entry): entry is [string, VoteStatusKind[]] =>
      Boolean(entry[1]?.length),
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([voteId, kinds]) => {
      const sortedKinds = Array.from(new Set(kinds)).sort(
        (left, right) =>
          (voteStatusKindOrder.get(left) ?? 0) -
          (voteStatusKindOrder.get(right) ?? 0),
      )
      return `${voteId}:${sortedKinds.join(',')}`
    })
    .join(';')
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
