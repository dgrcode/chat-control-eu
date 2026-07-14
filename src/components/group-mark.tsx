import type { PoliticalGroup } from '#/data/types.ts'
import { cn } from '#/lib/utils.ts'

export function GroupMark({
  group,
  className,
}: {
  group: PoliticalGroup
  className?: string
}) {
  const fontSize = group.mark.length >= 4 ? 6.25 : 7.5

  return (
    <svg
      viewBox="0 0 28 28"
      role="img"
      aria-label={`${group.shortName} group mark`}
      className={cn('size-7 shrink-0 rounded-[8px] shadow-sm', className)}
    >
      <rect width="28" height="28" rx="8" fill={group.color} />
      <path d="M5 21.5h18" stroke="white" strokeOpacity=".34" />
      <text
        x="14"
        y="16"
        fill="white"
        fontSize={fontSize}
        fontFamily="Geist Variable, sans-serif"
        fontWeight="720"
        textAnchor="middle"
        letterSpacing="-.25"
      >
        {group.mark}
      </text>
    </svg>
  )
}
