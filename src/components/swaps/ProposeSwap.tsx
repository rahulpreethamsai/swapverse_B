import React, { useState, useEffect } from 'react';
import API from '../../services/api';

interface MyItem {
    _id: string;
    name: string;
    estimatedValue: number;
}

interface ProposeSwapProps {
    itemRequestedId: string;
    itemOwnerId: string;
    onClose: () => void;
}

const ProposeSwap: React.FC<ProposeSwapProps> = ({ itemRequestedId, itemOwnerId, onClose }) => {
    
    const [myAvailableItems, setMyAvailableItems] = useState<MyItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [itemOfferedId, setItemOfferedId] = useState<string>('');
    const [proposedAmount, setProposedAmount] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    const [error, setError] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');
    
    useEffect(() => {
        async function fetchMyItems() {
            try {
                const { data } = await API.get('/items/my-items'); 
                setMyAvailableItems(data.myItems || []); 
            } catch (err) {
                console.error("Failed to fetch user's items:", err);
                setError("Could not load your available items for swap.");
            } finally {
                setLoading(false);
            }
        }
        fetchMyItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        
        if (!itemOfferedId && proposedAmount <= 0) {
            return setError('Please select an item to offer OR propose a deposit amount.');
        }

        const swapData = {
            itemRequestedId: itemRequestedId,
            toUserId: itemOwnerId, 
            startDate,
            endDate,
            ...(itemOfferedId && { itemOfferedId }),
            ...(proposedAmount > 0 && { proposedAmount }),
        };

        try {
            const { data } = await API.post('/swaps', swapData);

            setSuccessMsg(data.message || "Swap Request Sent Successfully!");
            // 🚨 You will need to refresh the parent page's swap data here
            setTimeout(onClose, 2000); 

        } catch (err: any) {
            console.error("Swap submission failed:", err);
            setError(err.response?.data?.message || 'Failed to send swap request.');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading your items...</div>;
    
    if (error && !successMsg) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#1F1F1F] p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-4">Propose Swap</h2>
                
                {successMsg && <div className="p-3 mb-4 text-center bg-green-500/20 text-green-300 rounded-lg">{successMsg}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
                
                    <div className="bg-gray-700/50 p-3 rounded-md">
                        <label className="block text-sm font-medium mb-1">Item You Want:</label>
                        {/* Note: This should display the item's NAME, not ID, for better UX */}
                        <p className="font-semibold text-white truncate">{itemRequestedId}</p> 
                    </div>

                    <div>
                        <label htmlFor="itemOffered" className="block text-sm font-medium mb-1">Offer Your Item:</label>
                        <select
                            id="itemOffered"
                            value={itemOfferedId}
                            onChange={(e) => {
                                setItemOfferedId(e.target.value);
                                setProposedAmount(0); 
                            }}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            disabled={myAvailableItems.length === 0}
                        >
                            <option value="">{myAvailableItems.length > 0 ? '-- Select an Item --' : 'No items available to offer'}</option>
                            {myAvailableItems.map(item => (
                                <option key={item._id} value={item._id}>
                                    {item.name} (Value: ₹{item.estimatedValue})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-center text-sm font-semibold text-gray-500">OR</div>

                    <div>
                        <label htmlFor="proposedAmount" className="block text-sm font-medium mb-1">Propose Deposit Amount (₹):</label>
                        <input
                            id="proposedAmount"
                            type="number"
                            value={proposedAmount}
                            onChange={(e) => {
                                setProposedAmount(Number(e.target.value));
                                setItemOfferedId(''); 
                            }}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            placeholder="Enter amount (e.g., 500)"
                            min="0"
                            disabled={!!itemOfferedId}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date:</label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date:</label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-200 text-black font-bold rounded-md hover:bg-blue-100">
                            Send Proposal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProposeSwap;