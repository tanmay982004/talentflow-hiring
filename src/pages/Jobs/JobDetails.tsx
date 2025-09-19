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
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-lg overflow-hidden">
        {/* Header Section with Status */}
        <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-purple-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        ✨ {job.status === 'active' ? 'Active Hiring' : 'On Hold'}
                    </span>
                </div>
                <div className="text-xs text-gray-500 bg-white/60 px-3 py-1 rounded-full">
                    Job ID: {job.id.slice(0, 8)}
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
            <div className="space-y-6">
                {/* Title and Description */}
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        {job.title}
                    </h1>
                    <p className="text-gray-700 leading-relaxed max-w-4xl">
                        {job.summary}
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                        <span 
                            key={tag} 
                            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 hover:scale-105 ${
                                index % 3 === 0 
                                    ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' 
                                    : index % 3 === 1 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                                    : 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
                            }`}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Action Buttons - New Vertical Card Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Link
                        to={`/assessments/${job.slug}`}
                        className="group relative bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-purple-400"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-purple-100 mb-1">Assessment</div>
                                <div className="text-lg font-bold">Skill Hub</div>
                                <div className="text-xs text-purple-200 mt-2">Create & manage tests</div>
                            </div>
                            <DocumentPlusIcon className="h-8 w-8 text-purple-200 group-hover:text-white transition-colors" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-purple-400/20 rounded-xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
                    </Link>
                    
                    <Link
                        to={`/assessments?job=${job.slug}`}
                        className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-blue-400"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-100 mb-1">View All</div>
                                <div className="text-lg font-bold">Assessments</div>
                                <div className="text-xs text-blue-200 mt-2">Browse existing tests</div>
                            </div>
                            <DocumentPlusIcon className="h-8 w-8 text-blue-200 group-hover:text-white transition-colors" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-indigo-400/20 rounded-xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
                    </Link>
                </div>
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
      
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Talent Journey Tracker</h2>
                <div className="text-indigo-100 text-sm">Manage candidate progress</div>
              </div>
            </div>
            <div className="text-right">
              {(isLoadingCandidates || isErrorCandidates) ? (
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <span className="text-white text-sm">{isErrorCandidates ? 'Error loading...' : 'Loading...'}</span>
                </div>
              ) : (
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <div className="text-white font-bold text-lg">{candidatesData?.total ?? 0}</div>
                  <div className="text-indigo-100 text-xs">total candidates</div>
                </div>
              )}
            </div>
          </div>
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