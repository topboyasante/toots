"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { PlusCircleIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"

export type SidebarProjectsGroup = {
  monthLabel: string
  monthKey: string
  projects: { id: string; name: string }[]
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
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <PlusCircleIcon />
                  <span>New project</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavProjects groups={sidebarProjects.groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
