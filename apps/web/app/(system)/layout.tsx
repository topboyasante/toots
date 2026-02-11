import { auth } from "@/lib/auth"
import { rpc } from "@/lib/orpc"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "./_components/app-sidebar"

export default async function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  if (session?.user == null) redirect("/login")
  const sidebarProjects =
    session?.user != null
      ? await rpc.projects.listForSidebar({ limit: 20 })
      : { groups: [] }

  return (
    <SidebarProvider>
      <AppSidebar sidebarProjects={sidebarProjects} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
