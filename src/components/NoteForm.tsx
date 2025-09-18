// src/components/NoteForm.tsx
import React, { useState, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import type { ChangeEvent } from 'react';

const MENTION_SUGGESTIONS = ['alice', 'bob', 'charlie', 'david', 'manager', 'interviewer', 'recruiter'];

type OnSubmitData = {
  note: string;
};

interface NoteFormProps {
  onSubmit: (data: OnSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [html, setHtml] = useState('');
  const textRef = useRef('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const editableDivRef = useRef<HTMLDivElement | null>(null);

  // --- 1. NEW: State to hold the suggestion box position ---
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  const highlightMentions = (text: string) => {
    return text.replace(/(@\w+)/g, '<strong class="text-indigo-600 font-semibold">$&</strong>');
  };

  // --- 2. NEW: Function to calculate the cursor's position ---
  const updateSuggestionPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = editableDivRef.current?.getBoundingClientRect();

    if (containerRect) {
      // Position the box below the current line of text
      setSuggestionPosition({
        top: rect.bottom - containerRect.top,
        left: rect.left - containerRect.left,
      });
    }
  };

  const handleContentChange = (evt: ChangeEvent<HTMLDivElement>) => {
    const newText = evt.currentTarget.textContent || '';
    textRef.current = newText;
    setHtml(highlightMentions(newText));

    const lastWord = newText.split(/\s+/).pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 0) { // Allow @ to show all
      const searchTerm = lastWord.substring(1).toLowerCase();
      const filtered = MENTION_SUGGESTIONS.filter(name => name.toLowerCase().startsWith(searchTerm));
      
      if (filtered.length > 0) {
        // --- 3. If we have suggestions, calculate the position ---
        updateSuggestionPosition();
        setSuggestions(filtered);
        setIsSuggestionsVisible(true);
      } else {
        setIsSuggestionsVisible(false);
      }
    } else {
      setIsSuggestionsVisible(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    const currentText = textRef.current;
    const parts = currentText.split(/\s+/);
    parts.pop();
    const newText = [...parts, `@${name} `].join(' ');
    
    textRef.current = newText;
    setHtml(highlightMentions(newText));
    setIsSuggestionsVisible(false);
    editableDivRef.current?.focus();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ note: textRef.current });
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">
            Add an optional note (e.g., @interviewer review this)
          </label>
          
          <ContentEditable
            innerRef={editableDivRef as any}
            html={html}
            onChange={handleContentChange as any}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500 min-h-[90px]"
          />
        </div>
        
        {isSuggestionsVisible && (
          // --- 4. Apply the dynamic position using inline styles ---
          <div
            style={{ top: suggestionPosition.top, left: suggestionPosition.left }}
            className="absolute z-10 w-48 bg-white border border-indigo-500 rounded-md shadow-lg max-h-40 overflow-y-auto"
          >
            <ul>
              {suggestions.map(name => (
                <li
                  key={name}
                  // Use onMouseDown to prevent the editor from losing focus before the click registers
                  onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(name); }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Skip
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
            {isSubmitting ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;