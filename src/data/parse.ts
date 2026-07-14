import type {
  ChatControlDataset,
  CountryRecord,
  MepRecord,
  PoliticalGroup,
  SourceLink,
  VoteChoice,
  VoteRecord,
  VoteStatusKind,
} from './types.ts'

const voteColumns = [
  {
    header: '6 Jul 2021',
    id: '2021-07-06-final-adoption',
    shortTitle: 'Initial regulation',
    motionSummary:
      'Created the temporary ePrivacy derogation that allowed providers to voluntarily scan private communications for CSAM.',
    rawForMeaning: 'Adopt the temporary scanning derogation.',
    rawAgainstMeaning: 'Reject the temporary scanning derogation.',
    rawForKind: 'support',
  },
  {
    header: '7 Feb 2024 mandate',
    id: '2024-02-07-negotiation-mandate',
    shortTitle: 'Extension mandate',
    motionSummary:
      'Authorized Parliament to enter negotiations on extending the temporary scanning derogation. This was a negotiating mandate, not final adoption.',
    rawForMeaning: 'Advance negotiations to extend the derogation.',
    rawAgainstMeaning: 'Reject the extension negotiating mandate.',
    rawForKind: 'support',
  },
  {
    header: '10 Apr 2024',
    id: '2024-04-10-extension-adoption',
    shortTitle: 'Extension adopted',
    motionSummary:
      'Finally adopted the agreement extending the temporary scanning derogation.',
    rawForMeaning: 'Adopt the extension of the derogation.',
    rawAgainstMeaning: 'Reject the extension of the derogation.',
    rawForKind: 'support',
  },
  {
    header: '11 Mar 2026',
    id: '2026-03-11-restricted-extension',
    shortTitle: 'Restricted extension',
    motionSummary:
      'Adopted Parliament’s first-reading position for a more restricted extension of the voluntary detection rules.',
    rawForMeaning: 'Adopt the restricted extension.',
    rawAgainstMeaning: 'Reject the restricted extension.',
    rawForKind: 'support',
  },
  {
    header: '26 Mar 2026',
    id: '2026-03-26-commission-proposal',
    shortTitle: 'Commission proposal',
    motionSummary:
      'Put the Commission’s prolongation proposal to a final vote. Parliament rejected it.',
    rawForMeaning: 'Prolong the voluntary detection derogation.',
    rawAgainstMeaning: 'Reject the proposed prolongation.',
    rawForKind: 'support',
  },
  {
    header: '9 Jul Council rejection',
    id: '2026-07-09-council-rejection',
    shortTitle: 'Council rejection',
    motionSummary:
      'Asked Parliament to reject the Council position. Because this was a rejection motion, a raw FOR vote opposed the scanning measure.',
    rawForMeaning: 'Reject the Council position.',
    rawAgainstMeaning: 'Keep the Council position in play.',
    rawForKind: 'oppose',
  },
  {
    header: '9 Jul amended rejection',
    id: '2026-07-09-amended-rejection',
    shortTitle: 'Amended rejection',
    motionSummary:
      'Asked Parliament to reject its amended, more limited position. A raw FOR vote opposed even that extension; a raw AGAINST vote retained it.',
    rawForMeaning: 'Reject Parliament’s amended extension.',
    rawAgainstMeaning: 'Retain Parliament’s amended extension.',
    rawForKind: 'oppose',
  },
] as const

const countryCodes: Record<string, string> = {
  Austria: 'AT',
  Belgium: 'BE',
  Bulgaria: 'BG',
  Croatia: 'HR',
  Cyprus: 'CY',
  Czechia: 'CZ',
  Denmark: 'DK',
  Estonia: 'EE',
  Finland: 'FI',
  France: 'FR',
  Germany: 'DE',
  Greece: 'GR',
  Hungary: 'HU',
  Ireland: 'IE',
  Italy: 'IT',
  Latvia: 'LV',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  Malta: 'MT',
  Netherlands: 'NL',
  Poland: 'PL',
  Portugal: 'PT',
  Romania: 'RO',
  Slovakia: 'SK',
  Slovenia: 'SI',
  Spain: 'ES',
  Sweden: 'SE',
}

const groupDefinitions: Record<
  string,
  Omit<PoliticalGroup, 'name'>
> = {
  "Group of the European People's Party (Christian Democrats)": {
    id: 'epp',
    shortName: 'EPP',
    mark: 'EPP',
    color: '#1769aa',
  },
  'Group of the Progressive Alliance of Socialists and Democrats in the European Parliament': {
    id: 'sd',
    shortName: 'S&D',
    mark: 'S&D',
    color: '#d62847',
  },
  'Patriots for Europe Group': {
    id: 'pfe',
    shortName: 'PfE',
    mark: 'PfE',
    color: '#243b70',
  },
  'European Conservatives and Reformists Group': {
    id: 'ecr',
    shortName: 'ECR',
    mark: 'ECR',
    color: '#176ca6',
  },
  'Renew Europe Group': {
    id: 'renew',
    shortName: 'Renew',
    mark: 'RE',
    color: '#8b4ca8',
  },
  'Group of the Greens/European Free Alliance': {
    id: 'greens-efa',
    shortName: 'Greens/EFA',
    mark: 'G/E',
    color: '#3d8b37',
  },
  'The Left group in the European Parliament - GUE/NGL': {
    id: 'left',
    shortName: 'The Left',
    mark: 'LEFT',
    color: '#a91d3a',
  },
  'Europe of Sovereign Nations Group': {
    id: 'esn',
    shortName: 'ESN',
    mark: 'ESN',
    color: '#4a4e69',
  },
  'Non-attached Members': {
    id: 'non-attached',
    shortName: 'Non-attached',
    mark: 'NI',
    color: '#737373',
  },
  'not a current MEP': {
    id: 'former',
    shortName: 'Former MEP',
    mark: '—',
    color: '#9a9287',
  },
}

function parseMarkdownRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function tableRows(markdown: string, firstHeader: string): string[][] {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => {
    const cells = line.startsWith('|') ? parseMarkdownRow(line) : []
    return cells[0] === firstHeader
  })

  if (start < 0) {
    throw new Error(`Could not find Markdown table beginning with ${firstHeader}`)
  }

  const rows: string[][] = []
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line?.trim().startsWith('|')) {
      if (rows.length > 0) break
      continue
    }

    const cells = parseMarkdownRow(line)
    const isSeparator = cells.every((cell) => /^:?-{3,}:?$/.test(cell))
    if (!isSeparator) rows.push(cells)
  }

  return rows
}

function markdownLinks(value: string): SourceLink[] {
  return Array.from(value.matchAll(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g)).map(
    ([, label, url]) => ({ label: label ?? url ?? 'Source', url: url ?? '' }),
  )
}

function plainText(value: string): string {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim()
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function flagForCode(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join('')
}

function normalizeDate(date: string): string {
  const match = date.match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/)
  if (!match) return date
  const [, day = '1', month = 'Jan', year = '1970'] = match
  const months: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  }
  return `${year}-${months[month] ?? '01'}-${day.padStart(2, '0')}`
}

export function classifyVoteStatus(rawStatus: string): VoteStatusKind {
  if (rawStatus.startsWith('in favor')) return 'support'
  if (rawStatus.startsWith('against')) return 'oppose'
  if (rawStatus === 'abstained') return 'abstain'
  if (rawStatus === 'no vote — present') return 'present-no-vote'
  if (rawStatus === 'no vote — not recorded present') {
    return 'not-recorded-present'
  }
  if (rawStatus === 'unknown no vote') return 'unknown-no-vote'
  if (rawStatus === 'not an MEP / no record') return 'not-mep'
  throw new Error(`Unrecognized vote status: ${rawStatus}`)
}

function groupForName(name: string): PoliticalGroup {
  const definition = groupDefinitions[name]
  if (definition) return { name, ...definition }

  return {
    id: slugify(name),
    name,
    shortName: name,
    mark: name
      .split(/\s+/)
      .slice(0, 3)
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
    color: '#737373',
  }
}

function parseVotes(ledgerMarkdown: string): VoteRecord[] {
  const rows = tableRows(ledgerMarkdown, 'Date')
  const [, ...dataRows] = rows

  if (dataRows.length !== voteColumns.length) {
    throw new Error(
      `Vote ledger has ${dataRows.length} material votes; expected ${voteColumns.length}`,
    )
  }

  return dataRows.map((row, index) => {
    const display = voteColumns[index]
    if (!display) throw new Error(`Missing display metadata for vote ${index}`)
    const [date = '', procedure = '', title = '', rawResult = '', mapping = '', primary = '', structured = ''] = row

    return {
      id: display.id,
      date: normalizeDate(date),
      dateLabel: date,
      shortTitle: display.shortTitle,
      title: plainText(title),
      procedure: plainText(procedure),
      rawResult: plainText(rawResult),
      normalizedMapping: plainText(mapping),
      motionSummary: display.motionSummary,
      rawForMeaning: display.rawForMeaning,
      rawAgainstMeaning: display.rawAgainstMeaning,
      rawForKind: display.rawForKind,
      primarySources: markdownLinks(primary),
      structuredSources: markdownLinks(structured),
    }
  })
}

function parseMeps(mepMarkdown: string): MepRecord[] {
  const rows = tableRows(mepMarkdown, 'MEP')
  const [headers, ...dataRows] = rows
  if (!headers) throw new Error('MEP table has no header')

  const indexFor = (header: string) => {
    const index = headers.indexOf(header)
    if (index < 0) throw new Error(`MEP table is missing ${header}`)
    return index
  }

  return dataRows.map((row) => {
    const name = row[indexFor('MEP')] ?? ''
    const country = row[indexFor('Country')] ?? ''
    const currentGroup = row[indexFor('Current EP group')] ?? ''
    const nationalParty = row[indexFor('Current national party')] ?? ''
    const emailValue = row[indexFor('Public email if current')] ?? ''
    const twitterValue = row[indexFor('EP-listed X/Twitter if current')] ?? ''
    const profileValue = row[indexFor('Official EP profile/contact')] ?? ''
    const profileLink = markdownLinks(profileValue)[0]
    const epId = profileLink?.url.match(/\/meps\/en\/(\d+)/)?.[1]
    const countryCode = countryCodes[country] ?? 'EU'
    const group = groupForName(currentGroup)
    const votes = Object.fromEntries(
      voteColumns.map((vote) => {
        const raw = row[indexFor(vote.header)] ?? ''
        const choice: VoteChoice = { raw, kind: classifyVoteStatus(raw) }
        return [vote.id, choice]
      }),
    )

    return {
      slug: [epId, slugify(name), slugify(country)].filter(Boolean).join('-'),
      name,
      country,
      countryCode,
      countryFlag: flagForCode(countryCode),
      nationalParty,
      currentGroup,
      currentGroupId: group.id,
      isCurrentMep: currentGroup !== 'not a current MEP',
      email: emailValue.startsWith('mailto:')
        ? emailValue.replace(/^mailto:/, '')
        : null,
      twitterUrl: /^https?:\/\//.test(twitterValue) ? twitterValue : null,
      profileUrl: profileLink?.url ?? null,
      profileLabel: plainText(profileValue),
      votes,
    }
  })
}

export function parseChatControlData(
  mepMarkdown: string,
  ledgerMarkdown: string,
): ChatControlDataset {
  const votes = parseVotes(ledgerMarkdown)
  const meps = parseMeps(mepMarkdown)

  const slugCount = new Set(meps.map((mep) => mep.slug)).size
  if (slugCount !== meps.length) {
    throw new Error('MEP slugs are not unique')
  }

  const groupNames = Array.from(new Set(meps.map((mep) => mep.currentGroup)))
  const groups = groupNames
    .map(groupForName)
    .sort((left, right) => {
      if (left.id === 'former') return 1
      if (right.id === 'former') return -1
      return left.shortName.localeCompare(right.shortName)
    })

  const countryCounts = new Map<string, number>()
  for (const mep of meps) {
    countryCounts.set(mep.country, (countryCounts.get(mep.country) ?? 0) + 1)
  }
  const countries: CountryRecord[] = Array.from(countryCounts.entries())
    .map(([name, mepCount]) => {
      const code = countryCodes[name] ?? 'EU'
      return { name, code, flag: flagForCode(code), mepCount }
    })
    .sort((left, right) => left.name.localeCompare(right.name))

  return { votes, meps, countries, groups }
}
