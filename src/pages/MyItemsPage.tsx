import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import API from "../services/api";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


interface Item {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    estimatedValue: number;
    condition: string;
    images: string[];
    owner: string; 
    status: "available" | "swapped" | "underReview";
}


interface OutgoingSwap {
    _id: string;
    status: "proposed" | "accepted" | "in_escrow" | "closed" | "cancelled";
    itemRequestedId: { name: string }; 
    toUserId: { name: string }; 
}

function MyItemsPage() {
    const [userItems, setUserItems] = useState<Item[]>([]);
    const [outgoingSwaps, setOutgoingSwaps] = useState<OutgoingSwap[]>([]); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');
    const { user } = useAuth(); 

    useEffect(() => {
        async function fetchUserItems() {
            try {
                const { data } = await API.get('items/my-items');
                if (data.success && data.myItems) {
                    setUserItems(data.myItems || [])
                } else {
                    setError("Item Failed To Load!!")
                }
            } catch (err: any) {
                console.error("Error In Fetching", err);
                setError(err.message || "Failed to fetch items");
            } finally {
                setLoading(false)
            }
        };

        async function fetchOutgoingSwaps() {
            try {
                const { data } = await API.get('/swaps/my-swaps');

                const sentSwaps = (data.swaps || [])
                    .filter((s: any) => s.fromUserId._id === user?._id)
                    .map((s: any) => ({
                        _id: s._id,
                        status: s.status,
                        itemRequestedId: { name: s.itemRequestedId.name },
                        toUserId: { name: s.toUserId.name }
                    }));

                setOutgoingSwaps(sentSwaps);

            } catch (err) {
                console.error("Failed to fetch outgoing requests", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUserItems();
        if (user) fetchOutgoingSwaps();

    }, [user]);

    const handleDelete = async (itemId: string) => {
        if (!window.confirm("Are you sure you want to delete this item? This action is irreversible.")) return;

        try {

            await API.delete(`/items/${itemId}`);

            setUserItems(prev => prev.filter(item => item._id !== itemId));
            alert("Item deleted successfully!");
        } catch (err: any) {
            console.error("Delete Error", err);
            alert(`Failed to delete item: ${err.response?.data?.message || 'Server error'}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <img
                    src="https://media.tenor.com/UnFx-k_lSckAAAAM/amalie-steiness.gif"
                    alt="Loading"
                    className="w-20 h-20"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-5 bg-black">
                <Navbar />
                <p className="text-red-500 text-center text-xl mt-10">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black p-5">
            <Navbar />

            <div className="flex justify-between items-center py-5 px-5">
                <h1 className="text-3xl font-bold text-white">Your Inventory & Requests</h1>

                <Link to="/items/new">
                    <button className="font-semibold bg-blue-200 text-black px-4 py-2 rounded-md hover:scale-105 transition duration-300">
                        + ADD NEW ITEM
                    </button>
                </Link>
            </div>

            <div className="flex flex-row gap-5 p-5">

                <div className="w-1/4 bg-[#1F1F1F] shadow-2xl rounded-lg p-5 h-min sticky top-5">
                    <h2 className="text-xl font-bold text-white mb-4">Navigation</h2>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`w-full text-left p-3 rounded-lg font-semibold transition-colors mb-2 ${activeTab === 'inventory' ? 'bg-blue-200 text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        My Listings ({userItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`w-full text-left p-3 rounded-lg font-semibold transition-colors ${activeTab === 'requests' ? 'bg-blue-200 text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        Proposals Sent ({outgoingSwaps.length})
                    </button>
                </div>

                <aside className="bg-[#1F1F1F] shadow-2xl rounded-lg p-5 w-3/4">

                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">My Item Inventory</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userItems.length > 0 ? (
                                    userItems.map((item) => (
                                        <div
                                            key={item._id}
                                            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-white/20"
                                        >
                                            <Link to={`/itemDetails/${item._id}`}>
                                                <img
                                                    src={item.images?.[0]}
                                                    alt={item.name}
                                                    className="w-full h-40 object-cover cursor-pointer"
                                                />
                                            </Link>
                                            <div className="p-4">
                                                <h3 className="text-xl font-bold text-white truncate">{item.name}</h3>
                                                <p className="text-sm text-gray-400">Value: ₹{item.estimatedValue?.toLocaleString()}</p>
                                                <p className="text-sm font-semibold mt-1" style={{ color: item.status === 'available' ? '#4ADE80' : '#FBBF24' }}>
                                                    Status: {item.status.toUpperCase()}
                                                </p>

                                                <div className="mt-4 flex gap-3">
                                                    <Link to={`/items/edit/${item._id}`} className="flex-1">
                                                        <button className="w-full bg-blue-500 text-white text-sm py-1 rounded-md hover:bg-blue-600">
                                                            EDIT
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="flex-1 bg-red-500 text-white text-sm py-1 rounded-md hover:bg-red-600"
                                                    >
                                                        DELETE
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 col-span-full">You have not posted any items yet. Start swapping!</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">Proposals Sent ({outgoingSwaps.length})</h2>
                            <div className="space-y-4">
                                {outgoingSwaps.length > 0 ? (
                                    outgoingSwaps.map(req => (
                                        <div key={req._id} className="p-4 bg-black rounded-lg flex justify-between items-center">
                                            <p className="text-white">
                                                Requested: <span className="font-semibold">{req.toUserId.name}</span>
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-xs rounded-full font-bold ${req.status === 'proposed' ? 'bg-yellow-800 text-yellow-300' : req.status === 'accepted' ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                                {req.status === 'proposed' && (
                                                    <button className="bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600">
                                                        Cancel Request
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400">You haven't sent any swap proposals yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default MyItemsPage;