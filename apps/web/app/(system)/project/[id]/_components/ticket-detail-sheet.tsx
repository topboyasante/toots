"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { rpc } from "@/lib/orpc"
import type { Ticket } from "./types"
import { STATUS_LABELS } from "./types"
import { KANBAN_STATUSES } from "./types"

const TYPES = ["Story", "Task", "Epic", "Milestone", "Deliverable"]
const PRIORITIES = ["P0", "P1", "P2", "P3"]
const EFFORTS = ["XS", "S", "M", "L", "XL"]

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => String(x))
  return []
}

export type TicketDetailSheetProps = {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (ticket: Ticket) => void
  onDeleted: (id: string) => void
}

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
}: TicketDetailSheetProps) {
  const [editing, setEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [title, setTitle] = useState(ticket.title)
  const [type, setType] = useState(ticket.type)
  const [priority, setPriority] = useState(ticket.priority)
  const [description, setDescription] = useState(ticket.description)
  const [estimatedEffort, setEstimatedEffort] = useState(ticket.estimatedEffort)
  const [status, setStatus] = useState(ticket.status)
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>(asStringArray(ticket.acceptanceCriteria))
  const [dependencies, setDependencies] = useState<string[]>(asStringArray(ticket.dependencies))
  const [labels, setLabels] = useState<string[]>(asStringArray(ticket.labels))

  useEffect(() => {
    if (!open) return
    setTitle(ticket.title)
    setType(ticket.type)
    setPriority(ticket.priority)
    setDescription(ticket.description)
    setEstimatedEffort(ticket.estimatedEffort)
    setStatus(ticket.status)
    setAcceptanceCriteria(asStringArray(ticket.acceptanceCriteria))
    setDependencies(asStringArray(ticket.dependencies))
    setLabels(asStringArray(ticket.labels))
    setEditing(false)
  }, [open, ticket])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await rpc.tickets.update({
        id: ticket.id,
        title,
        type,
        priority,
        description,
        estimatedEffort,
        acceptanceCriteria,
        dependencies,
        labels,
        status: KANBAN_STATUSES.includes(status as "todo" | "in-progress" | "done")
          ? (status as "todo" | "in-progress" | "done")
          : undefined,
      })
      onSaved(updated as Ticket)
      setEditing(false)
      toast.success("Ticket updated")
    } catch {
      toast.error("Failed to update ticket")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await rpc.tickets.delete({ id: ticket.id })
      onDeleted(ticket.id)
      setDeleteDialogOpen(false)
      onOpenChange(false)
      toast.success("Ticket deleted")
    } catch {
      toast.error("Failed to delete ticket")
    } finally {
      setDeleting(false)
    }
  }

  const statusLabel = KANBAN_STATUSES.includes(status as "todo" | "in-progress" | "done")
    ? STATUS_LABELS[status as "todo" | "in-progress" | "done"]
    : status

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg flex flex-col" side="right">
          <SheetHeader>
            <SheetTitle className="pr-8">{editing ? "Edit ticket" : "Ticket details"}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
            {editing ? (
              <>
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KANBAN_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Estimated effort</Label>
                  <Select value={estimatedEffort} onValueChange={setEstimatedEffort}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EFFORTS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Acceptance criteria (one per line)</Label>
                  <Textarea
                    value={acceptanceCriteria.join("\n")}
                    onChange={(e) => setAcceptanceCriteria(e.target.value.split("\n").filter(Boolean))}
                    rows={3}
                    className="resize-none"
                    placeholder="One per line"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Dependencies (comma-separated IDs)</Label>
                  <Input
                    value={dependencies.join(", ")}
                    onChange={(e) => setDependencies(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="ticket-1, ticket-2"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Labels (comma-separated)</Label>
                  <Input
                    value={labels.join(", ")}
                    onChange={(e) => setLabels(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="planning, launch"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Title</p>
                  <p className="font-medium">{ticket.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{ticket.type}</Badge>
                  <Badge variant="outline">{ticket.priority}</Badge>
                  <Badge variant="ghost">{ticket.estimatedEffort}</Badge>
                  <Badge variant="outline">{statusLabel}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                </div>
                {acceptanceCriteria.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Acceptance criteria</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {acceptanceCriteria.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {dependencies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dependencies</p>
                    <div className="flex flex-wrap gap-1">
                      {dependencies.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {labels.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Labels</p>
                    <div className="flex flex-wrap gap-1">
                      {labels.map((l) => (
                        <Badge key={l} variant="secondary" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <SheetFooter className="flex-row gap-2 flex-wrap sm:flex-row">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  Delete
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete ticket?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &quot;{ticket.title}&quot;. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
