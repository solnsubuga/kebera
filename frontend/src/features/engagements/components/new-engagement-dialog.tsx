import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApiError } from '@/lib/api-client'

import { useCreateEngagement } from '../api'
import { FRAMEWORKS, type Framework } from '../types'

export function NewEngagementDialog() {
  const [open, setOpen] = useState(false)
  const [framework, setFramework] = useState<Framework>('ifrs')
  const create = useCreateEngagement()
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      const created = await create.mutateAsync({
        client_name: String(form.get('client_name')).trim(),
        period_start: String(form.get('period_start')),
        period_end: String(form.get('period_end')),
        framework,
      })
      setOpen(false)
      toast.success(`Opened ${created.client_name}`)
      void navigate(`/engagements/${created.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? describe(err) : 'Could not reach the server')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New engagement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New engagement</DialogTitle>
            <DialogDescription>One audit of one client's financial statements.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="client_name">Client</Label>
            <Input id="client_name" name="client_name" required maxLength={200} autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="period_start">Period start</Label>
              <Input id="period_start" name="period_start" type="date" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period_end">Period end</Label>
              <Input id="period_end" name="period_end" type="date" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="framework">Framework</Label>
            <Select value={framework} onValueChange={(v) => setFramework(v as Framework)}>
              <SelectTrigger id="framework" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FRAMEWORKS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Opening…' : 'Open engagement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function describe(err: ApiError) {
  if (Array.isArray(err.detail)) {
    const first = err.detail[0] as { msg?: string } | undefined
    return first?.msg?.replace(/^Value error, /, '') ?? err.message
  }
  return err.message
}
