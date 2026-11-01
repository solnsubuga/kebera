import { SourceChip } from '@/components/tickmark'

/** Source chips in a row, each opening its evidence. Until there is an evidence viewer they are inert. */
export function Sources({ items }: { items: string[] }) {
  return (
    <>
      {items.map((s) => (
        <span key={s}>
          {' '}
          <SourceChip>{s}</SourceChip>
        </span>
      ))}
    </>
  )
}
