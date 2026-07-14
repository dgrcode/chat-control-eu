import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import type { CountryRecord, PoliticalGroup } from '#/data/types.ts'
import { normalizeSearch } from '#/lib/utils.ts'
import { GroupMark } from '#/components/group-mark.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'

export function CountryPicker({
  countries,
  value,
  onChange,
}: {
  countries: CountryRecord[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = countries.find((country) => country.name === value)
  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query)
    return countries.filter((country) =>
      normalizeSearch(country.name).includes(normalized),
    )
  }, [countries, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-48 justify-between bg-card px-3"
          aria-label="Filter by country"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-base">{selected?.flag ?? '🇪🇺'}</span>
            <span className="truncate">{selected?.name ?? 'All countries'}</span>
          </span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a country…"
            className="pl-8"
          />
        </div>
        <div className="max-h-72 space-y-0.5 overflow-y-auto">
          <PickerButton
            selected={!value}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            <span className="text-base">🇪🇺</span>
            <span className="flex-1">All countries</span>
          </PickerButton>
          {filtered.map((country) => (
            <PickerButton
              key={country.name}
              selected={country.name === value}
              onClick={() => {
                onChange(country.name)
                setOpen(false)
              }}
            >
              <span className="text-base">{country.flag}</span>
              <span className="flex-1">{country.name}</span>
              <span className="text-xs text-muted-foreground">{country.mepCount}</span>
            </PickerButton>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function GroupPicker({
  groups,
  value,
  onChange,
}: {
  groups: PoliticalGroup[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = groups.find((group) => group.id === value)
  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query)
    return groups.filter((group) =>
      normalizeSearch(`${group.shortName} ${group.name}`).includes(normalized),
    )
  }, [groups, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-52 justify-between bg-card px-3"
          aria-label="Filter by current European Parliament group"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected ? (
              <GroupMark group={selected} className="size-6 rounded-md" />
            ) : (
              <span className="grid size-6 place-items-center rounded-md bg-ink text-[9px] font-bold text-paper">
                EP
              </span>
            )}
            <span className="truncate">{selected?.shortName ?? 'All EP groups'}</span>
          </span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an EP group…"
            className="pl-8"
          />
        </div>
        <div className="max-h-80 space-y-0.5 overflow-y-auto">
          <PickerButton
            selected={!value}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            <span className="grid size-7 place-items-center rounded-lg bg-ink text-[9px] font-bold text-paper">
              EP
            </span>
            <span className="flex-1">All EP groups</span>
          </PickerButton>
          {filtered.map((group) => (
            <PickerButton
              key={group.id}
              selected={group.id === value}
              onClick={() => {
                onChange(group.id)
                setOpen(false)
              }}
            >
              <GroupMark group={group} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{group.shortName}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {group.name}
                </span>
              </span>
            </PickerButton>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PickerButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {children}
      <Check
        className={`size-4 shrink-0 ${selected ? 'opacity-100' : 'opacity-0'}`}
      />
    </button>
  )
}
