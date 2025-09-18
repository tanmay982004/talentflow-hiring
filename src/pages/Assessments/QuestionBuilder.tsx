// src/pages/Assessments/QuestionBuilder.tsx
import React from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import type { Assessment, Question, QuestionType } from '../../types';
import OptionsBuilder from './OptionsBuilder';

const QUESTION_TYPES: { value: QuestionType, label: string }[] = [
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' },
    { value: 'single-choice', label: 'Single Choice' },
    { value: 'multi-choice', label: 'Multiple Choice' },
    { value: 'numeric', label: 'Numeric' },
];

const SingleQuestionEditor: React.FC<{ sectionIndex: number; questionIndex: number; remove: () => void; }> = React.memo(({ sectionIndex, questionIndex, remove }) => {
    const { control, register } = useFormContext<Assessment>();

    const questionType = useWatch({ control, name: `sections.${sectionIndex}.questions.${questionIndex}.type` });
    const allSections = useWatch({ control, name: 'sections' }) || [];
    const currentQuestionId = useWatch({ control, name: `sections.${sectionIndex}.questions.${questionIndex}.id` });

    const availableQuestionsForCondition: Question[] = [];
    for (let sIdx = 0; sIdx < allSections.length; sIdx++) {
        const section = allSections[sIdx];
        if (sIdx < sectionIndex) {
            availableQuestionsForCondition.push(...(section.questions || []));
        } else if (sIdx === sectionIndex) {
            availableQuestionsForCondition.push(...(section.questions || []).slice(0, questionIndex));
        }
    }

    return (
        <div className="p-3 bg-gray-50 rounded-md border space-y-4">
            <div className="flex items-center gap-4">
                <input {...register(`sections.${sectionIndex}.questions.${questionIndex}.label`)} placeholder="Question Label" className="flex-grow border-gray-300 rounded-md shadow-sm" />
                <select {...register(`sections.${sectionIndex}.questions.${questionIndex}.type`)} className="border-gray-300 rounded-md shadow-sm">
                    {QUESTION_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <button type="button" onClick={remove} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>
            </div>
            
            {(questionType === 'single-choice' || questionType === 'multi-choice') && <OptionsBuilder sectionIndex={sectionIndex} questionIndex={questionIndex} />}
            
            <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id={`required-${currentQuestionId}`} {...register(`sections.${sectionIndex}.questions.${questionIndex}.required`)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                    <label htmlFor={`required-${currentQuestionId}`} className="text-sm font-medium text-gray-700">Required</label>
                </div>
                {questionType === 'numeric' && (
                    <div className="flex items-center gap-2 text-sm">
                        <label>Range:</label>
                        <input type="number" {...register(`sections.${sectionIndex}.questions.${questionIndex}.min`, { valueAsNumber: true })} placeholder="Min" className="w-20 border-gray-300 rounded-md shadow-sm" />
                        <span>-</span>
                        <input type="number" {...register(`sections.${sectionIndex}.questions.${questionIndex}.max`, { valueAsNumber: true })} placeholder="Max" className="w-20 border-gray-300 rounded-md shadow-sm" />
                    </div>
                )}
                <div className="text-sm space-y-1">
                    <label className="font-medium text-gray-700">Conditional Logic (Optional)</label>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span>Show if question</span>
                        <select {...register(`sections.${sectionIndex}.questions.${questionIndex}.condition.questionId`)} className="border-gray-300 rounded-md shadow-sm">
                            <option value="">-</option>
                            {availableQuestionsForCondition.map(q => <option key={q.id} value={q.id}>{`"${q.label || 'Untitled'}"`}</option>)}
                        </select>
                        <span>equals</span>
                        <input type="text" {...register(`sections.${sectionIndex}.questions.${questionIndex}.condition.value`)} placeholder="e.g., Yes" className="w-24 border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
});

const QuestionBuilder: React.FC<{ sectionIndex: number }> = ({ sectionIndex }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control, name: `sections.${sectionIndex}.questions`
  });

  return (
    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
      {fields.map((field, index) => (
        <SingleQuestionEditor key={field.id} sectionIndex={sectionIndex} questionIndex={index} remove={() => remove(index)} />
      ))}
      <button
        type="button"
        onClick={() => append({ id: nanoid(), label: '', type: 'short-text', required: false, options: [] })}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <PlusIcon className="h-4 w-4" /> Add Question
      </button>
    </div>
  );
};

export default QuestionBuilder;