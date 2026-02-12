"use client"

import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"

export function SettingsContent() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const email = user?.email ?? ""
  const name = user?.name ?? null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      {/* Appearance */}
      <section id="appearance" className="scroll-mt-8">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground mb-4">
          Choose how Toots looks for you.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col divide-y divide-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Theme</p>
              {resolvedTheme && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current: {resolvedTheme}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <Select
                value={theme ?? "system"}
                onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
              >
                <SelectTrigger id="theme" className="w-[180px]">
                  <SelectValue placeholder="System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Account */}
      <section id="account" className="scroll-mt-8">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground mb-4">
          Your account details.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6">
        {isPending ? (
          <div className="flex flex-col divide-y divide-border">
            <div className="h-14 bg-muted/50 animate-pulse rounded" />
            <div className="h-14 bg-muted/50 animate-pulse rounded" />
            <div className="h-14 bg-muted/50 animate-pulse rounded" />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 first:pt-0">
              <p className="text-sm font-medium text-foreground">Email</p>
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <span className="text-sm text-muted-foreground truncate">
                  {email || "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
              <p className="text-sm font-medium text-foreground">Username</p>
              <span className="text-sm text-muted-foreground rounded-md bg-muted/50 px-3 py-2 border border-border w-full sm:max-w-[240px] sm:w-auto">
                {name?.trim() || "—"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Change password
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your password for this account
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <a href="#">Change password</a>
              </Button>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="scroll-mt-8">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Integrations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground mb-4">
          Connect Toots to your project tools to export tickets.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col divide-y divide-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 first:pt-0">
            <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <Image src="/icons/linear.svg" alt="" width={20} height={20} className="size-5 shrink-0" aria-hidden />
              Linear
            </span>
            <span className="text-muted-foreground text-sm shrink-0">
              Coming soon
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 last:pb-0">
            <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <Image src="/icons/jira.svg" alt="" width={20} height={20} className="size-5 shrink-0" aria-hidden />
              Jira
            </span>
            <span className="text-muted-foreground text-sm shrink-0">
              Coming soon
            </span>
          </div>
        </div>
        </div>
      </section>

      {/* Danger zone */}
      <section id="danger" className="scroll-mt-8">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-muted-foreground mb-4">
          Irreversible actions for your account.
        </p>
        <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col divide-y divide-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Delete account
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all projects and tickets.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled className="shrink-0">
              Coming soon
            </Button>
          </div>
        </div>
        </div>
      </section>
    </div>
  )
}
