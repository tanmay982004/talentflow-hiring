// src/pages/Jobs/JobDetails.tsx
import React, {useState} from 'react'; // No longer need useState/useEffect/DndContext
import { useParams, useNavigate ,Link} from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon ,DocumentPlusIcon} from '@heroicons/react/24/solid';
import { useJob } from '../../hooks/useJob';
import { useCandidates } from '../../hooks/useCandidates';
import KanbanBoard from '../../components/KanbanBoard';
import { candidatesService } from '../../services/candidatesService';
import type { Stage } from '../../types';
import FeedbackPopup from '../../components/ui/FeedbackPopup';

const JobDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading: isLoadingJob, isError: isErrorJob } = useJob({slug});
  const { data: candidatesData, isLoading: isLoadingCandidates, isError: isErrorCandidates } = useCandidates({
    jobId: job?.id,
    pageSize: 1000,
    enabled: !!job?.id
  });

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const triggerFeedback = (message: string, duration = 2000) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, duration);
  };

  const updateCandidateMutation = useMutation({
    mutationFn: (data: { candidateId: string; stage: Stage; note?: string }) =>
      candidatesService.patch(data.candidateId, { stage: data.stage, note: data.note }),
    onSuccess: (_data, variables) => {
      // On success, refetch the candidates to ensure consistency with the server
      queryClient.invalidateQueries({ queryKey: ['candidates', { jobId: job?.id }] });
      if (variables.note && variables.note.trim() !== '') {
        // --- Logic for consecutive popups ---
        triggerFeedback('Note saved successfully!', 1000); // Show first popup for 1.5s
        setTimeout(() => {
          triggerFeedback('Candidate stage updated!!', 1000); // Then show the second
        }, 1500); // Wait for the first one to finish
      } else {
        // If no note was saved, just show the single popup
        triggerFeedback('Candidate stage updated!',1000);
      }
    },

    onError: (error) => {
      console.error("Failed to update candidate, state will be refetched.", error);
      // Also refetch on error to roll back the optimistic UI
      queryClient.invalidateQueries({ queryKey: ['candidates', { jobId: job?.id }] });
    }
  });
  
  // This function is passed down to the KanbanBoard
  const handleCandidateMove = (candidateId: string, newStage: Stage, note?: string) => {
    updateCandidateMutation.mutate({ candidateId, stage: newStage, note });
};

  if (isLoadingJob) return <div className="text-center p-12">Loading job...</div>;
  if (isErrorJob || !job) return <div className="text-center p-12 text-red-600">Error: Job not found.</div>;

  const JobHeader = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-2 text-sm text-gray-600 max-w-2xl">{job.summary}</p>

                <div className="mt-2 flex items-center gap-4">
                    {job.tags.map(tag => <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">{tag}</span>)}
                </div>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {job.status}
            </span>
            <div className="flex items-center gap-3">
              <Link
                  to={`/assessments/${job.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  <DocumentPlusIcon className="h-5 w-5" />
                  Build/Edit Assessment
              </Link>
              
              <Link
                  to={`/assessments?job=${job.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  <DocumentPlusIcon className="h-5 w-5" />
                  View Assessments
              </Link>
            </div>

        </div>
    </div>
  );

  return (
    <>
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Jobs Board
      </button>
      
      <JobHeader />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Candidate Pipeline</h2>
          {(isLoadingCandidates || isErrorCandidates) ? (
            <p className="text-sm text-gray-500 mt-1">{isErrorCandidates ? 'Error loading candidates.' : 'Loading candidates...'}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">{candidatesData?.total ?? 0} total candidates</p>
          )}
        </div>
        
        <KanbanBoard
          initialCandidates={candidatesData?.items || []}
          onCandidateMove={handleCandidateMove}
        />
      </div>
    </div>
    <FeedbackPopup message={feedbackMessage} show={showFeedback} />
    </>
  );
};

export default JobDetailsPage;