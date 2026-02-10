"use client"

import { rpc } from "@/lib/orpc"
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
  projects: { id: string; name: string; slug: string }[]
}

export function NavProjects({ groups }: { groups: SidebarProjectsGroup[] }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()

  async function handleDelete(project: { id: string; slug: string }) {
    try {
      await rpc.projects.delete({ id: project.id })
      if (pathname === `/project/${project.slug}`) {
        router.push("/")
      }
      router.refresh()
    } catch {
      toast.error("Failed to delete project.", {
        description: "Please try again.",
      })
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
                <SidebarMenuButton asChild>
                  <Link href={`/project/${project.slug}`}>
                    <FolderIcon />
                    <span>{project.name}</span>
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
                      <Link href={`/project/${project.slug}`}>
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
                      onClick={() => handleDelete(project)}
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
    </>
  )
}
