import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";

type DraggableProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

function Draggable({ id, children, className }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button ref={setNodeRef} style={style} className={cn(className)} {...listeners} {...attributes}>
      {children}
    </button>
  );
}

export default Draggable;
