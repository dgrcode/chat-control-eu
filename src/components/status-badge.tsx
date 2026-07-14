import {
  Ban,
  Check,
  CircleHelp,
  Clock3,
  Minus,
  UserCheck,
  UserRoundX,
  X,
  type LucideIcon,
} from 'lucide-react'

import type { VoteChoice, VoteRecord, VoteStatusKind } from '#/data/types.ts'
import { cn } from '#/lib/utils.ts'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip.tsx'

interface StatusPresentation {
  label: string
  shortLabel: string
  description: string
  className: string
  icon: LucideIcon
}

export const statusPresentation: Record<VoteStatusKind, StatusPresentation> = {
  support: {
    label: 'Advanced scanning',
    shortLabel: 'Advanced scanning',
    description:
      'Normalized as advancing, enabling, extending, or retaining the chat-scanning measure.',
    className: 'status-support',
    icon: Check,
  },
  oppose: {
    label: 'Opposed scanning',
    shortLabel: 'Opposed scanning',
    description:
      'Normalized as opposing the chat-scanning measure or supporting a motion that rejected it.',
    className: 'status-oppose',
    icon: X,
  },
  abstain: {
    label: 'Abstained',
    shortLabel: 'Abstained',
    description: 'Cast an abstention in the official roll call.',
    className: 'status-abstain',
    icon: Minus,
  },
  'present-no-vote': {
    label: 'Present, no vote',
    shortLabel: 'Present · no vote',
    description:
      'Named in the sitting attendance register, with no recorded vote on this ballot.',
    className: 'status-present',
    icon: UserCheck,
  },
  'not-recorded-present': {
    label: 'Not recorded present',
    shortLabel: 'Not recorded',
    description:
      'No recorded vote and not named in the sitting attendance register. This does not establish physical absence or its reason.',
    className: 'status-not-recorded',
    icon: UserRoundX,
  },
  'unknown-no-vote': {
    label: 'Unknown non-vote',
    shortLabel: 'Unknown',
    description:
      'No recorded vote; an equivalent attendance cross-check is not yet available.',
    className: 'status-unknown',
    icon: CircleHelp,
  },
  'not-mep': {
    label: 'Not an MEP',
    shortLabel: 'Not an MEP',
    description: 'The person was not serving as an MEP for this voting session.',
    className: 'status-not-mep',
    icon: Ban,
  },
}

export function StatusBadge({
  choice,
  vote,
  compact = false,
  className,
}: {
  choice: VoteChoice
  vote?: VoteRecord
  compact?: boolean
  className?: string
}) {
  const presentation = statusPresentation[choice.kind]
  const Icon = presentation.icon
  const rawDirection = vote
    ? choice.kind === vote.rawForKind
      ? 'FOR'
      : choice.kind === 'support' || choice.kind === 'oppose'
        ? 'AGAINST'
        : choice.kind === 'abstain'
          ? 'ABSTAIN'
          : null
    : null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'status-badge',
            presentation.className,
            compact && 'status-badge-compact',
            className,
          )}
          tabIndex={0}
        >
          <Icon aria-hidden="true" />
          <span>{compact ? presentation.shortLabel : presentation.label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="block font-semibold">{presentation.label}</span>
        <span className="mt-0.5 block opacity-80">{presentation.description}</span>
        {rawDirection ? (
          <span className="mt-1 block font-semibold">
            Recorded roll-call direction: {rawDirection}
          </span>
        ) : null}
        <span className="mt-1 block font-mono text-[10px] opacity-65">
          Dataset classification: {choice.raw}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

export function StatusLegend({ kinds }: { kinds?: VoteStatusKind[] }) {
  const visibleKinds =
    kinds ?? (Object.keys(statusPresentation) as VoteStatusKind[])
  return (
    <div className="flex flex-wrap gap-2">
      {visibleKinds.map((kind) => {
        const item = statusPresentation[kind]
        const Icon = item.icon
        return (
          <span key={kind} className={cn('status-badge', item.className)}>
            <Icon aria-hidden="true" />
            {item.shortLabel}
          </span>
        )
      })}
    </div>
  )
}

export function AttendanceCoverageNote() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-muted/55 p-3 text-xs leading-relaxed text-muted-foreground">
      <Clock3 className="mt-0.5 size-4 shrink-0 text-foreground" />
      <p>
        Every unresolved non-vote is matched against the official attendance
        register for the same sitting. “Not recorded present” is not proof of
        physical absence or its reason.
      </p>
    </div>
  )
}
