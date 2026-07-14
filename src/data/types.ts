export const voteStatusKinds = [
  'support',
  'oppose',
  'abstain',
  'present-no-vote',
  'not-recorded-present',
  'unknown-no-vote',
  'not-mep',
] as const

export type VoteStatusKind = (typeof voteStatusKinds)[number]

export interface SourceLink {
  label: string
  url: string
}

export interface VoteChoice {
  kind: VoteStatusKind
  raw: string
}

export interface VoteRecord {
  id: string
  date: string
  dateLabel: string
  shortTitle: string
  title: string
  procedure: string
  rawResult: string
  normalizedMapping: string
  motionSummary: string
  rawForMeaning: string
  rawAgainstMeaning: string
  rawForKind: Extract<VoteStatusKind, 'support' | 'oppose'>
  primarySources: SourceLink[]
  structuredSources: SourceLink[]
}

export interface PoliticalGroup {
  id: string
  name: string
  shortName: string
  mark: string
  color: string
}

export interface CountryRecord {
  name: string
  code: string
  flag: string
  mepCount: number
}

export interface MepRecord {
  slug: string
  name: string
  country: string
  countryCode: string
  countryFlag: string
  nationalParty: string
  currentGroup: string
  currentGroupId: string
  isCurrentMep: boolean
  email: string | null
  twitterUrl: string | null
  profileUrl: string | null
  profileLabel: string
  votes: Record<string, VoteChoice>
}

export interface ChatControlDataset {
  votes: VoteRecord[]
  meps: MepRecord[]
  countries: CountryRecord[]
  groups: PoliticalGroup[]
}
