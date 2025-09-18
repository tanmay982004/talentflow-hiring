
import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { Candidate, Stage } from '../types';
import KanbanColumn from './KanbanColumn';
import CandidateCard from './CandidateCard';
import Modal from './ui/Modal'; // 1. Import the Modal component
import NoteForm from './NoteForm';

const STAGES: Stage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

interface KanbanBoardProps {
  initialCandidates: Candidate[];
  onCandidateMove: (candidateId: string, newStage: Stage,note?:string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialCandidates, onCandidateMove }) => {
  // Local state for the candidates, which we can manipulate for optimistic UI
  const [candidates, setCandidates] = useState(initialCandidates);
  // State to hold the candidate currently being dragged
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [moveDetails, setMoveDetails] = useState<{ candidateId: string; newStage: Stage } | null>(null);
  // Sync with props: If the parent component's data changes, update our local state
  useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  // Group candidates into columns. This is derived from our local state.
  const groupedCandidates = useMemo(() => {
    const initialGroups: Record<Stage, Candidate[]> = {
      applied: [], screen: [], tech: [], offer: [], hired: [], rejected: [],
    };
    return candidates.reduce((acc, candidate) => {
      acc[candidate.stage]?.push(candidate);
      return acc;
    }, initialGroups);
  }, [candidates]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const findContainer = (id: string | number): Stage | undefined => {
    if (STAGES.includes(id as Stage)) return id as Stage;
    return candidates.find(c => c.id === id)?.stage;
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveCandidate(candidates.find(c => c.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null); // Clear the active candidate
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      const candidateId = active.id as string;
      const newStage = overContainer as Stage;

      // Optimistically update the local state
      setCandidates(prev => {
        const activeIndex = prev.findIndex(c => c.id === candidateId);
        if (activeIndex > -1) {
          prev[activeIndex].stage = newStage;
        }
        return [...prev]; // Return a new array to trigger re-render
      });
      
      setTimeout(() => {
        setMoveDetails({ candidateId, newStage });
        setIsNoteModalOpen(true);
      }, 325); // A 250ms delay is a good starting point
    }
    setActiveCandidate(null);
  };

  const handleNoteSubmit = ({ note }: { note: string }) => {
    if (moveDetails) {
      onCandidateMove(moveDetails.candidateId, moveDetails.newStage, note);
    }
    setIsNoteModalOpen(false);
    setMoveDetails(null);
  };

  const handleNoteCancel = () => {
    if (moveDetails) {
      onCandidateMove(moveDetails.candidateId, moveDetails.newStage); // Still make the move, just without a note
    }
    setIsNoteModalOpen(false);
    setMoveDetails(null);
  };

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto p-2 pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            candidates={groupedCandidates[stage]}
          />
        ))}
      </div>
      {/* DragOverlay renders a portal, showing the dragged item without layout shifts */}
      <DragOverlay>
        {activeCandidate ? <CandidateCard candidate={activeCandidate} /> : null}
      </DragOverlay>
    </DndContext>
    <Modal isOpen={isNoteModalOpen} onClose={handleNoteCancel} title="Add Note">
        <NoteForm
          onSubmit={handleNoteSubmit}
          onCancel={handleNoteCancel}
          isSubmitting={false} // We can enhance this later if needed
        />
      </Modal>    
    </>
  );
};

export default KanbanBoard;