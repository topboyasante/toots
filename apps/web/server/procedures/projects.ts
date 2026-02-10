import { os } from "@orpc/server"
import { prisma } from "@/lib/db"
import {
  createProjectInput,
  deleteProjectInput,
  getProjectBySlugInput,
  getProjectInput,
  listProjectsInput,
  updateProjectInput,
} from "@/lib/schema/project"

export const listProjects = os.input(listProjectsInput).handler(async ({ input }) => {
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

export const getProject = os.input(getProjectInput).handler(async ({ input }) => {
  const project = await prisma.project.findUnique({
    where: { id: input.id },
  })
  return project
})

export const createProject = os.input(createProjectInput).handler(async ({ input }) => {
  const project = await prisma.project.create({
    data: {
      ...input,
      slug: input.name.toLowerCase().replace(/ /g, "-"),
    },
  })
  return project
})

export const updateProject = os.input(updateProjectInput).handler(async ({ input }) => {
  const project = await prisma.project.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
      slug: input.name.toLowerCase().replace(/ /g, "-"),
    },
  })
  return project
})

export const deleteProject = os.input(deleteProjectInput).handler(async ({ input }) => {
  await prisma.project.delete({
    where: { id: input.id },
  })
  return { success: true }
})

export const getProjectBySlug = os.input(getProjectBySlugInput).handler(async ({ input }) => {
  const project = await prisma.project.findUnique({
    where: { slug: input.slug },
  })
  return project
})

export const projectsRouter = {
  list: listProjects,
  get: getProject,
  create: createProject,
  update: updateProject,
  delete: deleteProject,
  getBySlug: getProjectBySlug,
}
