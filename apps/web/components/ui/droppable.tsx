"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

type DroppableProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

function Droppable({ id, children, className }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn("", className, {
        "bg-red-500": isOver,
      })}
    >
      {children}
    </div>
  );
}

export default Droppable;
