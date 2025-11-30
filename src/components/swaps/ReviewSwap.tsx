import React, { useState } from 'react';
import API from '../../services/api';

interface ReviewFormProps {
    swapId: string;
    toUserId: string;
    onClose: () => void;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ swapId, toUserId, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await API.post('/review', {
                swapId,
                toUserId,
                rating: Number(rating),
                comment,
            });

            alert('Review submitted successfully! Thank you for your feedback.');
            onReviewSubmitted();
            onClose();
        } catch (err: any) {
            console.error("Review submission failed:", err);
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#1F1F1F] p-8 rounded-xl shadow-2xl w-full max-w-md text-white">
                <h2 className="text-2xl font-bold text-[#F4C430] mb-4">Leave Review</h2>
                <p className="text-sm text-gray-400 mb-4">Rate your swap partner out of 5 stars.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            required
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                            placeholder="Share your experience..."
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600">
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;