import { Skeleton } from "@workspace/ui/components/skeleton"
import { SidebarMenuSkeleton } from "@workspace/ui/components/sidebar"

export default function SystemLoading() {
  return (
    <div className="flex h-dvh w-full">
      {/* Sidebar skeleton */}
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2 rounded-md p-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="flex flex-col gap-1 p-2">
          <div className="flex items-center gap-2 rounded-md p-2">
            <Skeleton className="size-4 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="flex flex-1 flex-col gap-1 p-2">
          <Skeleton className="h-4 w-16 px-2" />
          <div className="mt-1 flex flex-col gap-1">
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
          </div>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="p-2">
          <div className="flex items-center gap-2 rounded-md p-2">
            <Skeleton className="aspect-square size-8 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        </div>
      </aside>
      {/* Main content skeleton */}
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="flex flex-1 items-center justify-center p-8">
          <Skeleton className="h-32 w-full max-w-md rounded-lg" />
        </div>
      </main>
    </div>
  )
}
