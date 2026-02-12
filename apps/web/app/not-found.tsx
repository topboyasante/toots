import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <p className="text-6xl font-semibold tracking-tight text-foreground">
          404
        </p>
        <h1 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
