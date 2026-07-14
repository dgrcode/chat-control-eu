import { readFile, writeFile } from 'node:fs/promises'

const writeChanges = process.argv.includes('--write')

const sittings = [
  {
    date: '2021-07-06',
    dateLabel: '6 July 2021',
    header: '6 Jul 2021',
    textPath: 'tmp/pdfs/attendance-2021-07-06.txt',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-9-2021-07-06-ATT_EN.pdf',
  },
  {
    date: '2024-02-07',
    dateLabel: '7 February 2024',
    header: '7 Feb 2024 mandate',
    textPath: 'tmp/pdfs/attendance-2024-02-07.txt',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-9-2024-02-07-ATT_EN.pdf',
  },
  {
    date: '2024-04-10',
    dateLabel: '10 April 2024',
    header: '10 Apr 2024',
    textPath: 'tmp/pdfs/attendance-2024-04-10.txt',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-9-2024-04-10-ATT_EN.pdf',
  },
  {
    date: '2026-03-11',
    dateLabel: '11 March 2026',
    header: '11 Mar 2026',
    textPath: 'tmp/pdfs/attendance-2026-03-11.txt',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-10-2026-03-11-ATT_EN.pdf',
  },
  {
    date: '2026-03-26',
    dateLabel: '26 March 2026',
    header: '26 Mar 2026',
    textPath: 'tmp/pdfs/attendance-2026-03-26.txt',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-10-2026-03-26-ATT_EN.pdf',
  },
  {
    date: '2026-07-09-council-rejection',
    dateLabel: '9 July 2026',
    ballotLabel: 'Initial motion to reject the Council position',
    header: '9 Jul Council rejection',
    textPath: 'tmp/pdfs/attendance-2026-07-09.txt',
    reportPath: 'sources/attendance-2026-07-09-council-rejection.md',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-10-2026-07-09-ATT_EN.pdf',
  },
  {
    date: '2026-07-09-amended-rejection',
    dateLabel: '9 July 2026',
    ballotLabel: 'Final motion to reject Parliament’s amended position',
    header: '9 Jul amended rejection',
    textPath: 'tmp/pdfs/attendance-2026-07-09.txt',
    reportPath: 'sources/attendance-2026-07-09-amended-rejection.md',
    sourceUrl:
      'https://www.europarl.europa.eu/doceo/document/PV-10-2026-07-09-ATT_EN.pdf',
  },
]

const masterPath = 'data/all-meps--2021-to-2026-vote-history-and-contacts.md'
const currentPath = 'data/meps-current--vote-history-and-contacts.md'

function parseRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function formatRow(cells) {
  return `| ${cells.join(' | ')} |`
}

function tableDetails(markdown) {
  const lines = markdown.split(/\r?\n/)
  const headerIndex = lines.findIndex(
    (line) => line.startsWith('|') && parseRow(line)[0] === 'MEP',
  )
  if (headerIndex < 0) throw new Error('Could not find MEP table')

  const headers = parseRow(lines[headerIndex])
  let endIndex = headerIndex + 2
  while (endIndex < lines.length && lines[endIndex]?.startsWith('|')) {
    endIndex += 1
  }

  return {
    lines,
    headers,
    headerIndex,
    endIndex,
    rows: lines.slice(headerIndex + 2, endIndex).map(parseRow),
  }
}

function normalizeName(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/gi, 'l')
    .replace(/đ/gi, 'd')
    .replace(/ø/gi, 'o')
    .replace(/æ/gi, 'ae')
    .replace(/œ/gi, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function nameSignature(value) {
  return normalizeName(value).split(/\s+/).sort().join(' ')
}

function tokenSimilarity(left, right) {
  const leftTokens = new Set(normalizeName(left).split(/\s+/))
  const rightTokens = new Set(normalizeName(right).split(/\s+/))
  const intersection = Array.from(leftTokens).filter((token) =>
    rightTokens.has(token),
  ).length
  const union = new Set([...leftTokens, ...rightTokens]).size
  return union ? intersection / union : 0
}

function parsePresentNames(text) {
  const presentStart = text.indexOf('Present:')
  const excusedIndex = text.indexOf('Excused:', presentStart)
  const excusedStart = excusedIndex < 0 ? text.length : excusedIndex
  if (presentStart < 0) throw new Error('Attendance text is missing Present section')

  return text
    .slice(presentStart + 'Present:'.length, excusedStart)
    .replace(/\f/g, ' ')
    .replace(/\s+/g, ' ')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

function markdownForClassification(sitting, classifications) {
  const present = classifications.filter((item) => item.status === 'no vote — present')
  const notRecorded = classifications.filter(
    (item) => item.status === 'no vote — not recorded present',
  )
  const byCountry = Map.groupBy(classifications, (item) => item.country)
  const sections = Array.from(byCountry.entries())
    .map(([country, items]) => {
      const rows = items
        .map(
          (item) =>
            `| ${item.name} | ${item.status} | ${item.profile || 'No current EP profile'} |`,
        )
        .join('\n')
      return `## ${country}\n\n| MEP | Classification | Official EP profile |\n| --- | --- | --- |\n${rows}`
    })
    .join('\n\n')

  const ballot = sitting.ballotLabel
    ? `\n\n**Tracked ballot:** ${sitting.ballotLabel}.`
    : ''
  return `# Attendance classification — ${sitting.dateLabel}\n\n**Official source:** [European Parliament attendance register for the ${sitting.dateLabel} sitting](${sitting.sourceUrl}).${ballot}\n\nThis file classifies MEPs with no named roll-call entry in the tracked ballot for this sitting. The attendance register is sitting-level, not a timestamped record of chamber presence at the exact ballot.\n\n- \`no vote — present\`: recorded present for the sitting, but no named vote on the ballot.\n- \`no vote — not recorded present\`: no named vote and not recorded in the official sitting attendance register. This does not establish the reason, including whether an MEP was excused, travelling, or elsewhere.\n\n**Counts:** ${present.length} present / ${notRecorded.length} not recorded present, out of ${classifications.length} no recorded votes.\n\n${sections}\n`
}

function profileCell(row, headers) {
  const value = row[headers.indexOf('Official EP profile/contact')] ?? ''
  return value.startsWith('[') ? value : value.replace(/^former MEP — /, '')
}

const masterMarkdown = await readFile(masterPath, 'utf8')
const master = tableDetails(masterMarkdown)
const nameIndex = master.headers.indexOf('MEP')
const countryIndex = master.headers.indexOf('Country')
const reports = []

for (const sitting of sittings) {
  const voteIndex = master.headers.indexOf(sitting.header)
  if (voteIndex < 0) throw new Error(`Missing vote column: ${sitting.header}`)

  const attendanceText = await readFile(sitting.textPath, 'utf8')
  const presentNames = parsePresentNames(attendanceText)
  const presentBySignature = Map.groupBy(presentNames, nameSignature)
  const duplicateSignatures = Array.from(presentBySignature.entries()).filter(
    ([, names]) => names.length > 1,
  )
  if (duplicateSignatures.length) {
    throw new Error(
      `${sitting.date}: duplicate attendance signatures: ${JSON.stringify(duplicateSignatures)}`,
    )
  }

  const classifications = []
  const nearMatches = []
  for (const row of master.rows) {
    const existingStatus = row[voteIndex]
    if (
      ![
        'unknown no vote',
        'no vote — present',
        'no vote — not recorded present',
      ].includes(existingStatus)
    ) {
      continue
    }
    const name = row[nameIndex]
    const isPresent = presentBySignature.has(nameSignature(name))
    const status = isPresent
      ? 'no vote — present'
      : 'no vote — not recorded present'
    if (existingStatus !== 'unknown no vote' && existingStatus !== status) {
      throw new Error(
        `${sitting.date}: stored status disagrees with attendance register for ${name}: ${existingStatus} vs ${status}`,
      )
    }
    row[voteIndex] = status
    classifications.push({
      name,
      country: row[countryIndex],
      status,
      profile: profileCell(row, master.headers),
    })

    if (!isPresent) {
      const [candidate, score] = presentNames
        .map((presentName) => [presentName, tokenSimilarity(name, presentName)])
        .sort((left, right) => right[1] - left[1])[0] ?? ['', 0]
      if (score >= 0.6) nearMatches.push({ name, candidate, score })
    }
  }

  reports.push({
    sitting,
    attendanceCount: presentNames.length,
    classifications,
    nearMatches,
  })
}

const masterRows = master.rows.map(formatRow)
master.lines.splice(
  master.headerIndex + 2,
  master.endIndex - master.headerIndex - 2,
  ...masterRows,
)
let updatedMaster = master.lines.join('\n')
updatedMaster = updatedMaster.replace(
  /For both 9 July ballots,[^\n]+Earlier non-votes remain `unknown no vote` because they have not yet received equivalent attendance matching\./,
  'Every unresolved non-vote in the seven tracked ballots is matched against the official attendance register for the same sitting. `no vote — present` means recorded present for the sitting; `no vote — not recorded present` does not establish physical absence at the ballot or its reason.',
)

const masterStatusByName = new Map(
  master.rows.map((row) => [
    row[nameIndex],
    {
      march11: row[master.headers.indexOf('11 Mar 2026')],
      march26: row[master.headers.indexOf('26 Mar 2026')],
    },
  ]),
)

const currentMarkdown = await readFile(currentPath, 'utf8')
const current = tableDetails(currentMarkdown)
const currentNameIndex = current.headers.indexOf('MEP')
const currentMarch11 = current.headers.indexOf('11 Mar 2026')
const currentMarch26 = current.headers.indexOf('26 Mar 2026')
for (const row of current.rows) {
  const status = masterStatusByName.get(row[currentNameIndex])
  if (!status) throw new Error(`Current MEP missing from master: ${row[currentNameIndex]}`)
  row[currentMarch11] = status.march11
  row[currentMarch26] = status.march26
}
current.lines.splice(
  current.headerIndex + 2,
  current.endIndex - current.headerIndex - 2,
  ...current.rows.map(formatRow),
)
let updatedCurrent = current.lines.join('\n')
updatedCurrent = updatedCurrent.replace(
  /The two 9 July columns use[^\n]+precise vote\./,
  'All four vote columns use the official sitting attendance register for MEPs with no named roll-call vote. `no vote — not recorded present` means not recorded in that sitting register, not proven physical absence at the precise vote.',
)

for (const report of reports) {
  const present = report.classifications.filter(
    (item) => item.status === 'no vote — present',
  ).length
  const notRecorded = report.classifications.length - present
  console.log(
    `${report.sitting.date}: register ${report.attendanceCount}; non-votes ${report.classifications.length}; present ${present}; not recorded ${notRecorded}`,
  )
  for (const match of report.nearMatches) {
    console.log(
      `  review ${match.name} <> ${match.candidate} (${match.score.toFixed(2)})`,
    )
  }
}

if (writeChanges) {
  await writeFile(masterPath, updatedMaster)
  await writeFile(currentPath, updatedCurrent)
  for (const report of reports) {
    await writeFile(
      report.sitting.reportPath ??
        `sources/attendance-${report.sitting.date}.md`,
      markdownForClassification(report.sitting, report.classifications),
    )
  }
  console.log('Attendance classifications written.')
} else {
  console.log('Dry run only. Re-run with --write to update source and data files.')
}
