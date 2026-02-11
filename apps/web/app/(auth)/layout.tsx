import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  if (session?.user != null) redirect("/")
  return <>{children}</>
}
