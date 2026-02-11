import { prisma } from "@/lib/db"
import {
  createProjectInput,
  deleteProjectInput,
  getProjectInput,
  listProjectsForSidebarInput,
  listProjectsInput,
  updateProjectInput,
} from "@/lib/schema/project"
import { base, protectedBase } from "@/server/context"

export const listProjects = base.input(listProjectsInput).handler(async ({ input }) => {
  const projects = await prisma.project.findMany({
    take: input.limit,
    skip: input.cursor,
    orderBy: {
      createdAt: "desc",
    },
  })

  return {
    items: projects,
    nextCursor: input.cursor + input.limit,
  }
})

export const getProject = base.input(getProjectInput).handler(async ({ input }) => {
  const project = await prisma.project.findUnique({
    where: { id: input.id },
  })
  return project
})

export const createProject = protectedBase.input(createProjectInput).handler(async ({ input, context }) => {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      userId: context.user.id,
    },
  })
  return project
})

export const updateProject = protectedBase.input(updateProjectInput).handler(async ({ input, context }) => {
  const project = await prisma.project.update({
    where: { id: input.id, userId: context.user.id },
    data: {
      name: input.name,
      description: input.description,
    },
  })
  return project
})

export const deleteProject = base.input(deleteProjectInput).handler(async ({ input }) => {
  await prisma.project.delete({
    where: { id: input.id },
  })
  return { success: true }
})

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export const listProjectsForSidebar = protectedBase
  .input(listProjectsForSidebarInput)
  .handler(async ({ input, context }) => {
    const projects = await prisma.project.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: "desc" },
      take: input.limit,
    })
    const byMonth = new Map<string, typeof projects>()
    for (const p of projects) {
      const d = p.createdAt
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`
      if (!byMonth.has(monthKey)) byMonth.set(monthKey, [])
      byMonth.get(monthKey)!.push(p)
    }
    const groups = Array.from(byMonth.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, projs]) => {
        const [yearStr, monthStr] = monthKey.split("-")
        const year = Number(yearStr)
        const month = Number(monthStr ?? 1)
        const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`
        return { monthLabel, monthKey, projects: projs }
      })
    return { groups }
  })

export const projectsRouter = {
  list: listProjects,
  get: getProject,
  create: createProject,
  update: updateProject,
  delete: deleteProject,
  listForSidebar: listProjectsForSidebar,
}
