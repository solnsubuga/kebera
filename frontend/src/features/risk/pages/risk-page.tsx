import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { BRAND } from '@/lib/brand'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SignLine, SourceChip } from '@/components/tickmark'

import { PlanningTabs } from '@/features/plan/components/planning-tabs'

import { HitStrip, HitLegend } from '../components/hit-strip'
import { ScoreBar } from '../components/score-bar'
import { BRAINSTORM, FRAUD_RISKS, RATING_LABEL, RISK_AREAS, type Rating } from '../sample-data'

const RATINGS: Rating[] = ['significant', 'elevated', 'normal']

const balance = new Intl.NumberFormat('en-GB')

export function RiskPage() {
  const { id = '' } = useParams()
  const [ratings, setRatings] = useState<Record<string, Rating | undefined>>(() =>
    Object.fromEntries(RISK_AREAS.map((a) => [a.id, a.rating])),
  )
  const rated = RISK_AREAS.filter((a) => ratings[a.id]).length
  const allRated = rated === RISK_AREAS.length

  function acceptRest() {
    setRatings((r) => Object.fromEntries(RISK_AREAS.map((a) => [a.id, r[a.id] ?? a.suggested])))
  }

  return (
    <>
      <PlanningTabs id={id} />

      <div className="bg-ground flex flex-1 flex-wrap items-start gap-5 px-6 py-5">
        <section className="flex min-w-0 flex-[3_1_900px] flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Where could the statements be wrong?</h1>
              <p className="text-ink-muted mt-1 text-sm">
                {BRAND} ranked {RISK_AREAS.length} areas and marked which assertions each risk hits. You set the final
                rating.
              </p>
            </div>
            <HitLegend />
          </div>

          <Card className="gap-0 overflow-x-auto py-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-ink-muted border-rule border-b text-left text-xs whitespace-nowrap">
                  <th className="px-3 py-2 font-medium">Area</th>
                  <th className="px-3 py-2 text-right font-medium">Balance</th>
                  <th className="px-3 py-2 font-medium">{BRAND} score</th>
                  <th className="px-3 py-2 font-medium">E · C · R · V · Ct · P</th>
                  <th className="px-3 py-2 font-medium">Response {BRAND} plans</th>
                  <th className="px-3 py-2 font-medium">Your rating</th>
                </tr>
              </thead>
              <tbody>
                {RISK_AREAS.map((a) => (
                  <tr key={a.id} className="border-rule-soft border-b last:border-b-0">
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{a.area}</div>
                      <div className="text-ink-muted text-xs">
                        {a.note} {a.source && <SourceChip>{a.source.label}</SourceChip>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                      {balance.format(a.balanceM)}m
                    </td>
                    <td className="px-3 py-2.5">
                      <ScoreBar value={a.score} />
                    </td>
                    <td className="px-3 py-2.5">
                      <HitStrip hits={a.hits} label={a.area} />
                    </td>
                    <td className="px-3 py-2.5">{a.response}</td>
                    <td className="px-3 py-2.5">
                      <Select
                        value={ratings[a.id] ?? ''}
                        onValueChange={(v) => setRatings((r) => ({ ...r, [a.id]: v as Rating }))}
                      >
                        <SelectTrigger size="sm" aria-label={`Your rating for ${a.area}`} className="min-w-32">
                          <SelectValue placeholder="Choose" />
                        </SelectTrigger>
                        <SelectContent>
                          {RATINGS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {RATING_LABEL[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-ink-muted text-xs">
            Score = how much this area looks like areas where errors were found before, from {BRAND}'s model and this
            year's analytics. It says where to look first. It is not evidence.
          </p>
        </section>

        <Card className="flex min-w-0 flex-[1_1_300px] flex-col gap-0 px-[18px] py-4">
          <h2 className="text-ink-muted pb-1 text-[13px] font-semibold">Fraud risks · ISA 240</h2>
          <ul>
            {FRAUD_RISKS.map((f) => (
              <li key={f.id} className="border-rule-soft flex gap-2.5 border-b py-3 text-[13px] leading-normal">
                <HitStrip hits={{ E: 'H' }} only="!" label={f.title} />
                <div>
                  <span className="font-medium">{f.title}</span>
                  {f.detail} <SourceChip>{f.source.label}</SourceChip>
                </div>
              </li>
            ))}
            <li className="flex gap-2.5 py-3 text-[13px]">
              <button type="button" className="text-ink-muted flex gap-2.5 text-left hover:underline">
                <HitStrip hits={{}} only="+" label="Add" />
                Add a fraud risk from the team's brainstorm
              </button>
            </li>
          </ul>
          <div className="bg-ground text-ink-muted mt-2 rounded-lg p-3 text-[12.5px]">
            {BRAINSTORM.text} <SourceChip>{BRAINSTORM.source.label}</SourceChip>
          </div>
        </Card>
      </div>

      <SignLine
        sticky
        actions={
          <>
            {!allRated && (
              <Button variant="secondary" onClick={acceptRest}>
                Accept {BRAND}'s ratings for the rest
              </Button>
            )}
            <Button asChild>
              <Link to={`/engagements/${id}/plan`}>Draft the plan</Link>
            </Button>
          </>
        }
      >
        {allRated
          ? `All ${RISK_AREAS.length} areas rated. ${BRAND} drafts the plan from this matrix.`
          : `${rated} of ${RISK_AREAS.length} areas rated. Rate the rest, then ${BRAND} drafts the plan from this matrix.`}
      </SignLine>
    </>
  )
}
