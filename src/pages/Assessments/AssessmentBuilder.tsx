import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { useJob } from '../../hooks/useJob';
import type { Assessment, AssessmentSection, Question, QuestionType } from '../../types';
import FileUploadPreview from '../../components/FileUploadPreview';
import FileUpload from '../../components/FileUpload';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'single-choice', label: 'Single Choice', icon: '⚪' },
  { value: 'multi-choice', label: 'Multiple Choice', icon: '☑️' },
  { value: 'short-text', label: 'Short Text', icon: '📝' },
  { value: 'long-text', label: 'Long Text', icon: '📄' },
  { value: 'numeric', label: 'Numeric', icon: '🔢' },
  { value: 'file', label: 'File Upload', icon: '📎' }
];

// Real assessment service using API calls
const assessmentService = {
  create: async (assessment: Assessment) => {
    console.log('Creating assessment:', assessment);
    const response = await fetch('/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessment),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create assessment: ${response.statusText}`);
    }
    
    return response.json();
  },
  update: async (jobId: string, assessment: Assessment) => {
    console.log('Updating assessment:', assessment);
    const response = await fetch(`/api/assessments/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessment),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update assessment: ${response.statusText}`);
    }
    
    return response.json();
  },
  get: async (jobId: string) => {
    console.log('Getting assessment for job:', jobId);
    try {
      const response = await fetch(`/api/assessments/${jobId}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to get assessment: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }
  }
};

const AssessmentBuilder: React.FC = () => {
  const { jobSlug, mode } = useParams<{ jobSlug: string; mode?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [fileUploadMode, setFileUploadMode] = useState<Record<string, 'preview' | 'actual'>>({});

  // Get job data first to find job ID
  const { data: jobsData } = useJob({ slug: jobSlug });
  const job = jobsData; // Assuming useJob returns a single job when slug is provided

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues
  } = useForm<Assessment>({
    defaultValues: {
      id: nanoid(),
      jobId: job?.id || '',
      title: `${job?.title || 'Job'} Assessment`,
      createdAt: Date.now(),
      sections: [
        {
          id: nanoid(),
          title: 'Technical Skills',
          questions: []
        }
      ]
    }
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: 'sections'
  });

  const watchedSections = watch('sections');

  const saveAssessmentMutation = useMutation({
    mutationFn: (assessmentData: Assessment) => {
      const isEditing = mode === 'edit';
      const isCreating = mode === 'create' || !mode; // Default to creating if no mode specified
      return isEditing 
        ? assessmentService.update(assessmentData.jobId, assessmentData)
        : assessmentService.create(assessmentData);
    },
    onSuccess: (data) => {
      console.log('Assessment saved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      
      // Show success message
      const message = `✅ Assessment "${data.title}" ${mode === 'edit' ? 'updated' : 'created'} successfully!`;
      
      // Create and show a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Auto remove notification after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
      // Navigate back to appropriate page
      setTimeout(() => {
        if (job?.slug) {
          // If creating for a specific job, go to that job's assessments
          navigate(`/assessments?job=${job.slug}`);
        } else {
          // Otherwise go to jobs page
          navigate('/jobs');
        }
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Failed to save assessment:', error);
      const errorMessage = error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} assessment. Please try again.`;
      
      // Create and show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <span>❌</span>
          <span>${errorMessage}</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Auto remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  });

  const onSubmit = (data: Assessment) => {
    console.log('Submitting assessment data:', data);
    
    // Validation
    if (!job?.id) {
      alert('Error: Job information not found. Please refresh the page and try again.');
      return;
    }
    
    if (!data.title?.trim()) {
      alert('Please enter an assessment title.');
      return;
    }
    
    if (!data.sections || data.sections.length === 0) {
      alert('Please add at least one section to the assessment.');
      return;
    }
    
    // Check if at least one section has questions
    const hasQuestions = data.sections.some(section => section.questions && section.questions.length > 0);
    if (!hasQuestions) {
      const confirm = window.confirm('This assessment has no questions. Do you want to save it anyway?');
      if (!confirm) return;
    }
    
    // Ensure jobId and id are set
    data.jobId = job.id;
    if (!data.id) {
      data.id = nanoid();
    }
    if (!data.createdAt) {
      data.createdAt = Date.now();
    }
    
    console.log('Final assessment data to save:', data);
    saveAssessmentMutation.mutate(data);
  };

  const addSection = () => {
    appendSection({
      id: nanoid(),
      title: `Section ${sectionFields.length + 1}`,
      questions: []
    });
  };

  const addQuestion = (sectionIndex: number) => {
    const currentSections = getValues('sections');
    const newQuestion: Question = {
      id: nanoid(),
      label: '',
      type: 'short-text',
      required: false,
      options: []
    };
    
    currentSections[sectionIndex].questions.push(newQuestion);
    setValue('sections', currentSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const currentSections = getValues('sections');
    currentSections[sectionIndex].questions.splice(questionIndex, 1);
    setValue('sections', currentSections);
  };

  const addOption = (sectionIndex: number, questionIndex: number) => {
    const currentSections = getValues('sections');
    if (!currentSections[sectionIndex].questions[questionIndex].options) {
      currentSections[sectionIndex].questions[questionIndex].options = [];
    }
    currentSections[sectionIndex].questions[questionIndex].options!.push({ value: '' });
    setValue('sections', currentSections);
  };

  const removeOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const currentSections = getValues('sections');
    currentSections[sectionIndex].questions[questionIndex].options?.splice(optionIndex, 1);
    setValue('sections', currentSections);
  };

  const handleQuestionTypeChange = (sectionIndex: number, questionIndex: number, newType: QuestionType) => {
    const currentSections = getValues('sections');
    currentSections[sectionIndex].questions[questionIndex].type = newType;
    
    // Initialize options for choice questions
    if (newType === 'single-choice' || newType === 'multi-choice') {
      if (!currentSections[sectionIndex].questions[questionIndex].options || 
          currentSections[sectionIndex].questions[questionIndex].options!.length === 0) {
        currentSections[sectionIndex].questions[questionIndex].options = [
          { value: '' },
          { value: '' }
        ];
      }
    } else {
      // Clear options for non-choice questions
      currentSections[sectionIndex].questions[questionIndex].options = [];
    }
    
    setValue('sections', currentSections);
  };

  const getQuestionIcon = (type: QuestionType) => {
    return QUESTION_TYPES.find(qt => qt.value === type)?.icon || '❓';
  };

  const getTotalQuestions = () => {
    return watchedSections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0;
  };

  if (!job) {
    return (
      <div className="text-center p-12">
        <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Job not found or loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={job?.slug ? `/assessments?job=${job.slug}` : '/assessments'} 
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl border border-white/30 text-gray-600 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {job?.slug ? `Back to ${job.title} Assessments` : 'Back to Assessments'}
          </Link>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit' : 'Create'} Assessment
            </h1>
            <p className="text-gray-600">For: {job.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="inline-flex items-center gap-2 px-4 py-2 glass border border-white/30 text-gray-700 font-medium rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <EyeIcon className="w-4 h-4" />
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </button>
          
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-strong rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sectionFields.length}
          </div>
          <div className="text-sm text-gray-500">Sections</div>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {getTotalQuestions()}
          </div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div className="glass-strong rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            ~{Math.ceil(getTotalQuestions() * 1.5)}
          </div>
          <div className="text-sm text-gray-500">Minutes</div>
        </div>
      </div>

      {/* Assessment Builder Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Assessment Title */}
        <div className="glass-strong rounded-2xl p-6 border border-white/30">
          <div className="flex items-center mb-4">
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Assessment Details</h2>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Assessment Title
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { required: 'Assessment title is required' })}
              className="glass border border-white/30 rounded-xl px-4 py-3 w-full focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              placeholder="e.g., Frontend Developer Technical Assessment"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="glass-strong rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="w-5 h-5 text-purple-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Assessment Sections</h2>
            </div>
            
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-gradient text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="space-y-6">
            {sectionFields.map((section, sectionIndex) => (
              <div key={section.id} className="glass rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-semibold">
                      {sectionIndex + 1}
                    </span>
                    <input
                      {...register(`sections.${sectionIndex}.title` as const, { 
                        required: 'Section title is required' 
                      })}
                      className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
                      placeholder="Section Title"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={sectionFields.length <= 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Questions in this section */}
                <div className="space-y-4">
                  {watchedSections?.[sectionIndex]?.questions?.map((question, questionIndex) => (
                    <div key={question.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-4">
                        {/* Question Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {questionIndex + 1}
                            </span>
                            <span className="text-lg">
                              {getQuestionIcon(question.type)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text *
                          </label>
                          <textarea
                            {...register(`sections.${sectionIndex}.questions.${questionIndex}.label` as const, {
                              required: 'Question text is required'
                            })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Enter your question here..."
                          />
                          {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.label && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.sections[sectionIndex]?.questions?.[questionIndex]?.label?.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Question Settings */}
                        <div className="flex items-center space-x-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              {...register(`sections.${sectionIndex}.questions.${questionIndex}.type` as const)}
                              onChange={(e) => handleQuestionTypeChange(sectionIndex, questionIndex, e.target.value as QuestionType)}
                              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {QUESTION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex items-center">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <input
                                type="checkbox"
                                {...register(`sections.${sectionIndex}.questions.${questionIndex}.required` as const)}
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span>Required</span>
                            </label>
                          </div>
                        </div>
                        
                        {/* Options for choice questions */}
                        {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-sm font-medium text-gray-700">
                                Answer Options
                              </label>
                              <button
                                type="button"
                                onClick={() => addOption(sectionIndex, questionIndex)}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                              >
                                <PlusIcon className="w-3 h-3 mr-1" />
                                Add Option
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                  <span className="text-gray-400 flex-shrink-0">
                                    {question.type === 'single-choice' ? '○' : '☐'}
                                  </span>
                                  <input
                                    {...register(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.value` as const, {
                                      required: 'Option text is required'
                                    })}
                                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    disabled={question.options!.length <= 2}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )) || (
                                <div className="text-center py-4">
                                  <p className="text-sm text-gray-500 mb-2">No options added yet</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addOption(sectionIndex, questionIndex);
                                      addOption(sectionIndex, questionIndex);
                                    }}
                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                  >
                                    <PlusIcon className="w-3 h-3 mr-1" />
                                    Add First Options
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Numeric range settings */}
                        {question.type === 'numeric' && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Number Range (Optional)
                            </label>
                            <div className="flex items-center space-x-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Min</label>
                                <input
                                  type="number"
                                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.min` as const, { valueAsNumber: true })}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="0"
                                />
                              </div>
                              <span className="text-gray-400 mt-5">to</span>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Max</label>
                                <input
                                  type="number"
                                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.max` as const, { valueAsNumber: true })}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="100"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* File upload settings */}
                        {question.type === 'file' && (
                          <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                              File Upload Settings
                            </label>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Allowed File Types
                                </label>
                                <input
                                  type="text"
                                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.fileTypes` as const)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="e.g., .pdf,.doc,.docx,.jpg,.png"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                  Separate multiple types with commas
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Max File Size (MB)
                                </label>
                                <input
                                  type="number"
                                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.maxFileSize` as const, { valueAsNumber: true })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="10"
                                  min="1"
                                  max="100"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                {...register(`sections.${sectionIndex}.questions.${questionIndex}.allowMultiple` as const)}
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <label className="text-sm text-gray-700">Allow multiple files</label>
                            </div>
                            
                            {/* File upload modes */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-700">Test File Upload</h4>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                  <button
                                    type="button"
                                    onClick={() => setFileUploadMode(prev => ({ ...prev, [`${sectionIndex}-${questionIndex}`]: 'preview' }))}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                      fileUploadMode[`${sectionIndex}-${questionIndex}`] !== 'actual'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                  >
                                    Preview
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFileUploadMode(prev => ({ ...prev, [`${sectionIndex}-${questionIndex}`]: 'actual' }))}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                      fileUploadMode[`${sectionIndex}-${questionIndex}`] === 'actual'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                  >
                                    Test Upload
                                  </button>
                                </div>
                              </div>
                              
                              {fileUploadMode[`${sectionIndex}-${questionIndex}`] === 'actual' ? (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-xs text-blue-600 mb-2">Test the actual file upload functionality:</p>
                                  <FileUpload 
                                    accept={question.fileTypes}
                                    maxSize={question.maxFileSize || 10}
                                    multiple={question.allowMultiple || false}
                                    required={question.required}
                                    onFilesChange={(files) => {
                                      console.log('Files uploaded for testing:', files);
                                      // Store files in a test state if needed
                                    }}
                                    label="Test File Upload"
                                  />
                                </div>
                              ) : (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-2">Preview (what candidates will see):</p>
                                  <FileUploadPreview 
                                    fileTypes={question.fileTypes}
                                    maxFileSize={question.maxFileSize}
                                    required={question.required}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <QuestionMarkCircleIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No questions in this section yet.</p>
                      <p className="text-xs text-gray-400">Click "Add Question" below to get started.</p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => addQuestion(sectionIndex)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-200 rounded-xl text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Question</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/20">
          <Link
            to="/assessments"
            className="px-6 py-2 glass border border-white/30 text-gray-700 font-medium rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || saveAssessmentMutation.isPending}
            className="inline-flex items-center px-8 py-3 bg-primary-gradient text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isSubmitting || saveAssessmentMutation.isPending) ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {mode === 'edit' ? 'Update Assessment' : 'Create Assessment'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentBuilder;
