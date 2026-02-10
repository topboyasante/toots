import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import Link from "next/link"
import { rpc } from "@/lib/orpc"
import { notFound } from "next/navigation"
import { ProjectChat } from "./_components/project-chat"

type Props = { params: Promise<{ slug: string }> }

export default async function ProjectBySlugPage({ params }: Props) {
  const { slug } = await params
  const project = await rpc.projects.getBySlug({ slug })

  if (!project) notFound()

  return (
    <div className="flex h-dvh flex-col overflow-hidden p-6">
      <div className="shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6 min-h-0 flex-1 max-w-2xl mx-auto">
        <ProjectChat
          project={{
            id: project.id,
            name: project.name,
            description: project.description ?? null,
          }}
        />
      </div>
    </div>
  )
}
