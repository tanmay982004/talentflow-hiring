import React, { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';

import { useJobs } from '../../hooks/useJobs';
import { jobsService } from '../../services/jobsService';
import type { JobsResponse, Job } from '../../types';

import DndJobCard from '../../components/DndJobCard';
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/ui/Modal';
import JobForm from '../../components/JobForm';
import { type SubmitHandler } from 'react-hook-form';
import FeedbackPopup from '../../components/ui/FeedbackPopup';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

type FormValues = {
  title: string;
  slug: string;
  tags: string;
  summary: string;
};

const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const JobsListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State is read directly from the URL, ensuring it persists across navigation.
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 8;
    const status = searchParams.has('status') ? searchParams.get('status') || '' : 'active';
    const search = searchParams.get('search') || '';

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const triggerFeedback = (message: string) => {
        setFeedbackMessage(message);
        setShowFeedback(true);
        // The popup will automatically hide after 2 seconds
        setTimeout(() => setShowFeedback(false), 1000);
    };

    // State for temporary UI elements like the modal is kept as local component state.
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    const params = useMemo(() => ({ page, pageSize, search, status }), [page, pageSize, search, status]);
    const { data, isLoading, isError, error } = useJobs(params);
    const queryKey = ['jobs', params];

    const reorderMutation = useMutation({
        mutationFn: ({ id, fromOrder, toOrder }: { id: string; fromOrder: number; toOrder: number }) =>
            jobsService.reorder(id, { fromOrder, toOrder }),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousJobs = queryClient.getQueryData<JobsResponse>(queryKey);
            if (previousJobs) {
                const oldIndex = previousJobs.items.findIndex(job => job.id === variables.id);
                const newIndex = previousJobs.items.findIndex(job => job.order === variables.toOrder);
                if (oldIndex > -1 && newIndex > -1) {
                    const newItems = arrayMove(previousJobs.items, oldIndex, newIndex);
                    queryClient.setQueryData<JobsResponse>(queryKey, { ...previousJobs, items: newItems });
                }
            }
            return { previousJobs };
        },
        onError: (err, _variables, context) => {
            console.error('Reorder failed, rolling back.', err);
            if (context?.previousJobs) {
                queryClient.setQueryData(queryKey, context.previousJobs);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const upsertJobMutation = useMutation({
        mutationFn: (job: Partial<Job>) => {
            if (editingJob) {
                return jobsService.patch(editingJob.id, job);
            }
            return jobsService.create(job);
        },
        onSuccess: (_data, variables) => {
            setIsModalOpen(false);
            setEditingJob(null);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            const message = variables.createdAt ? 'Job created successfully!' : 'Job updated successfully!';
            triggerFeedback(message);
        },
        onError: (error) => {
            console.error("Failed to save job:", error);
            alert(`Error: ${error.message}`);
        }
    });

    const archiveJobMutation = useMutation({
        mutationFn: ({ job, newStatus }: { job: Job, newStatus: 'archived' | 'active' }) => {
            return jobsService.patch(job.id, { status: newStatus });
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            const message = variables.newStatus === 'archived' ? 'Job archived.' : 'Job restored.';
            triggerFeedback(message);
        },
        onError: (error) => {
            console.error("Failed to archive job:", error);
            alert(`Error: ${error.message}`);
        }
    });

    const handleUpdateParams = (newParams: Record<string, string | number>) => {
        setSearchParams(prev => {
            Object.entries(newParams).forEach(([key, value]) => {
                prev.set(key, String(value));
            });
            return prev;
        });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleUpdateParams({ status: e.target.value, page: 1 });
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleUpdateParams({ pageSize: e.target.value, page: 1 });
    };

    const debouncedSearch = useCallback(debounce((value: string) => {
        handleUpdateParams({ search: value, page: 1 });
    }, 300), [setSearchParams]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        handleUpdateParams({ page: newPage });
    };

    const handleOpenCreateModal = () => {
        setEditingJob(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (job: Job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const handleArchiveJob = (job: Job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    // The confirmation is removed. The mutation is called immediately.
    archiveJobMutation.mutate({ job, newStatus });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingJob(null);
    };

    const handleFormSubmit: SubmitHandler<FormValues> = (formData) => {
        const allJobs = queryClient.getQueryData<JobsResponse>(['jobs', { page: 1, pageSize: 1000, search: '', status: '' }])?.items || data?.items || [];
        let newSlug = formData.slug || generateSlug(formData.title);

        if (!editingJob) {
            const existingSlugs = new Set(allJobs.map(job => job.slug));
            let counter = 1;
            let finalSlug = newSlug;
            while (existingSlugs.has(finalSlug)) {
                counter++;
                finalSlug = `${newSlug}-${counter}`;
            }
            newSlug = finalSlug;
        }
        
        const jobData: Partial<Job> = {
            
            title: formData.title,
            slug: newSlug,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            summary: formData.summary,
        };

        if (!editingJob) {
            jobData.id = nanoid();
            jobData.status = 'active';
            jobData.createdAt = Date.now();
        }
        
        upsertJobMutation.mutate(jobData);
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && data) {
            const oldIndex = data.items.findIndex((job) => job.id === active.id);
            const newIndex = data.items.findIndex((job) => job.id === over.id);
            const jobToMove = data.items[oldIndex];
            const targetJob = data.items[newIndex];
            reorderMutation.mutate({ id: jobToMove.id, fromOrder: jobToMove.order, toOrder: targetJob.order });
        }
    };

    const renderContent = () => {
        console.log('Rendering content - isLoading:', isLoading, 'isError:', isError, 'data:', data);
        
        if (isLoading) return <div className="text-center p-12 text-gray-500">Loading jobs...</div>;
        
        if (isError) {
            console.error('Jobs query error:', error);
            return (
                <div className="text-center p-12 text-red-600 bg-red-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Error loading jobs</h3>
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
        
        if (!data) {
            return (
                <div className="text-center p-12 text-yellow-600 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold mb-2">No data received</h3>
                    <p className="text-sm">The API request completed but returned no data.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        
        if (data.items.length === 0) {
            return (
                <div className="text-center p-12 text-gray-500">
                    <h3 className="font-semibold mb-2">No jobs found</h3>
                    <p className="text-sm">Try adjusting your search filters or create a new job.</p>
                </div>
            );
        }

        return (
            <div className="animate-slide-in-up">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={data.items.map(j => j.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {data.items.map((job: Job, index) => (
                                <div 
                                    key={job.id} 
                                    className="animate-slide-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <DndJobCard
                                        job={job}
                                        onEdit={handleOpenEditModal}
                                        onArchive={handleArchiveJob}
                                    />
                                </div>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        );
    };

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

    return (
        <>
        <div className="space-y-8">
            {}
            <div className="relative">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <div>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                    Job Opportunities
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">
                                        Hub
                                    </span>
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Discover and manage your talent pipeline with ease
                                </p>
                                <div className="flex items-center mt-3 space-x-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                        {data?.total || 0} Total Jobs
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        Real-time Updates
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                type="button" 
                                onClick={handleOpenCreateModal} 
                                className="inline-flex items-center gap-3 px-6 py-3 bg-primary-gradient text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Post New Role
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
                        <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">Search Jobs</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                id="search" 
                                placeholder="Search by title, skills, or company..."
                                defaultValue={search}
                                onChange={handleSearchChange}
                                className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" 
                            />
                        </div>
                    </div>
                    
                    {}
                    <div className="w-full lg:w-48">
                        <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Job Status</label>
                        <select 
                            id="status" 
                            value={status} 
                            onChange={handleStatusChange} 
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        >
                            <option value="">🌟 All Jobs</option>
                            <option value="active">✅ Active Only</option>
                            <option value="archived">📦 Archived Only</option>
                        </select>
                    </div>
                    
                    {}
                    <div className="w-full lg:w-48">
                        <label htmlFor="pageSize" className="block text-sm font-semibold text-gray-700 mb-2">Display</label>
                        <select 
                            id="pageSize" 
                            value={pageSize} 
                            onChange={handlePageSizeChange} 
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        >
                            <option value={8}>📄 8 per page</option>
                            <option value={16}>📄 16 per page</option>
                            <option value={24}>📄 24 per page</option>
                        </select>
                    </div>
                </div>
            </div>
            {renderContent()}
            {data && data.total > pageSize && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button 
                            onClick={() => handlePageChange(page - 1)} 
                            disabled={page === 1} 
                            className="inline-flex items-center px-6 py-3 bg-primary-gradient text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="font-medium">Page</span>
                                <div className="bg-primary-gradient text-white px-3 py-1 rounded-lg font-bold">
                                    {page}
                                </div>
                                <span>of</span>
                                <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-bold">
                                    {totalPages}
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center text-xs text-gray-500">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, data.total)} of {data.total} jobs
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handlePageChange(page + 1)} 
                            disabled={page === totalPages} 
                            className="inline-flex items-center px-6 py-3 bg-primary-gradient text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                            Next
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingJob ? 'Update Position' : 'Add New Position'}>
                <JobForm onSubmit={handleFormSubmit} onCancel={handleCloseModal} job={editingJob} isSubmitting={upsertJobMutation.isPending} />
            </Modal>
        </div>
        <FeedbackPopup message={feedbackMessage} show={showFeedback} />
        </>
    );
};

export default JobsListPage;