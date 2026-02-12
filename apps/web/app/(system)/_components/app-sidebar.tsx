"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { HomeIcon, PlusCircleIcon } from "lucide-react"
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex w-full items-center justify-between">
              <SidebarMenuButton asChild size="lg" tooltip="Toots">
                <Link href="/" className="font-semibold">
                  <HomeIcon />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Toots
                  </span>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="New project">
                <Link href="/">
                  <PlusCircleIcon />
                  <span>New project</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavProjects groups={sidebarProjects.groups} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
