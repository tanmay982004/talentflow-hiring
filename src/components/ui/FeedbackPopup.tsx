import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
interface FeedbackPopupProps {
    message: string;
    show: boolean;
    type?: 'success' | 'info';
}
const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ message, show }) => {
if (!show) return null;
return (
// This will be a fixed-position element in the bottom-right corner
<div className="fixed top-5 left-1/2 -translate-x-1/2 z-20">
<div className="flex items-center gap-3 bg-green-600 text-white font-semibold py-3 px-5 rounded-lg shadow-xl animate-bounce">
<CheckCircleIcon className="h-6 w-6" />
<span>{message}</span>
</div>
</div>
);
};
export default FeedbackPopup;