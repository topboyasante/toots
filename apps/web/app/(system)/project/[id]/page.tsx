import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import ProjectChat from './components/project-chat';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ idea?: string }>;
};

export default async function ProjectPage({ searchParams }: Props) {
  const { idea } = await searchParams;

  if (!idea) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">No project idea found</h1>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const projectIdea = decodeURIComponent(idea);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Generated Tickets</h1>
          <Link href="/">
            <Button variant="outline">New Project</Button>
          </Link>
        </div>

        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Project Idea
          </h2>
          <p className="text-base">{projectIdea}</p>
        </div>

        <ProjectChat projectIdea={projectIdea} />
      </div>
    </div>
  );
}
