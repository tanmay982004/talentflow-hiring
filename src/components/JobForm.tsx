import React, {useEffect} from 'react';
import  {useForm, type SubmitHandler} from 'react-hook-form';
import type {Job} from '../types';


type FormValues = {
    title: string;
    slug: string;
    tags: string;
    summary: string;
}

interface JobFormProps{
    onSubmit: SubmitHandler<FormValues>;
    onCancel: ()=> void;
    job?:Job | null;
    isSubmitting: boolean;
}

const JobForm: React.FC<JobFormProps> = ({onSubmit,onCancel,job,isSubmitting})=>{
    const { register, handleSubmit, formState:{errors},reset} = useForm<FormValues>();
    useEffect(()=>{
        if(job){
            reset({
                title: job.title,
                slug: job.slug,
                tags: job.tags.join(', '),
                summary: job.summary,
            });
        } else{
            reset({title:'',slug:'',tags:'',summary:''});
        }
    },[job,reset]);
    return(
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700'>
                    Title
                </label>
                <input id ='title' {...register('title',{required:'Title is required'})}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
                {errors.title && <p className='mt-1 text-sm text-red-600'>{errors.title.message}</p>}
            </div>

            <div>
             
                <input type='hidden' {...register('slug')}/>
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Job Summary</label>
                    <textarea
                    id="summary"
                    {...register('summary', { required: 'A summary is required.' })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter a brief description of the job..."
                    />
                    {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>}
                </div>
                   
            </div>

            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input
                    id="tags"
                    {...register('tags')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isSubmitting ? 'Saving...' : 'Save Job'}
                </button>
            </div>
        </form>
    );
};

export default JobForm;