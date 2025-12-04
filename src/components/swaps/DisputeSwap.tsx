import React, { useState } from 'react';
import API from '../../services/api';

interface DisputeFormProps {
    swapId: string;
    onClose: () => void;
    onDisputeSubmitted: () => void;
}

const DisputeForm: React.FC<DisputeFormProps> = ({ swapId, onClose, onDisputeSubmitted }) => {
    
    const [evidenceString, setEvidenceString] = useState<string>(''); 
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setEvidenceString(base64String); 
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file); 
        } else {
             setEvidenceString('');
             setImagePreview(null);
             if (e.target.value) setError("Please upload a valid image file.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const evidenceArray = [];
        if (evidenceString) {
            evidenceArray.push(evidenceString);
        }
        if (description) {
            evidenceArray.push(description);
        }

        if (evidenceArray.length === 0) {
            setError("Please provide an image, a description, or both as evidence.");
            setLoading(false);
            return;
        }

        try {

            await API.post(`/disputes/${swapId}`, {
                evidence: evidenceArray
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
                <p className="text-sm text-gray-400 mb-4">Provide evidence (photo, URL, or text description) regarding the swap issue.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="border border-dashed border-gray-600 p-4 rounded-md">
                        <label htmlFor='imageUpload' className="block text-sm font-medium mb-2">Upload Photo Evidence (Optional)</label>
                        <input
                            type="file"
                            id="imageUpload"
                            onChange={handleFileChange} 
                            accept="image/*"
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-200 file:text-black hover:file:bg-blue-300"
                        />
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-gray-400 text-sm mb-2">Image Preview</p>
                                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border border-gray-500" />
                            </div>
                        )}
                         <p className="text-xs text-yellow-400 mt-2">Only one photo can be uploaded using this method.</p>
                    </div>

                    <div>
                        <label htmlFor='descriptionInput' className="block text-sm font-medium mb-1">Detailed Description (Optional)</label>
                        <textarea
                            id="descriptionInput"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                            placeholder="Describe the issue, including URLs to external resources if necessary."
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