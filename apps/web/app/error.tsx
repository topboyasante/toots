"use client"

import { Button } from "@workspace/ui/components/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred. You can try again or return home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/">Back to home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
