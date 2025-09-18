import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './ui/Modal';
import { candidatesService } from '../services/candidatesService';
import { useJobs } from '../hooks/useJobs';
import type { Candidate, Stage } from '../types';
import { 
  UserIcon, 
  EnvelopeIcon, 
  BriefcaseIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CandidateFormData = {
  name: string;
  email: string;
  jobId: string;
  stage: Stage;
  profile: string;
};

const STAGES: Stage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: jobsData } = useJobs({ pageSize: 1000, status: 'active' });
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CandidateFormData>({
    defaultValues: {
      stage: 'applied',
    }
  });

  const createCandidateMutation = useMutation({
    mutationFn: (candidateData: Partial<Candidate>) => {
      // Add the create method to candidatesService
      return candidatesService.create(candidateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to create candidate:', error);
      alert('Failed to create candidate. Please try again.');
    }
  });

  const onSubmit = (data: CandidateFormData) => {
    const candidateData: Partial<Candidate> = {
      id: `candidate-${Date.now()}`, // Generate temp ID
      name: data.name,
      email: data.email,
      jobId: data.jobId,
      stage: data.stage,
      profile: data.profile,
      timeline: [{
        timestamp: Date.now(),
        to: data.stage,
        note: 'Candidate added to system'
      }]
    };

    createCandidateMutation.mutate(candidateData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Candidate">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <UserIcon className="w-4 h-4 mr-2 text-purple-500" />
            Full Name
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            placeholder="e.g., John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <EnvelopeIcon className="w-4 h-4 mr-2 text-purple-500" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            placeholder="e.g., john.doe@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Job Selection */}
        <div>
          <label htmlFor="jobId" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <BriefcaseIcon className="w-4 h-4 mr-2 text-purple-500" />
            Job Position
          </label>
          <select
            id="jobId"
            {...register('jobId', { required: 'Please select a job position' })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
          >
            <option value="">Select a job position...</option>
            {jobsData?.items?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {errors.jobId && (
            <p className="mt-1 text-sm text-red-600">{errors.jobId.message}</p>
          )}
        </div>

        {/* Stage Selection */}
        <div>
          <label htmlFor="stage" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <span className="w-4 h-4 mr-2 text-purple-500">🎯</span>
            Initial Stage
          </label>
          <select
            id="stage"
            {...register('stage', { required: 'Please select an initial stage' })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 capitalize"
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage} className="capitalize">
                {stage}
              </option>
            ))}
          </select>
          {errors.stage && (
            <p className="mt-1 text-sm text-red-600">{errors.stage.message}</p>
          )}
        </div>

        {/* Profile/Bio Field */}
        <div>
          <label htmlFor="profile" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <DocumentTextIcon className="w-4 h-4 mr-2 text-purple-500" />
            Profile / Bio
          </label>
          <textarea
            id="profile"
            {...register('profile', { 
              required: 'Profile information is required',
              minLength: { value: 10, message: 'Profile must be at least 10 characters' }
            })}
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
            placeholder="Brief description of candidate's background, skills, and experience..."
          />
          {errors.profile && (
            <p className="mt-1 text-sm text-red-600">{errors.profile.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createCandidateMutation.isPending}
            className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isSubmitting || createCandidateMutation.isPending) ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <UserIcon className="w-4 h-4 mr-2" />
                Add Candidate
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCandidateModal;