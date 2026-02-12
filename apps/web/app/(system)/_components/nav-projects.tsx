"use client"

import { useState } from "react"
import { rpc } from "@/lib/orpc"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  ArrowRightIcon,
  FolderIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

type SidebarProjectsGroup = {
  monthLabel: string
  monthKey: string
  projects: { id: string; name: string }[]
}

export function NavProjects({ groups }: { groups: SidebarProjectsGroup[] }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(project: { id: string }) {
    setDeleting(true)
    try {
      await rpc.projects.delete({ id: project.id })
      setProjectToDelete(null)
      if (pathname === `/project/${project.id}`) {
        router.push("/")
      }
      router.refresh()
    } catch {
      toast.error("Failed to delete project.", {
        description: "Please try again.",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (groups.length === 0) return null

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup
          key={group.monthKey}
          className="group-data-[collapsible=icon]:hidden"
        >
          <SidebarGroupLabel>{group.monthLabel}</SidebarGroupLabel>
          <SidebarMenu>
            {group.projects.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild tooltip={project.name}>
                  <Link href={`/project/${project.id}`} className="transition-colors duration-100">
                    <FolderIcon />
                    <span className="truncate">{project.name}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="aria-expanded:bg-muted"
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem asChild>
                      <Link href={`/project/${project.id}`}>
                        <FolderIcon className="text-muted-foreground" />
                        <span>View Project</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowRightIcon className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setProjectToDelete({ id: project.id, name: project.name })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="text-muted-foreground" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}

      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &quot;{projectToDelete?.name}&quot; and all its tickets and
            messages. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProjectToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => projectToDelete && handleDelete(projectToDelete)}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
