// src/components/DndJobCard.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import JobCard from './JobCard';
import type { Job } from '../types';

interface DndJobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
}

const DndJobCard: React.FC<DndJobCardProps> = ({ job, onEdit, onArchive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    // This div is the handle for dragging. It listens for pointer events.
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard
        job={job}
        onEdit={onEdit}
        onArchive={onArchive}
      />
    </div>
  );
};

export default DndJobCard;