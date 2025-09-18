import React from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  PencilIcon, 
  ArchiveBoxIcon, 
  CalendarDaysIcon,
  TagIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ClockIcon,
  ArrowUpRightIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onArchive }) => {
  const isArchived = job.status === 'archived';
  const createdDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="group hover-lift">
      <div className={`relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all duration-300 ${
        isArchived 
          ? 'opacity-75 border-gray-300' 
          : 'hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10'
      }`}>
        
        {/* Job Header */}
        <div className="mb-4">
          {/* Status Badge - Top Right */}
          <div className="flex justify-end mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
              getStatusColor(job.status)
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                job.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></div>
              {job.status}
            </span>
          </div>
          
          {/* Job Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center animate-pulse-soft flex-shrink-0">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <CalendarDaysIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                Posted {createdDate}
              </p>
            </div>
          </div>
        </div>

        {/* Job Summary */}
        <div className="mb-3">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {job.summary || 'No summary available for this position.'}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <TagIcon className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-xs text-gray-500 font-medium">Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.tags.slice(0, 4).map((tag, index) => (
              <span
                key={tag}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${
                  getTagColor(index)
                }`}
              >
                <SparklesIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">
                +{job.tags.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <Link
              to={`/jobs/${job.slug}`}
              className="inline-flex items-center px-4 py-2 bg-primary-gradient text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              View Details
              <ArrowUpRightIcon className="w-3 h-3 ml-1" />
            </Link>
            
            <button
              onClick={() => onEdit(job)}
              className="inline-flex items-center px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-purple-600 transition-all duration-200"
              title="Edit Job"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            
            <Link
              to={`/assessments?job=${job.slug}`}
              className="inline-flex items-center px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
              title="View/Create Assessment"
            >
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => onArchive(job)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
              isArchived
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
            }`}
          >
            <ArchiveBoxIcon className="w-4 h-4 mr-2" />
            {isArchived ? 'Restore' : 'Archive'}
          </button>
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

export default JobCard;
