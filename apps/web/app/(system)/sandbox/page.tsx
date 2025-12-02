"use client";
import Draggable from "@/components/ui/draggable";
import Droppable from "@/components/ui/droppable";
import { DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import React, { useState } from "react";

function Sandbox() {
  const draggables = [
    { id: "draggable-1" },
    { id: "draggable-2" },
    { id: "draggable-3" },
  ];

  const droppables = [
    { id: "droppable-1", className: "bg-blue-400" },
    { id: "droppable-2", className: "bg-yellow-400" },
    { id: "droppable-3", className: "bg-orange-400" },
  ];

  // parents is a record, where the key is the draggable's ID,
  // and the corresponding value is the droppable's ID where the draggable currently is
  const [parents, setParents] = useState<Record<string, UniqueIdentifier>>(
    () => {
      // the function takes each element in draggables, create a key-value pair
      // where the key is the draggable's ID and the value is "droppable-1"
      return draggables.reduce(
        (acc, draggable) => {
          acc[draggable.id] = "droppable-1";
          return acc;
        },
        {} as Record<string, UniqueIdentifier>
      );
    }
  );

  // parents initially is:
  //{draggable-1: 'droppable-1', draggable-2: 'droppable-1', draggable-3: 'droppable-1'}

  function handleDragEnd(event: DragEndEvent) {
    //active is the dragged item
    //over is the droppable area where the item is dropped
    const { active, over } = event;

    if (over) {
      setParents((prev) => ({
        ...prev,
        // add a new key-value pair where the key is the dragged item's ID
        // and the value is the droppable area's ID where the item is dropped
        [active.id]: over.id,
      }));
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4 p-4">
        {droppables.map((droppable) => (
          <Droppable
            key={droppable.id}
            id={droppable.id}
            className={`${droppable.className} min-h-32 flex flex-col gap-2 items-center justify-center rounded-lg p-4`}
          >
            {draggables
              .filter((draggable) => parents[draggable.id] === droppable.id)
              .map((draggable) => (
                <Draggable
                  key={draggable.id}
                  id={draggable.id}
                  className="bg-green-500 p-4 rounded"
                >
                  {draggable.id}
                </Draggable>
              ))}
            {draggables.filter((d) => parents[d.id] === droppable.id).length ===
              0 && "Drop here"}
          </Droppable>
        ))}
      </div>
    </DndContext>
  );
}

export default Sandbox;
