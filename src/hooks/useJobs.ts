import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../services/jobsService';
import type { Job } from '../types'; 

export type JobsResponse = {
  items: Job[];
  total: number;
};

export const useJobs = (params: Record<string, any> = {}) => {
  console.log('useJobs called with params:', params);
  
  return useQuery<JobsResponse, Error>({
    queryKey: ['jobs', params],
    queryFn: async () => {
      console.log('Fetching jobs with params:', params);
      try {
        const result = await jobsService.list(params);
        console.log('Jobs fetch result:', result);
        return result;
      } catch (error) {
        console.error('Jobs fetch error:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};