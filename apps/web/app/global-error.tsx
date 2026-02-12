"use client"

import "@workspace/ui/globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased bg-background text-foreground font-sans">
        <div className="flex min-h-dvh flex-col items-center justify-center px-4">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <h1 className="text-lg font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A critical error occurred. Please try again or refresh the page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
