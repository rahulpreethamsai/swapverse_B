import React, { useState } from 'react';
import API from '../../services/api';

interface DisputeFormProps {
    swapId: string;
    onClose: () => void;
    onDisputeSubmitted: () => void;
}

const DisputeForm: React.FC<DisputeFormProps> = ({ swapId, onClose, onDisputeSubmitted }) => {
    const [evidence, setEvidence] = useState<string[]>(['']); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const filteredEvidence = evidence.filter(e => e.length > 0);
        if (filteredEvidence.length === 0) {
            setError("Please provide at least one image/description URL as evidence.");
            setLoading(false);
            return;
        }

        try {
            await API.post(`/swaps/${swapId}/raiseDispute`, { 
                evidencePhotos: filteredEvidence 
            });

            await API.post('/dispute', {
                swapId,
                evidence: filteredEvidence
            });

            alert('Dispute successfully raised! An admin will review the case shortly.');
            onDisputeSubmitted();
            onClose();

        } catch (err: any) {
            console.error("Dispute submission failed:", err);
            setError(err.response?.data?.message || 'Failed to raise dispute.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#1F1F1F] p-8 rounded-xl shadow-2xl w-full max-w-md text-white">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Raise Dispute</h2>
                <p className="text-sm text-gray-400 mb-4">Provide evidence regarding the swap issue (e.g., photo of damage, terms violation).</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Evidence Photo/URL (Base64)</label>
                        
                        <textarea
                            value={evidence[0]}
                            onChange={(e) => setEvidence([e.target.value])}
                            rows={4}
                            required
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                            placeholder="Paste Base64 string or an image URL here..."
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600">
                            {loading ? 'Submitting...' : 'Submit Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisputeForm;