"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import * as React from "react"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"

export type SidebarProjectsGroup = {
  monthLabel: string
  monthKey: string
  projects: { id: string; name: string; slug: string }[]
}

export function AppSidebar({
  sidebarProjects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  sidebarProjects: { groups: SidebarProjectsGroup[] }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavProjects groups={sidebarProjects.groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
