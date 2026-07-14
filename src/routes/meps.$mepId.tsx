import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'

import dataset from 'virtual:chat-control-data'
import { GroupMark } from '#/components/group-mark.tsx'
import {
  AttendanceCoverageNote,
  StatusBadge,
  statusPresentation,
} from '#/components/status-badge.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Button } from '#/components/ui/button.tsx'

export const Route = createFileRoute('/meps/$mepId')({
  loader: ({ params }) => {
    const mep = dataset.meps.find((candidate) => candidate.slug === params.mepId)
    if (!mep) throw notFound()
    return mep
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? 'MEP'} · Chat Control Vote Record` },
      {
        name: 'description',
        content: loaderData
          ? `Chat Control vote history and public contact routes for ${loaderData.name}, ${loaderData.country}.`
          : 'MEP Chat Control vote record.',
      },
    ],
  }),
  component: MepDetailPage,
})

function MepDetailPage() {
  const mep = Route.useLoaderData()
  const group = dataset.groups.find((candidate) => candidate.id === mep.currentGroupId)

  return (
    <main className="min-h-[calc(100vh-8rem)]">
      <div className="page-shell py-8 sm:py-12">
        <Button variant="ghost" asChild className="-ml-3 text-muted-foreground">
          <Link to="/">
            <ArrowLeft /> Back to all MEPs
          </Link>
        </Button>

        <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="detail-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={mep.isCurrentMep ? 'default' : 'secondary'}>
                {mep.isCurrentMep ? 'Current MEP' : 'Former MEP'}
              </Badge>
              <Badge variant="outline">{mep.countryFlag} {mep.country}</Badge>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              {mep.name}
            </h1>
            <div className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <DetailFact icon={MapPin} label="Country" value={`${mep.countryFlag} ${mep.country}`} />
              <DetailFact icon={Users} label="National party" value={mep.nationalParty} />
              <div className="sm:col-span-2">
                <p className="detail-label">Current EP group</p>
                <div className="mt-2 flex items-center gap-3">
                  {group ? <GroupMark group={group} /> : null}
                  <div>
                    <p className="text-sm font-semibold">{group?.shortName ?? mep.currentGroup}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {mep.currentGroup}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="detail-card p-6">
            <p className="eyebrow">Public contact routes</p>
            <div className="mt-5 space-y-3">
              {mep.email ? (
                <ContactLink href={`mailto:${mep.email}`} icon={Mail} label="Email" value={mep.email} />
              ) : (
                <UnavailableContact icon={Mail} label="Email not publicly listed" />
              )}
              {mep.twitterUrl ? (
                <ContactLink
                  href={mep.twitterUrl}
                  icon={ExternalLink}
                  label="X / Twitter"
                  value={twitterLabel(mep.twitterUrl)}
                  external
                />
              ) : (
                <UnavailableContact icon={ExternalLink} label="X / Twitter not EP-listed" />
              )}
              {mep.profileUrl ? (
                <ContactLink
                  href={mep.profileUrl}
                  icon={ShieldCheck}
                  label="Official EP profile"
                  value="Open profile"
                  external
                />
              ) : (
                <UnavailableContact icon={ShieldCheck} label={mep.profileLabel} />
              )}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
              Only public professional contact routes from reviewed sources are shown.
            </p>
          </aside>
        </section>

        <section className="mt-8" aria-labelledby="vote-history-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Ballot-by-ballot record</p>
              <h2 id="vote-history-heading" className="mt-2 text-2xl font-semibold tracking-tight">
                Vote history
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">{dataset.votes.length} material plenary votes</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
            {dataset.votes.map((vote, index) => (
              <article
                key={vote.id}
                className="grid gap-4 border-border p-5 not-last:border-b sm:grid-cols-[11rem_minmax(0,1fr)_12rem] sm:items-center sm:p-6"
              >
                <div>
                  <time dateTime={vote.date} className="detail-label">
                    {vote.dateLabel}
                  </time>
                  <p className="mt-1 text-sm font-semibold">{vote.shortTitle}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{vote.procedure}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-relaxed">{vote.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {vote.motionSummary}
                  </p>
                  <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
                    <VoteDirectionLine
                      direction="Raw FOR"
                      meaning={vote.rawForMeaning}
                      normalized={statusPresentation[vote.rawForKind].label}
                      className={statusPresentation[vote.rawForKind].className}
                    />
                    <VoteDirectionLine
                      direction="Raw AGAINST"
                      meaning={vote.rawAgainstMeaning}
                      normalized={
                        statusPresentation[
                          vote.rawForKind === 'support' ? 'oppose' : 'support'
                        ].label
                      }
                      className={
                        statusPresentation[
                          vote.rawForKind === 'support' ? 'oppose' : 'support'
                        ].className
                      }
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {vote.primarySources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="source-link"
                      >
                        {source.label} <ExternalLink />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="sm:justify-self-end">
                  <StatusBadge choice={mep.votes[vote.id]} vote={vote} />
                  {index === 0 && !mep.isCurrentMep ? (
                    <p className="mt-2 max-w-44 text-[10px] leading-relaxed text-muted-foreground sm:text-right">
                      Current status and historical ballot membership are shown separately.
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 max-w-xl">
          <AttendanceCoverageNote />
        </div>
      </div>
    </main>
  )
}

function VoteDirectionLine({
  direction,
  meaning,
  normalized,
  className,
}: {
  direction: string
  meaning: string
  normalized: string
  className: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {direction}
        </span>
        <span className={`status-badge ${className}`}>{normalized}</span>
      </div>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{meaning}</p>
    </div>
  )
}

function DetailFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div>
      <p className="detail-label flex items-center gap-1.5"><Icon className="size-3.5" /> {label}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed">{value}</p>
    </div>
  )
}

function ContactLink({
  href,
  icon: Icon,
  label,
  value,
  external = false,
}: {
  href: string
  icon: typeof Mail
  label: string
  value: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="contact-link"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
        <span className="mt-0.5 block truncate text-xs font-medium">{value}</span>
      </span>
    </a>
  )
}

function UnavailableContact({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="text-xs leading-relaxed">{label}</span>
    </div>
  )
}

function twitterLabel(url: string) {
  try {
    const pathname = new URL(url).pathname.split('/').filter(Boolean)[0]
    return pathname ? `@${pathname}` : 'Open profile'
  } catch {
    return 'Open profile'
  }
}
