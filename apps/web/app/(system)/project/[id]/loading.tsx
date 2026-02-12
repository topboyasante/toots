import { Skeleton } from "@workspace/ui/components/skeleton"

export default function ProjectLoading() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden p-6">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="mb-3 flex shrink-0 items-center justify-end">
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((col) => (
            <div
              key={col}
              className="flex min-w-[280px] flex-1 flex-col rounded-xl border border-border bg-muted/40"
            >
              <div className="shrink-0 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-6 rounded" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
