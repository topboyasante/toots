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
    <div className="p-6">
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
      <h1 className="mt-4 text-xl font-semibold">{project.name}</h1>
      {project.description ? (
        <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
      ) : null}
      <ProjectChat
        project={{
          id: project.id,
          name: project.name,
          description: project.description ?? null,
        }}
      />
    </div>
  )
}
