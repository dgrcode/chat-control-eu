import { createFileRoute } from '@tanstack/react-router'
import { ArrowDownRight, DatabaseZap, Flag, UsersRound } from 'lucide-react'

import dataset from 'virtual:chat-control-data'
import { VoteMatrix } from '#/components/vote-matrix.tsx'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="page-shell py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="eyebrow">EU parliamentary accountability</p>
              <h1 className="hero-title mt-4 max-w-4xl">
                Who voted for <span>Chat Control?</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Seven material plenary votes, normalized by what each ballot
                actually meant. Compare every covered MEP without confusing a
                non-vote, an absence record, or non-membership.
              </p>
              <a
                href="#matrix-heading"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-signal decoration-2 underline-offset-4 hover:text-signal"
              >
                Explore the voting matrix <ArrowDownRight className="size-4" />
              </a>
            </div>
            <div className="hero-note">
              <DatabaseZap className="size-5 text-signal" />
              <p className="mt-4 text-sm font-semibold leading-relaxed">
                Built from European Parliament roll calls, procedure files, and
                official attendance records.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Raw “for” and “against” directions are inverted where the motion’s
                meaning requires it.
              </p>
            </div>
          </div>

          <dl className="mt-12 grid overflow-hidden rounded-2xl border border-border bg-card/75 sm:grid-cols-3">
            <Stat
              icon={UsersRound}
              value={dataset.meps.length.toLocaleString()}
              label="covered MEPs"
            />
            <Stat
              icon={Flag}
              value={dataset.countries.length.toString()}
              label="EU countries"
            />
            <Stat
              icon={DatabaseZap}
              value={dataset.votes.length.toString()}
              label="material votes"
            />
          </dl>
        </div>
      </section>
      <VoteMatrix dataset={dataset} />
    </main>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof UsersRound
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-4 border-border p-5 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0">
      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div>
        <dd className="text-xl font-semibold tabular-nums tracking-tight">{value}</dd>
        <dt className="text-xs text-muted-foreground">{label}</dt>
      </div>
    </div>
  )
}
