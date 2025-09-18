import React from 'react';
import { 
  ClipboardDocumentCheckIcon, 
  QuestionMarkCircleIcon,
  SparklesIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import type { Assessment } from '../types';

interface AssessmentCardProps {
  assessment: Assessment;
  jobTitle?: string;
  onEdit?: (assessment: Assessment) => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ 
  assessment, 
  jobTitle, 
  onEdit
}) => {
  const totalQuestions = assessment.sections?.reduce((acc, section) => 
    acc + (section.questions?.length || 0), 0) || 0;
  
  const getSectionColor = (index: number) => {
    const colors = [
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
    ];
    return colors[index % colors.length];
  };

  const getQuestionTypeIcon = (type: string) => {
    switch(type) {
      case 'single-choice': return '⚪';
      case 'multi-choice': return '☑️';
      case 'short-text': return '📝';
      case 'long-text': return '📄';
      case 'numeric': return '🔢';
      case 'file': return '📎';
      default: return '❓';
    }
  };

  return (
    <div className="group hover-lift">
      <div className="relative glass-strong rounded-2xl p-6 border border-white/30 hover:border-purple-300/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center animate-pulse-soft">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {assessment.title}
              </h3>
              {jobTitle && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <SparklesIcon className="w-4 h-4 mr-1 text-purple-500" />
                  <span>For: {jobTitle}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-lg p-3 border border-white/20 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {assessment.sections?.length || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Sections</div>
            </div>
            <div className="glass rounded-lg p-3 border border-white/20 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalQuestions}
              </div>
              <div className="text-xs text-gray-500 mt-1">Questions</div>
            </div>
          </div>
        </div>

        {/* Sections Preview */}
        {assessment.sections && assessment.sections.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <ClipboardDocumentCheckIcon className="w-3 h-3 mr-1" />
              <span>Sections</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {assessment.sections.slice(0, 3).map((section, index) => (
                <div key={section.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSectionColor(index)}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-700 truncate">
                      {section.title}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <QuestionMarkCircleIcon className="w-3 h-3 mr-1" />
                    <span>{section.questions?.length || 0}</span>
                  </div>
                </div>
              ))}
              {assessment.sections.length > 3 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  +{assessment.sections.length - 3} more sections
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Types Summary */}
        {totalQuestions > 0 && (
          <div className="mb-6">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <QuestionMarkCircleIcon className="w-3 h-3 mr-1" />
              <span>Question Types</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(
                assessment.sections?.flatMap(section => 
                  section.questions?.map(q => q.type) || []
                ) || []
              )).map((type, index) => (
                <span 
                  key={type}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border"
                >
                  <span className="mr-1">{getQuestionTypeIcon(type)}</span>
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-white/20">
          {onEdit && (
            <button
              onClick={() => onEdit(assessment)}
              className="inline-flex items-center px-3 py-2 glass border border-white/30 text-gray-700 text-sm font-medium rounded-xl hover:bg-white/50 hover:text-purple-600 transition-all duration-200"
            >
              <PencilIcon className="w-4 h-4" />
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

export default AssessmentCard;