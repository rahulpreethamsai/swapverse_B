import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/layout/Navbar";
import ProposeSwap from "../components/swaps/ProposeSwap"; 

interface Owner {
    _id: string, 
    name: string,
    email: string
}

interface Item {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    estimatedValue?: number;
    condition?: string;
    images: string[];
    owner?: Owner;
    status: string;
    date?: string;
}

interface UserSwap {
    _id: string;
    itemRequestedId: { _id: string }; 
    status: string;
}

const DetailRow = ({ label, value, status }: { label: string, value: any, status?: string }) => {
    let colorClass = "text-gray-300";
    if (status === "available") {
        colorClass = "text-green-400 font-bold";
    } else if (status === "swapped" || status === "underReview") {
        colorClass = "text-yellow-400 font-bold";
    }
    return (
        <div className="flex justify-between items-center py-1">
            <span className="font-medium text-white">{label}:</span>
            <span className={colorClass}>{value}</span>
        </div>
    );
}

function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<Item | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, isLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const [hasActiveProposal, setHasActiveProposal] = useState(false); 
    
    const { user } = useAuth();

    useEffect(() => {
        if (!id || !user) {
            isLoading(false);
            return;
        }

        async function fetchData() {
            isLoading(true);
            try {
                const { data: itemData } = await API.get(`/items/${id}`);
                setItem(itemData.item || null);

                const { data: swapData } = await API.get('/swaps/my-swaps'); 
                
                const activeProposal = swapData.swaps.some((swap: UserSwap) => 
                    swap.itemRequestedId?._id === id && 
                    swap.status !== 'cancelled' && 
                    swap.status !== 'closed' &&
                    swap.status !== 'disputed' 
                );
                setHasActiveProposal(activeProposal);

            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load details.");
            } finally {
                isLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const isOwner = user && item && item.owner && user._id === item.owner._id;
    const canPropose = user && item && item.status === "available" && !isOwner && !hasActiveProposal;
    const notLoggedIn = !user;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <img src="https://media.tenor.com/UnFx-k_lSckAAAAM/amalie-steiness.gif" alt="Loading" className="w-20 h-20" />
            </div>
        );
    }
    if (error || !item) {
        return (
            <div className="min-h-screen p-5 bg-black">
                <Navbar />
                <p className="text-red-500 text-center text-xl mt-10">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black text-white p-5">
            <Navbar />
            <div className="mt-10 max-w-6xl mx-auto p-8 bg-[#1F1F1F] rounded-xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-blue-200 mb-6">{item.name}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <img src={item.images[0]} alt={item.name} className="w-full h-80 object-contain rounded-lg shadow-xl" />
                        <div className="flex gap-2 overflow-x-auto">
                            {item.images.map((imgUrl, index) => (
                                <img key={index} src={imgUrl} alt={`Image ${index + 1}`} className="w-20 h-20 object-cover rounded-md cursor-pointer hover:border-2 border-[#F4C430]" />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-lg text-gray-300 border-b border-gray-700 pb-2">{item.description}</p>
                        <DetailRow label="Category" value={item.category} />
                        <DetailRow label="Condition" value={item.condition?.toUpperCase()} />
                        <DetailRow label="Estimated Value" value={`₹${item.estimatedValue?.toLocaleString()}`} />
                        <DetailRow label="Status" value={item.status.toUpperCase()} status={item.status} />

                        <div className="pt-4 border-t border-gray-700">
                            <h3 className="text-xl font-semibold mb-2">Owner Details</h3>
                            <DetailRow label="Name" value={item.owner?.name} />
                            <DetailRow label="Email" value={item.owner?.email} /> 
                        </div>


                        
                        {canPropose && (
                            <button className="mt-6 w-full bg-blue-200 text-black font-bold py-3 rounded-lg hover:bg-blue-100 transition duration-200 cursor-pointer" onClick={handleOpenModal}>
                                PROPOSE A SWAP
                            </button>
                        )}
                        
                        {hasActiveProposal && (
                            <div className="mt-4 p-3 text-center bg-yellow-900/50 text-yellow-300 rounded-lg font-semibold">
                                You have a pending or active proposal for this item. Check the SWAPS tab.
                            </div>
                        )}

                        {isOwner && (
                            <Link to={`/items/edit/${item._id}`}>
                                <button className="mt-6 w-full bg-blue-200 text-black font-bold py-3 rounded-lg hover:bg-blue-100 transition duration-200 cursor-pointer">
                                    EDIT ITEM
                                </button> 
                            </Link>
                        )}
                        
                        {isOwner && (
                            <div className="mt-4 p-3 text-center bg-blue-900/50 text-blue-300 rounded-lg">
                                This is your item. Manage it or edit its details.
                            </div>
                        )}

                        {notLoggedIn && (
                            <div className="mt-4 p-3 text-center bg-red-900/50 text-red-300 rounded-lg">
                                <Link to="/auth" className="underline font-semibold">Sign In</Link> to propose a swap for this item.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {isModalOpen && item && item.owner && (
                <ProposeSwap
                    itemRequestedId={item._id}
                    itemOwnerId={item.owner._id}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}

export default ItemDetails;