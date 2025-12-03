import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import DisputeForm from "../components/swaps/DisputeSwap"; 
import ReviewForm from "../components/swaps/ReviewSwap"; 

interface UserSummary {
    _id: string;
    name: string;
    email: string;
}

interface ItemSummary {
    _id: string;
    name: string;
    images: string[];
    estimatedValue: number;
}

interface Swap {
    _id: string;
    fromUserId: UserSummary;
    toUserId: UserSummary;
    itemRequestedId: ItemSummary;
    itemOfferedId: ItemSummary | null;
    depositAmount: number;
    startDate: string;
    endDate: string;
    status: "proposed" | "accepted" | "in_escrow" | "picked_up" | "returned" | "closed" | "disputed" | "cancelled";
}

type ActiveTab = 'incoming' | 'outgoing' | 'active' | 'history';

function SwapPage() {
    const [allSwaps, setAllSwaps] = useState<Swap[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('incoming');
    const { user } = useAuth();
    
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean, swapId: string, toUserId: string } | null>(null);
    const [disputeModal, setDisputeModal] = useState<{ isOpen: boolean, swapId: string } | null>(null);

    async function fetchUserSwaps() {
        if (!user) {
            setLoading(false);
            setError("Please log in to view your swaps.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await API.get('/swaps/my-swaps'); 
            setAllSwaps(data.swaps || []);
            setError('');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch swap data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUserSwaps();
    }, [user]);

    const handleSwapAction = async (swapId: string, actionType: 'accept' | 'cancel' | 'confirmPickup' | 'confirmReturn' | 'finish') => {
        if (!window.confirm(`Are you sure you want to perform the action: ${actionType}?`)) return;

        try {
            setLoading(true);
            const endpoint = `/swaps/${swapId}/${actionType}`;

            const { data } = await API.post(endpoint); 
            
            alert(data.message);

            await fetchUserSwaps(); 

        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${actionType} swap.`);
        } finally {
            setLoading(false);
        }
    };
    
    const filters = {
        incoming: allSwaps.filter(s => s.toUserId._id === user?._id && s.status === 'proposed'),
        outgoing: allSwaps.filter(s => s.fromUserId._id === user?._id && s.status === 'proposed'),
        active: allSwaps.filter(s => ['in_escrow', 'picked_up', 'returned'].includes(s.status)),
        history: allSwaps.filter(s => ['closed', 'cancelled', 'disputed'].includes(s.status)),
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <img src="https://media.tenor.com/UnFx-k_lSckAAAAM/amalie-steiness.gif" alt="Loading" className="w-20 h-20" />
            </div>
        );
    }
    if (error) {
        return <p className="text-red-500 text-center mt-20">{error}</p>;
    }
    if (!user) {
        return (
            <div className="min-h-screen p-5 bg-black">
                <Navbar />
                <p className="text-red-500 text-center text-xl mt-10">You must be signed in to view your swaps.</p>
            </div>
        );
    }

    const currentList = filters[activeTab];

    return (
        <div className="min-h-screen w-full bg-black p-5">
            <Navbar />

            <div className="flex justify-between items-center py-5 px-5">
                 <h1 className="text-3xl font-bold text-white">Your Swap Dashboard</h1>
                 <Link to="/items/new"> 
                    <button className="font-semibold bg-blue-200 text-black px-4 py-2 rounded-md hover:scale-105 transition duration-300">
                        + ADD NEW ITEM
                    </button>
                 </Link>
            </div>

            <div className="flex flex-row gap-5 p-5">

                <div className="w-1/4 bg-[#1F1F1F] shadow-2xl rounded-lg p-5 h-min sticky top-5">
                    <h2 className="text-xl font-bold text-white mb-4">Swap Status Filter</h2>
                    {Object.entries(filters).map(([key, list]) => (
                        <button 
                            key={key}
                            onClick={() => setActiveTab(key as ActiveTab)}
                            className={`w-full text-left p-3 rounded-lg font-semibold transition-colors mb-2 capitalize flex justify-between items-center ${activeTab === key ? 'bg-[#F4C430] text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            <span>
                                {key === 'incoming' ? 'Incoming Proposals' : key === 'outgoing' ? 'Proposals Sent' : key}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === key ? 'bg-black text-[#F4C430]' : 'bg-gray-600'}`}>
                                {list.length}
                            </span>
                        </button>
                    ))}
                </div>

                <aside className="bg-[#1F1F1F] shadow-2xl rounded-lg p-5 w-3/4">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3 capitalize">
                        {activeTab === 'incoming' ? 'Incoming Proposals' : activeTab === 'outgoing' ? 'Proposals Sent' : `${activeTab} Swaps`}
                    </h2>
                    
                    <div className="space-y-4">
                        {currentList.length > 0 ? (
                            currentList.map(swap => {
                                const isOwner = swap.toUserId._id === user._id;
                                const isProposer = swap.fromUserId._id === user._id;
                                const partnerId = isOwner ? swap.fromUserId._id : swap.toUserId._id;
                                const partnerName = isOwner ? swap.fromUserId.name : swap.toUserId.name;
                                
                           
                                const isReadyForReview = swap.status === 'closed' && isProposer;
                                const canBeDisputed = ['in_escrow', 'picked_up', 'returned'].includes(swap.status);
                                
                                return (
                                    <motion.div
                                        key={swap._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-5 bg-gray-800 rounded-xl shadow-md border border-gray-700"
                                    >
                                        <div className="flex justify-between items-start border-b border-gray-600 pb-3 mb-3">
                                            <div className="text-sm">
                                                {isOwner ? (
                                                    <p className="text-gray-400">Proposal from: <span className="font-semibold text-white">{partnerName}</span></p>
                                                ) : (
                                                    <p className="text-gray-400">Targeting: <span className="font-semibold text-white">{partnerName}</span></p>
                                                )}
                                                <p className="text-xs text-gray-500">Dates: {new Date(swap.startDate).toLocaleDateString()} to {new Date(swap.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase ${swap.status === 'proposed' ? 'bg-yellow-800 text-yellow-300' : swap.status === 'accepted' || swap.status === 'in_escrow' ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                                                {swap.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <img src={swap.itemRequestedId.images[0]} alt={swap.itemRequestedId.name} className="w-16 h-16 object-cover rounded-md border border-gray-500" />
                                            <div className="flex-grow">
                                                <p className="font-bold text-lg text-[#F4C430]">{swap.itemRequestedId.name} (Requested)</p>
                                                <p className="text-sm text-gray-300">
                                                    Offer: 
                                                    <span className="font-semibold ml-1">
                                                        {swap.itemOfferedId ? `Item: ${swap.itemOfferedId.name}` : `Deposit: ₹${swap.depositAmount.toLocaleString()}`}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3 justify-end">
                                  
                                            {isReadyForReview && (
                                                <button 
                                                    onClick={() => setReviewModal({ isOpen: true, swapId: swap._id, toUserId: partnerId })}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                                                >
                                                    Leave Review
                                                </button>
                                            )}

                                            {canBeDisputed && (
                                                <button 
                                                    onClick={() => setDisputeModal({ isOpen: true, swapId: swap._id })}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                                >
                                                    Raise Dispute
                                                </button>
                                            )}

                                            {activeTab === 'incoming' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleSwapAction(swap._id, 'accept')}
                                                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                                                    >Accept</button>
                                                    <button 
                                                        onClick={() => handleSwapAction(swap._id, 'cancel')}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                                    >Decline</button>
                                                </>
                                            )}
                                            
                                            {activeTab === 'outgoing' && swap.status === 'proposed' && (
                                                <button 
                                                    onClick={() => handleSwapAction(swap._id, 'cancel')}
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
                                                >Withdraw Proposal</button>
                                            )}
                                            
                                            {activeTab === 'active' && swap.status === 'in_escrow' && isOwner && (
                                                <button 
                                                    onClick={() => handleSwapAction(swap._id, 'confirmPickup')}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                                                >Confirm Pickup</button>
                                            )}
                                            {activeTab === 'active' && swap.status === 'picked_up' && (
                                                <button 
                                                    onClick={() => handleSwapAction(swap._id, 'confirmReturn')}
                                                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
                                                >Confirm Return</button>
                                            )}
                                            {activeTab === 'active' && swap.status === 'returned' && (
                                                <button 
                                                    onClick={() => handleSwapAction(swap._id, 'finish')}
                                                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
                                                >Finalize Swap</button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400">No transactions found in this category.</p>
                        )}
                    </div>
                </aside>
            </div>
            
            {reviewModal?.isOpen && (
                <ReviewForm
                    swapId={reviewModal.swapId}
                    toUserId={reviewModal.toUserId}
                    onClose={() => setReviewModal(null)}
                    onReviewSubmitted={fetchUserSwaps}
                />
            )}
            {disputeModal?.isOpen && (
                <DisputeForm
                    swapId={disputeModal.swapId}
                    onClose={() => setDisputeModal(null)}
                    onDisputeSubmitted={fetchUserSwaps}
                />
            )}
        </div>
    );
}

export default SwapPage;