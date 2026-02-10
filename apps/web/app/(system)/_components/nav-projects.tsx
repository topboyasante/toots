"use client"

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
  FolderIcon,
  MoreHorizontalIcon,
  ArrowRightIcon,
  Trash2Icon,
} from "lucide-react"

type SidebarProjectsGroup = {
  monthLabel: string
  monthKey: string
  projects: { id: string; name: string; slug: string }[]
}

export function NavProjects({ groups }: { groups: SidebarProjectsGroup[] }) {
  const { isMobile } = useSidebar()

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
                  <a href={`/project/${project.slug}`}>
                    <FolderIcon />
                    <span>{project.name}</span>
                  </a>
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
                      <a href={`/project/${project.slug}`}>
                        <FolderIcon className="text-muted-foreground" />
                        <span>View Project</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowRightIcon className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
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
