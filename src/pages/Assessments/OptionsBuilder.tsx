
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

interface OptionsBuilderProps {
  sectionIndex: number;
  questionIndex: number;
}

const OptionsBuilder: React.FC<OptionsBuilderProps> = ({ sectionIndex, questionIndex }) => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions.${questionIndex}.options`
  });

  return (
    <div className="space-y-2 pl-4">
      <label className="text-sm font-medium text-gray-700">Options</label>
      {fields.map((option, optionIndex) => (
        <div key={option.id} className="flex items-center gap-2">
          <input
            {...register(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.value`)}
            placeholder={`Option ${optionIndex + 1}`}
            className="flex-grow text-sm border-gray-300 rounded-md shadow-sm"
          />
          <button type="button" onClick={() => remove(optionIndex)} className="text-gray-400 hover:text-red-600">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ value: '' })}
        className="w-full flex items-center justify-center gap-2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <PlusIcon className="h-4 w-4" />
        Add Option
      </button>
    </div>
  );
};

export default OptionsBuilder;