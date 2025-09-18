import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarDaysIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import type { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit?: (candidate: Candidate) => void;
  jobTitle?: string;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onEdit, jobTitle }) => {
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

  const getTimelineLatest = () => {
    if (!candidate.timeline || candidate.timeline.length === 0) return null;
    return candidate.timeline[candidate.timeline.length - 1];
  };

  const latestEvent = getTimelineLatest();
  const lastUpdated = latestEvent ? new Date(latestEvent.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) : 'No updates';

  return (
    <div className="group hover-lift">
      <div className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
        
        {/* Candidate Header */}
        <div className="mb-4">
          {/* Status Badge - Top Right */}
          <div className="flex justify-end mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(candidate.stage)}`}>
              <span className="mr-1">{getStageIcon(candidate.stage)}</span>
              {candidate.stage}
            </span>
          </div>
          
          {/* Candidate Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center animate-pulse-soft flex-shrink-0">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
                {candidate.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <EnvelopeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Title & Profile */}
        <div className="mb-3">
          {jobTitle && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <SparklesIcon className="w-4 h-4 mr-1 text-purple-500" />
              <span className="font-medium">Applied for: {jobTitle}</span>
            </div>
          )}
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border">
            <p className="line-clamp-2 leading-relaxed">
              {candidate.profile || 'No profile information available.'}
            </p>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="mb-4">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>Last Updated</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              <span>{lastUpdated}</span>
            </div>
            <div className="text-xs text-gray-500">
              {candidate.timeline?.length || 0} events
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            to={`/candidates/${candidate.id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-gradient text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View Profile
            <ArrowUpRightIcon className="w-3 h-3 ml-1" />
          </Link>
          
          {onEdit && (
            <button
              onClick={() => onEdit(candidate)}
              className="inline-flex items-center px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-purple-600 transition-all duration-200"
            >
              <SparklesIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-gradient rounded-full animate-ping opacity-20"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary-gradient rounded-full opacity-10 animate-float"></div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default CandidateCard;
