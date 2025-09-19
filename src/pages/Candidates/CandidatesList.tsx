import React, { useState, useMemo, useCallback } from 'react';
import { useCandidates } from '../../hooks/useCandidates';
import { useJobs } from '../../hooks/useJobs';
import type { Stage } from '../../types';
import { UserGroupIcon, PlusIcon, SparklesIcon, UsersIcon } from '@heroicons/react/24/outline';
import CandidateCard from '../../components/CandidateCard';
import AddCandidateModal from '../../components/AddCandidateModal';

const STAGES: Stage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

const CandidatesListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch candidates and jobs for job title lookup
  const { data: candidatesData, isLoading, isError, error } = useCandidates({ 
    pageSize: 1000, 
    stage: stageFilter 
  });
  const { data: jobsData } = useJobs({ pageSize: 1000, status: '' });

  // Create job lookup map
  const jobsMap = useMemo(() => {
    if (!jobsData?.items) return new Map();
    return new Map(jobsData.items.map(job => [job.id, job.title]));
  }, [jobsData]);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(debounce((value: string) => {
    setDebouncedSearch(value);
  }, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearchHandler(value);
  };

  // Client-side search logic
  const filteredCandidates = useMemo(() => {
    if (!candidatesData?.items) return [];
    if (!debouncedSearch) return candidatesData.items;
    return candidatesData.items.filter(c =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [candidatesData, debouncedSearch]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-12 text-gray-500">
          <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p>Loading candidates...</p>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="text-center p-12 text-red-600 bg-red-50 rounded-lg">
          <h3 className="font-semibold mb-2">Error loading candidates</h3>
          <p className="text-sm">{error?.message || 'Unknown error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
    
    if (!candidatesData || filteredCandidates.length === 0) {
      return (
        <div className="text-center p-12 text-gray-500">
          <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">No candidates found</h3>
          <p className="text-sm">Try adjusting your search filters or check back later for new applications.</p>
        </div>
      );
    }

    return (
      <div className="animate-slide-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCandidates.map((candidate, index) => (
            <div 
              key={candidate.id} 
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CandidateCard
                candidate={candidate}
                jobTitle={candidate.jobId ? jobsMap.get(candidate.jobId) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {}
      <div className="relative">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Talent
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">
                    Pipeline
                  </span>
                </h1>
                <p className="text-gray-600 text-lg">
                  Discover and nurture exceptional candidates throughout their journey
                </p>
                <div className="flex items-center mt-3 space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    {candidatesData?.items?.length || 0} Active Candidates
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Real-time Tracking
                  </div>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-3 px-6 py-3 bg-primary-gradient text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25"
              >
                <PlusIcon className="h-5 w-5" />
                Recruit Talent
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">Search Candidates</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                id="search" 
                placeholder="Search by name, email, or skills..."
                value={search}
                onChange={handleSearchChange}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              />
            </div>
          </div>
          
          {}
          <div className="w-full lg:w-64">
            <label htmlFor="stageFilter" className="block text-sm font-semibold text-gray-700 mb-2">Filter by Stage</label>
            <select 
              id="stageFilter" 
              value={stageFilter} 
              onChange={(e) => setStageFilter(e.target.value)} 
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 capitalize"
            >
              <option value="">🌟 All Stages</option>
              <option value="applied">📝 Applied</option>
              <option value="screen">📞 Screening</option>
              <option value="tech">💻 Technical</option>
              <option value="offer">🎯 Offer</option>
              <option value="hired">🎉 Hired</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {}
      <AddCandidateModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default CandidatesListPage;