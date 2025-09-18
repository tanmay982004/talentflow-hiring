// src/hooks/useAssessments.tsx
import { useQuery } from '@tanstack/react-query';
import type { Assessment } from '../types';

interface UseAssessmentsOptions {
  jobId?: string;
}

export const useAssessments = (options?: UseAssessmentsOptions) => {
  return useQuery({
    queryKey: ['assessments', options?.jobId],
    queryFn: async (): Promise<Assessment[]> => {
      if (options?.jobId) {
        // Fetch all assessments for a job
        const response = await fetch(`/api/assessments/job/${options.jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }
        return response.json();
      } else {
        // Fetch all assessments
        const response = await fetch('/api/assessments');
        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }
        return response.json();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssessment = (assessmentId: string) => {
  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async (): Promise<Assessment | null> => {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};
