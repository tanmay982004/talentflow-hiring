import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  BriefcaseIcon, 
  UserIcon,
  EnvelopeIcon,
  ClockIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { useCandidate } from '../../hooks/useCandidate';
import { useJob } from '../../hooks/useJob';
import UpdateStageModal from '../../components/UpdateStageModal';

const CandidateProfilePage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [isUpdateStageModalOpen, setIsUpdateStageModalOpen] = useState(false);

  const { data: candidate, isLoading, isError, error } = useCandidate(candidateId);
  const { data: job } = useJob({ id: candidate?.jobId });

  const getStageColor = (stage: string) => {
    const colors = {
      'applied': 'bg-blue-100 text-blue-800 border-blue-200',
      'screen': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'tech': 'bg-purple-100 text-purple-800 border-purple-200',
      'offer': 'bg-orange-100 text-orange-800 border-orange-200',
      'hired': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStageIcon = (stage: string) => {
    switch(stage) {
      case 'applied': return '📝';
      case 'screen': return '📞';
      case 'tech': return '💻';
      case 'offer': return '🎯';
      case 'hired': return '🎉';
      case 'rejected': return '❌';
      default: return '👤';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-12">
        <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
        <p className="text-gray-500">Loading candidate profile...</p>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="text-center p-12 text-red-600 bg-red-50 rounded-lg">
        <h3 className="font-semibold mb-2">Error loading candidate</h3>
        <p className="text-sm">{error?.message || 'Candidate not found.'}</p>
      </div>
    );
  }

  const NoteWithMentions = ({ text }: { text: string }) => {
    const parts = text.split(/(@\w+)/g);
    return (
      <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-start space-x-2">
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">
            {parts.map((part, index) =>
              part.startsWith('@') ? (
                <strong key={index} className="font-semibold text-purple-600 bg-purple-50 px-1 rounded">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link 
        to="/candidates" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Candidates
      </Link>

      {/* Candidate Header */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-primary-gradient rounded-2xl flex items-center justify-center animate-pulse-soft">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {candidate.name}
                  <div className="w-3 h-3 bg-emerald-500 rounded-full inline-block ml-3 animate-pulse"></div>
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  <span className="text-lg">{candidate.email}</span>
                </div>
                
                {/* Job & Stage Info */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                    <BriefcaseIcon className="h-5 w-5 mr-2 text-purple-500" />
                    <span className="text-sm font-medium">
                      Applied for: <strong>{job?.title || 'Unknown Position'}</strong>
                    </span>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStageColor(candidate.stage)}`}>
                    <span className="mr-2">{getStageIcon(candidate.stage)}</span>
                    Current Stage: {candidate.stage}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsUpdateStageModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-gradient text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <SparklesIcon className="w-4 h-4" />
                Update Stage
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-4">
          <UserIcon className="w-5 h-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-xl p-6 border border-gray-200/50">
          <p className="text-gray-700 leading-relaxed">
            {candidate.profile || 'No profile information available for this candidate.'}
          </p>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-6">
          <ClockIcon className="w-5 h-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Timeline & History</h2>
          <div className="ml-auto text-sm text-gray-500">
            {candidate.timeline?.length || 0} events
          </div>
        </div>
        
        <div className="flow-root">
          <ul className="-mb-8">
            {candidate.timeline && candidate.timeline.length > 0 ? (
              candidate.timeline.map((event, eventIdx) => (
                <li key={event.timestamp}>
                  <div className="relative pb-8">
                    {eventIdx !== candidate.timeline.length - 1 ? (
                      <span className="absolute left-6 top-10 -ml-px h-full w-0.5 bg-gradient-to-b from-purple-300 to-blue-300" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-4 items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-primary-gradient flex items-center justify-center shadow-lg">
                          {eventIdx === 0 ? (
                            <CheckCircleIcon className="h-6 w-6 text-white" />
                          ) : (
                            <ArrowRightIcon className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-all duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              {event.from && (
                                <>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(event.from)}`}>
                                    {event.from}
                                  </span>
                                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                                </>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(event.to)}`}>
                                {event.to}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <CalendarDaysIcon className="w-4 h-4 mr-1" />
                              {new Date(event.timestamp).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">
                            {event.from ? `Moved from ${event.from} to ${event.to}` : `Set to ${event.to} stage`}
                          </p>
                          
                          {event.note && <NoteWithMentions text={event.note} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No timeline events recorded for this candidate yet.</p>
              </div>
            )}
          </ul>
        </div>
      </div>

      {/* Update Stage Modal */}
      <UpdateStageModal 
        isOpen={isUpdateStageModalOpen} 
        onClose={() => setIsUpdateStageModalOpen(false)} 
        candidate={candidate || null}
      />
    </div>
  );
};

export default CandidateProfilePage;
