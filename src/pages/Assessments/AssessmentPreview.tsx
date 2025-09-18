// src/pages/Assessments/AssessmentPreview.tsx
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Assessment, Question, AssessmentSection } from '../../types';

// The PreviewInput component is unchanged and correct.
const PreviewInput: React.FC<{ question: Question, answer: any, onChange: (value: any) => void }> = ({ question, answer, onChange }) => {
    const { type, label, options = [] } = question;
    switch (type) {
        case 'short-text':
        case 'numeric':
            return <div><label className="block text-sm font-medium text-gray-700">{label}</label><input value={answer || ''} onChange={(e) => onChange(e.target.value)} type={type === 'numeric' ? 'number' : 'text'} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" /></div>;
        case 'long-text':
            return <div><label className="block text-sm font-medium text-gray-700">{label}</label><textarea value={answer || ''} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" /></div>;
        case 'single-choice':
            return <div><label className="block text-sm font-medium text-gray-700">{label}</label><div className="mt-2 space-y-2">{options.map((opt, i) => <div key={i} className="flex items-center"><input checked={answer === opt.value} onChange={(e) => onChange(e.target.value)} type="radio" value={opt.value} name={question.id} className="h-4 w-4 border-gray-300" /><label className="ml-2 text-sm text-gray-600">{opt.value}</label></div>)}</div></div>;
        case 'multi-choice':
            return <div><label className="block text-sm font-medium text-gray-700">{label}</label><div className="mt-2 space-y-2">{options.map((opt, i) => <div key={i} className="flex items-center"><input checked={Array.isArray(answer) && answer.includes(opt.value)} onChange={() => { const newAnswer = Array.isArray(answer) ? (answer.includes(opt.value) ? answer.filter(v => v !== opt.value) : [...answer, opt.value]) : [opt.value]; onChange(newAnswer); }} type="checkbox" value={opt.value} className="h-4 w-4 border-gray-300 rounded" /><label className="ml-2 text-sm text-gray-600">{opt.value}</label></div>)}</div></div>;
        default:
            return null;
    }
}

const AssessmentPreview: React.FC = () => {
  const { watch } = useFormContext<Assessment>();
  const assessmentData = watch();
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setPreviewAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const sanitizeString = (str: any): string => {
    return String(str || '') // Safely convert to string
      .toLowerCase()       // Convert to lowercase
      .replace(/\s+/g, ''); // Remove ALL whitespace (spaces, tabs, etc.)
  };

  // --- THIS IS THE DEFINITIVE FIX ---
  const isQuestionVisible = (question: Question) => {
    const condition = question.condition;
    if (!condition?.questionId || !condition.value) {
      return true; // Always visible if no condition
    }

    // Find the question that this one depends on from the form structure
    const allQuestions = assessmentData.sections?.flatMap(s => s.questions) || [];
    const targetQuestion = allQuestions.find(q => q.id === condition.questionId);
    if (!targetQuestion) return true; // Failsafe if the target question is deleted

    // Get the answer for the target question from our preview state
    const targetAnswer = previewAnswers[condition.questionId];

    const sanitizedConditionValue = sanitizeString(condition.value);
    // Now, check the condition based on the TARGET question's type
    switch (targetQuestion.type) {
      case 'single-choice':
      case 'short-text':
      case 'long-text':
      case 'numeric':
        // Sanitize the user's answer before comparing
        return sanitizeString(targetAnswer) === sanitizedConditionValue;
      
      case 'multi-choice':
        // For multi-choice, we check if the sanitized version of any of the
        // selected options matches the sanitized condition value.
        return (
          Array.isArray(targetAnswer) &&
          targetAnswer.some(answerOption => sanitizeString(answerOption) === sanitizedConditionValue)
        );
      default:
        return true; // Default to visible if the type is unknown
    }
  };

  return (
    <div className="p-4 bg-white border rounded-md min-h-[300px] space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-800">{assessmentData?.title || 'Assessment Title'}</h2>
      {assessmentData?.sections?.map((section: AssessmentSection) => (
        <div key={section.id}>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-700">{section.title || 'Section Title'}</h3>
          <div className="space-y-4">
            {section.questions?.filter(isQuestionVisible).map((question: Question) => 
              <PreviewInput 
                key={question.id} 
                question={question}
                answer={previewAnswers[question.id]}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentPreview;
