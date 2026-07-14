import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { Link } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  BookOpenText,
  ChevronDown,
  Filter,
  ListFilter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import type {
  ChatControlDataset,
  MepRecord,
  PoliticalGroup,
  VoteRecord,
  VoteStatusKind,
} from '#/data/types.ts'
import { filterMeps } from '#/data/filter.ts'
import { CountryPicker, GroupPicker } from '#/components/filter-pickers.tsx'
import { GroupMark } from '#/components/group-mark.tsx'
import {
  AttendanceCoverageNote,
  StatusBadge,
  StatusLegend,
  statusPresentation,
} from '#/components/status-badge.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'

type VoteFilters = Partial<Record<string, VoteStatusKind[]>>
const virtualRowHeight = 66.4
const initialVirtualizerRect = { width: 1280, height: 640 }

export function VoteMatrix({ dataset }: { dataset: ChatControlDataset }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [groupId, setGroupId] = useState('')
  const [voteFilters, setVoteFilters] = useState<VoteFilters>({})
  const [hydrated, setHydrated] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => setHydrated(true), [])

  const groupById = useMemo(
    () => new Map(dataset.groups.map((group) => [group.id, group])),
    [dataset.groups],
  )

  const availableStatuses = useMemo(() => {
    return Object.fromEntries(
      dataset.votes.map((vote) => [
        vote.id,
        Array.from(
          new Set(dataset.meps.map((mep) => mep.votes[vote.id]?.kind)),
        ).filter((kind): kind is VoteStatusKind => Boolean(kind)),
      ]),
    )
  }, [dataset.meps, dataset.votes])

  const legendStatuses = useMemo(
    () =>
      (Object.keys(statusPresentation) as VoteStatusKind[]).filter((kind) =>
        dataset.meps.some((mep) =>
          Object.values(mep.votes).some((choice) => choice.kind === kind),
        ),
      ),
    [dataset.meps],
  )

  const filteredMeps = useMemo(() => {
    return filterMeps(dataset.meps, {
      query,
      country,
      groupId,
      votes: voteFilters,
    })
  }, [country, dataset.meps, groupId, query, voteFilters])

  const activeFilterCount =
    Number(Boolean(query)) +
    Number(Boolean(country)) +
    Number(Boolean(groupId)) +
    Object.values(voteFilters).filter((values) => values?.length).length

  useEffect(() => {
    if (tableScrollRef.current) tableScrollRef.current.scrollTop = 0
  }, [filteredMeps])

  const resetFilters = () => {
    setQuery('')
    setCountry('')
    setGroupId('')
    setVoteFilters({})
  }

  const setVoteStatusFilter = (
    voteId: string,
    values: VoteStatusKind[],
  ) => {
    setVoteFilters((current) => ({ ...current, [voteId]: values }))
  }

  return (
    <section
      aria-labelledby="matrix-heading"
      className="pb-16"
      data-hydrated={hydrated ? 'true' : 'false'}
    >
      <div className="page-shell">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">The voting matrix</p>
            <h2 id="matrix-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              One row per MEP. One column per vote.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Red means the MEP advanced the scanning measure. Green means they
              opposed it. The ballot guide explains how each raw vote maps to
              that privacy direction.
            </p>
          </div>
          <div className="text-sm tabular-nums text-muted-foreground">
            Showing <strong className="font-semibold text-foreground">{filteredMeps.length.toLocaleString()}</strong>{' '}
            of {dataset.meps.length.toLocaleString()} people
          </div>
        </div>

        <BallotGuide votes={dataset.votes} />

        <div className="filter-panel mt-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            Filter MEPs
          </div>
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap">
            <div className="relative min-w-64 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search an MEP or national party…"
                aria-label="Search MEP name or national party"
                className="h-10 bg-card pl-9"
              />
            </div>
            <CountryPicker
              countries={dataset.countries}
              value={country}
              onChange={setCountry}
            />
            <GroupPicker
              groups={dataset.groups}
              value={groupId}
              onChange={setGroupId}
            />
            {activeFilterCount > 0 ? (
              <Button
                variant="ghost"
                className="h-10 text-muted-foreground"
                onClick={resetFilters}
              >
                <RotateCcw />
                Clear {activeFilterCount}
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Political group means the current European Parliament group. Historical
            group membership per ballot is not yet available in the joined dataset.
          </p>
        </div>

        <div className="matrix-frame mt-4">
          <div className="matrix-scroller" ref={tableScrollRef}>
            <table
              className="vote-table"
              aria-rowcount={filteredMeps.length + 1}
            >
              <caption className="sr-only">
                European Parliament Chat Control vote record by MEP and voting session
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="mep-column">
                    <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Member
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-foreground">
                      MEP
                    </span>
                  </th>
                  {dataset.votes.map((vote) => (
                    <th scope="col" key={vote.id} className="vote-column">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <time
                            dateTime={vote.date}
                            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                          >
                            {vote.dateLabel}
                          </time>
                          <span className="mt-1 block text-sm font-semibold leading-tight text-foreground">
                            {vote.shortTitle}
                          </span>
                        </div>
                        <VoteFilterButton
                          vote={vote}
                          available={availableStatuses[vote.id] ?? []}
                          selected={voteFilters[vote.id] ?? []}
                          onChange={(values) =>
                            setVoteStatusFilter(vote.id, values)
                          }
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <VirtualizedTableBody
                meps={filteredMeps}
                votes={dataset.votes}
                groupById={groupById}
                scrollElementRef={tableScrollRef}
              />
            </table>
            {filteredMeps.length === 0 ? (
              <div className="grid min-h-72 place-items-center p-8 text-center">
                <div>
                  <ListFilter className="mx-auto size-7 text-muted-foreground" />
                  <h3 className="mt-3 font-semibold">No MEPs match these filters</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Clear one or more filters to widen the result.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>
                    <RotateCcw /> Clear filters
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="matrix-hint">
            <span>Scroll horizontally to compare every vote</span>
            <span>Click any MEP for their full record</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Privacy-direction key
            </p>
            <StatusLegend kinds={legendStatuses} />
            <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
              This color classification describes the measure’s effect, not the
              literal button pressed. On a motion to reject, raw “for” can mean
              opposing chat scanning.
            </p>
          </div>
          <AttendanceCoverageNote />
        </div>
      </div>
    </section>
  )
}

function VirtualizedTableBody({
  meps,
  votes,
  groupById,
  scrollElementRef,
}: {
  meps: MepRecord[]
  votes: VoteRecord[]
  groupById: ReadonlyMap<string, PoliticalGroup>
  scrollElementRef: RefObject<HTMLDivElement | null>
}) {
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: meps.length,
    estimateSize: () => virtualRowHeight,
    getScrollElement: () => scrollElementRef.current,
    getItemKey: (index) => meps[index]?.slug ?? index,
    initialRect: initialVirtualizerRect,
    overscan: 8,
  })
  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <tbody
      data-rendered-row-count={virtualRows.length}
      data-total-row-count={meps.length}
      style={{
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {virtualRows.map((virtualRow) => {
        const mep = meps[virtualRow.index]
        const group = groupById.get(mep.currentGroupId)

        return (
          <tr
            key={mep.slug}
            aria-rowindex={virtualRow.index + 2}
            data-last-row={virtualRow.index === meps.length - 1 || undefined}
            data-row-index={virtualRow.index}
            style={{
              display: 'flex',
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            <th scope="row" className="mep-column mep-cell">
              <Link
                to="/meps/$mepId"
                params={{ mepId: mep.slug }}
                className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {group ? <GroupMark group={group} /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-signal">
                    {mep.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground">
                    <span aria-hidden="true">{mep.countryFlag}</span>
                    <span className="truncate">{mep.country}</span>
                    {!mep.isCurrentMep ? <span>· Former MEP</span> : null}
                  </span>
                </span>
              </Link>
            </th>
            {votes.map((vote) => (
              <td key={vote.id} className="vote-column">
                <StatusBadge
                  choice={mep.votes[vote.id]}
                  vote={vote}
                  compact
                />
              </td>
            ))}
          </tr>
        )
      })}
    </tbody>
  )
}

function BallotGuide({ votes }: { votes: VoteRecord[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="ballot-guide" data-open={open ? 'true' : 'false'}>
      <button
        type="button"
        className="ballot-guide-trigger"
        aria-expanded={open}
        aria-controls="ballot-guide-content"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2">
          <BookOpenText className="size-4" />
          <span>
            <strong>Open ballot guide: what raw FOR and AGAINST meant</strong>
            <span className="ml-2 hidden font-normal text-muted-foreground sm:inline">
              Raw FOR and AGAINST do not always point in the same privacy direction.
            </span>
          </span>
        </span>
        <ChevronDown className="ballot-guide-chevron size-4" />
      </button>
      {open ? (
      <div
        id="ballot-guide-content"
        className="divide-y divide-border border-t border-border"
      >
        {votes.map((vote) => {
          const rawAgainstKind = vote.rawForKind === 'support' ? 'oppose' : 'support'
          return (
            <article
              key={vote.id}
              className="grid gap-3 px-4 py-4 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:px-5"
            >
              <div>
                <time
                  dateTime={vote.date}
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {vote.dateLabel}
                </time>
                <h3 className="mt-1 text-sm font-semibold">{vote.shortTitle}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {vote.motionSummary}
                </p>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Result: {vote.rawResult}
                </p>
              </div>
              <DirectionExplanation
                rawDirection="Raw FOR"
                meaning={vote.rawForMeaning}
                kind={vote.rawForKind}
              />
              <DirectionExplanation
                rawDirection="Raw AGAINST"
                meaning={vote.rawAgainstMeaning}
                kind={rawAgainstKind}
              />
            </article>
          )
        })}
      </div>
      ) : null}
    </div>
  )
}

function DirectionExplanation({
  rawDirection,
  meaning,
  kind,
}: {
  rawDirection: string
  meaning: string
  kind: Extract<VoteStatusKind, 'support' | 'oppose'>
}) {
  const presentation = statusPresentation[kind]
  const Icon = presentation.icon

  return (
    <div className="rounded-xl border border-border bg-background/55 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {rawDirection}
        </span>
        <span className={`status-badge ${presentation.className}`}>
          <Icon aria-hidden="true" />
          {presentation.shortLabel}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed">{meaning}</p>
    </div>
  )
}

export function VoteFilterButton({
  vote,
  available,
  selected,
  onChange,
}: {
  vote: VoteRecord
  available: VoteStatusKind[]
  selected: VoteStatusKind[]
  onChange: (values: VoteStatusKind[]) => void
}) {
  const statusOrder: VoteStatusKind[] = [
    'support',
    'oppose',
    'abstain',
    'present-no-vote',
    'not-recorded-present',
    'unknown-no-vote',
    'not-mep',
  ]
  const ordered = statusOrder.filter((kind) => available.includes(kind))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={selected.length ? 'default' : 'ghost'}
          size={selected.length ? 'sm' : 'icon-sm'}
          className="-mt-1 shrink-0"
          aria-label={`Filter ${vote.shortTitle} by vote status${
            selected.length ? `, ${selected.length} active` : ''
          }`}
        >
          <Filter />
          {selected.length ? (
            <span
              aria-hidden="true"
              className="grid size-4 place-items-center rounded-full bg-signal text-[9px] font-bold leading-none text-white"
            >
              {selected.length}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Show rows where this vote was</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onChange([])}>
          <ListFilter />
          All statuses
          {!selected.length ? <span className="ml-auto text-xs">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ordered.map((kind) => {
          const presentation = statusPresentation[kind]
          const Icon = presentation.icon
          return (
            <DropdownMenuCheckboxItem
              key={kind}
              checked={selected.includes(kind)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => {
                onChange(
                  checked
                    ? [...selected, kind]
                    : selected.filter((selectedKind) => selectedKind !== kind),
                )
              }}
            >
              <Icon />
              {presentation.label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
