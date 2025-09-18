import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useAssessments } from '../../hooks/useAssessments';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ClipboardDocumentCheckIcon, 
  SparklesIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import AssessmentCard from '../../components/AssessmentCard';
import type { Assessment } from '../../types';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

const AssessmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobParam = searchParams.get('job'); // This can be either jobId or jobSlug
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'search' | 'grid'>(jobParam ? 'grid' : 'search');
  
  const { data: jobsData, isLoading } = useJobs({ pageSize: 1000, status: 'active' });
  
  // Resolve jobParam to actual jobId for the useAssessments hook
  const resolvedJobId = useMemo(() => {
    if (!jobParam || !jobsData?.items) return null;
    const job = jobsData.items.find(job => job.id === jobParam || job.slug === jobParam);
    return job?.id || null;
  }, [jobParam, jobsData]);
  
  const { data: assessmentsData, isLoading: assessmentsLoading } = useAssessments(resolvedJobId ? { jobId: resolvedJobId } : undefined);
  const { data: allAssessmentsData } = useAssessments(); // Get all assessments to show counts

  // Create job lookup map
  const jobsMap = useMemo(() => {
    if (!jobsData?.items) return new Map();
    return new Map(jobsData.items.map(job => [job.id, job.title]));
  }, [jobsData]);

  // Get assessment count per job
  const getAssessmentCount = useCallback((jobId: string) => {
    if (!allAssessmentsData) return 0;
    return allAssessmentsData.filter(assessment => assessment.jobId === jobId).length;
  }, [allAssessmentsData]);

  // Get filtered assessments based on job selection
  const filteredAssessments = useMemo(() => {
    return assessmentsData || [];
  }, [assessmentsData]);

  // Get current job info for header
  const currentJob = useMemo(() => {
    if (!jobParam || !jobsData?.items) return null;
    return jobsData.items.find(job => job.id === jobParam || job.slug === jobParam);
  }, [jobParam, jobsData]);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(debounce((value: string) => {
    setDebouncedSearch(value);
  }, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearchHandler(value);
  };

  const filteredJobs = useMemo(() => {
    if (!jobsData?.items) return [];
    if (!debouncedSearch) return jobsData.items;
    return jobsData.items.filter(job =>
      job.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [jobsData, debouncedSearch]);

  // Update viewMode when jobParam changes
  useEffect(() => {
    if (jobParam) {
      setViewMode('grid');
    } else {
      setViewMode('search');
    }
  }, [jobParam]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  const handleEditAssessment = (assessment: Assessment) => {
    const job = jobsData?.items.find(job => job.id === assessment.jobId);
    const jobSlug = job?.slug || assessment.jobId;
    navigate(`/assessments/${jobSlug}/edit`);
  };


  const handleClearJobFilter = () => {
    setSearchParams({});
    setViewMode('search');
  };

  const handleBackToAllAssessments = () => {
    setSearchParams({});
    setViewMode('grid');
  };

  const renderSearchMode = () => (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-purple-500 mr-2" />
          <h2 className="text-lg font-bold text-gray-900">Find Job to Assess</h2>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> After selecting a job, you'll see two options:
          </p>
          <ul className="text-xs text-blue-700 mt-1 ml-4 space-y-1">
            <li>• <strong>View Assessments</strong> - See all existing assessments for that job</li>
            <li>• <strong>Create Assessment</strong> - Create a new assessment for that job</li>
          </ul>
        </div>
        
        <div ref={wrapperRef} className="relative max-w-lg">
          <label htmlFor="job-search" className="block text-sm font-semibold text-gray-700 mb-2">
            Search for an Active Job
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="job-search"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={isLoading ? 'Loading available positions...' : 'Search positions: Frontend Developer, Product Manager, etc.'}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse" />
                  Loading jobs...
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="py-2">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {job.tags?.slice(0, 3).join(' • ') || 'No tags'} 
                              • {getAssessmentCount(job.id)} assessment{getAssessmentCount(job.id) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-white flex space-x-2">
                        <button
                          onClick={() => {
                            navigate(`/assessments?job=${job.slug}`);
                            setIsDropdownOpen(false);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ClipboardDocumentCheckIcon className="w-4 h-4" />
                          View Assessments
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/assessments/${job.slug}/create`);
                            setIsDropdownOpen(false);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <SparklesIcon className="w-4 h-4" />
                          Create Assessment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  No jobs found matching your search.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => setViewMode('grid')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
            View All Assessments
          </button>
        </div>
      </div>
    </div>
  );

  const renderGridMode = () => (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {jobParam ? (
            <>
              <button 
                onClick={handleClearJobFilter}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Search
              </button>
            </>
          ) : (
            <button 
              onClick={() => setViewMode('search')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Back to Search
            </button>
          )}
        </div>
        
        {/* Job Info */}
        {currentJob && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Assessments for</div>
            <div className="font-semibold text-gray-900">{currentJob.title}</div>
          </div>
        )}
      </div>

      {/* Assessments Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          {assessmentsLoading ? (
            <div className="text-center py-12">
              <ClipboardDocumentCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
              <h3 className="font-semibold mb-2">Loading assessments...</h3>
            </div>
          ) : filteredAssessments.length > 0 ? (
            <div className="space-y-6">
              {jobParam && (
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      const job = jobsData?.items.find(job => job.id === jobParam || job.slug === jobParam);
                      const jobSlug = job?.slug || jobParam;
                      navigate(`/assessments/${jobSlug}/create`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Create New Assessment
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredAssessments.map((assessment, index) => (
                  <div 
                    key={`${assessment.id}-${index}`}
                    className="animate-slide-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <AssessmentCard
                      assessment={assessment}
                      jobTitle={jobsMap.get(assessment.jobId) || currentJob?.title}
                      onEdit={handleEditAssessment}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardDocumentCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold mb-2">
                {jobParam ? `No assessments found for this job` : 'No assessments found'}
              </h3>
              <p className="text-sm text-gray-500">
                {jobParam 
                  ? 'This job doesn\'t have any assessments created yet.' 
                  : 'Create assessments for jobs to see them here.'}
              </p>
              {jobParam && (
                <button 
                  onClick={() => {
                    const job = jobsData?.items.find(job => job.id === jobParam || job.slug === jobParam);
                    const jobSlug = job?.slug || jobParam;
                    navigate(`/assessments/${jobSlug}/create`);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Create New Assessment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {jobParam && currentJob ? (
                    <>
                      Assessment for
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">
                        {currentJob.title}
                      </span>
                    </>
                  ) : (
                    <>
                      Assessment
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">
                        Center
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-gray-600 text-lg">
                  {jobParam && currentJob 
                    ? `View and manage assessments specifically designed for ${currentJob.title} candidates` 
                    : 'Create, manage, and deploy comprehensive candidate assessments'}
                </p>
                <div className="flex items-center mt-3 space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    {filteredAssessments.length} {jobParam ? 'Job-Specific' : 'Active'} Assessments
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {jobParam && currentJob ? 'Targeted Questions' : 'Smart Question Builder'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'search' ? renderSearchMode() : renderGridMode()}
    </div>
  );
};

export default AssessmentsPage;