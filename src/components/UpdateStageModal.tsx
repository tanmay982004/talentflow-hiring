import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './ui/Modal';
import { candidatesService } from '../services/candidatesService';
import type { Candidate, Stage } from '../types';
import { 
  ArrowRightIcon, 
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface UpdateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

type StageUpdateFormData = {
  newStage: Stage;
  note: string;
};

const STAGES: Stage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const UpdateStageModal: React.FC<UpdateStageModalProps> = ({ isOpen, onClose, candidate }) => {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<StageUpdateFormData>({
    defaultValues: {
      newStage: candidate?.stage || 'applied',
      note: ''
    }
  });

  const newStage = watch('newStage');

  const updateStageMutation = useMutation({
    mutationFn: ({ candidateId, updateData }: { candidateId: string; updateData: Partial<Candidate> }) => {
      return candidatesService.patch(candidateId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', candidate?.id] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to update candidate stage:', error);
      alert('Failed to update stage. Please try again.');
    }
  });

  const onSubmit = (data: StageUpdateFormData) => {
    if (!candidate) return;

    const newTimelineEvent = {
      timestamp: Date.now(),
      from: candidate.stage,
      to: data.newStage,
      note: data.note.trim() || undefined
    };

    const updatedCandidate: Partial<Candidate> = {
      stage: data.newStage,
      timeline: [...(candidate.timeline || []), newTimelineEvent]
    };

    updateStageMutation.mutate({ 
      candidateId: candidate.id, 
      updateData: updatedCandidate 
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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

  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Candidate Stage">
      <div className="space-y-6">
        {}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">{candidate.name}</h3>
          <p className="text-sm text-gray-600">{candidate.email}</p>
        </div>

        {}
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold border ${getStageColor(candidate.stage)}`}>
            <span className="mr-1">{getStageIcon(candidate.stage)}</span>
            {candidate.stage}
          </div>
          <ArrowRightIcon className="w-6 h-6 text-gray-400" />
          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold border ${getStageColor(newStage)}`}>
            <span className="mr-1">{getStageIcon(newStage)}</span>
            {newStage}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {}
          <div>
            <label htmlFor="newStage" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />
              New Stage
            </label>
            <select
              id="newStage"
              {...register('newStage', { required: 'Please select a new stage' })}
              className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 capitalize"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage} className="capitalize">
                  {getStageIcon(stage)} {stage}
                </option>
              ))}
            </select>
            {errors.newStage && (
              <p className="mt-1 text-sm text-red-600">{errors.newStage.message}</p>
            )}
          </div>

          {}
          <div>
            <label htmlFor="note" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2 text-purple-500" />
              Notes (Optional)
            </label>
            <textarea
              id="note"
              {...register('note')}
              rows={3}
              className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
              placeholder="Add a note about this stage change... (e.g., @john reviewed technical skills, candidate shows strong React knowledge)"
            />
            <div className="mt-1 text-xs text-gray-500">
              Tip: Use @mentions to reference team members in your notes
            </div>
          </div>

          {}
          {(newStage === 'rejected' || newStage === 'hired') && (
            <div className={`p-4 rounded-xl border ${
              newStage === 'rejected' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {newStage === 'rejected' ? '⚠️' : '✅'}
                </span>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {newStage === 'rejected' ? 'Final Rejection' : 'Congratulations!'}
                  </p>
                  <p className="text-gray-600">
                    {newStage === 'rejected' 
                      ? 'This candidate will be moved to rejected status.'
                      : 'This candidate will be marked as successfully hired!'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateStageMutation.isPending || candidate.stage === newStage}
              className="inline-flex items-center px-6 py-2 bg-primary-gradient text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || updateStageMutation.isPending) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Update Stage
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateStageModal;