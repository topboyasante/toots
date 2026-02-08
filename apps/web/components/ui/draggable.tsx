import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";

type DraggableProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

function Draggable({ id, children, className, onClick }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={cn(className)}
      onClick={onClick}
      type="button"
      {...listeners}
      {...attributes}
    >
      {children}
    </button>
  );
}

export default Draggable;
