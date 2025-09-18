import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Candidate, Stage } from '../types';
import DndCandidateCard from './DndCandidateCard';

interface KanbanColumnProps {
  stage: Stage;
  candidates: Candidate[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, candidates }) => {
  // Make the entire column a drop zone
  const { setNodeRef } = useDroppable({ id: stage });
  
  return (
    <div className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0">
      <h3 className="font-semibold text-md text-gray-700 mb-4 capitalize flex justify-between items-center">
        {stage}
        <span className="text-sm bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
          {candidates.length}
        </span>
      </h3>

      {/* This context tells dnd-kit what items are in this column */}
      <SortableContext
        id={stage}
        items={candidates.map(c => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          {candidates.map(candidate => (
            <DndCandidateCard key={candidate.id} candidate={candidate} />
          ))}
          {candidates.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-4">
              Drop candidates here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;