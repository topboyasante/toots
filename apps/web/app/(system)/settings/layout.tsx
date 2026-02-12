"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

const NAV_ITEMS = [
  { href: "#appearance", label: "Appearance" },
  { href: "#account", label: "Account" },
  { href: "#integrations", label: "Integrations" },
  { href: "#danger", label: "Danger zone" },
] as const

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSettings = pathname === "/settings"

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-8 px-4">
      {/* Side nav: visible on large screens */}
      <nav
        className={cn(
          "shrink-0 lg:w-52",
          "hidden lg:block"
        )}
        aria-label="Settings"
      >
        <div className="sticky top-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={isSettings ? item.href : `/settings${item.href}`}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-2xl">
        {children}
      </main>
    </div>
  )
}
