import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import { Link } from "react-router-dom";

interface Dispute {
    _id: string;
    swapId: { _id: string }; 
    raisedBy: { name: string }; 
    evidence: string[];
    status: "open" | "escalated" | "resolved";
    createdAt: string;
}

function DisputePage() {
    const { user } = useAuth();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resolutionText, setResolutionText] = useState("");
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    const isAdmin = user?.role === 'admin';

    async function fetchDisputes() {
        if (!isAdmin) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await API.get('/dispute/admin'); 
            setDisputes(data || []);
        } catch (err: any) {
            console.error("Dispute fetch failed:", err);
            setError(err.response?.data?.message || "Failed to fetch disputes.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDisputes();
    }, [user]);

    const handleResolve = async (id: string) => {
        if (!resolutionText || resolvingId !== id) {
            alert("Please enter a resolution text and confirm by clicking Resolve.");
            return;
        }

        try {
            await API.post(`/dispute/admin/${id}/resolve`, {
                resolution: resolutionText,
                status: "resolved"
            });
            alert("Dispute resolved successfully!");
            setResolutionText("");
            setResolvingId(null);
            fetchDisputes(); 
        } catch (err: any) {
            alert(`Failed to resolve dispute: ${err.response?.data?.message || 'Server error'}`);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white p-5 flex flex-col items-center">
                <h1 className="text-4xl text-red-500 mt-20">ACCESS DENIED</h1>
                <p className="text-gray-400 mt-4">You must be an administrator to view this page.</p>
                <Link to="/" className="text-blue-400 hover:underline mt-4">Go Home</Link>
            </div>
        );
    }
    
    if (loading) return <p className="text-white text-center mt-20">Loading dispute board...</p>;
    if (error) return <p className="text-red-500 text-center mt-20">{error}</p>;

    return (
        <div className="min-h-screen bg-black text-white p-5">
            <Navbar />
            <div className="max-w-7xl mx-auto mt-10">
                <h1 className="text-4xl font-bold text-red-400 mb-8">Admin Dispute Board</h1>
                
                {disputes.filter(d => d.status !== 'resolved').length === 0 ? (
                    <p className="text-gray-400 text-lg">No open or escalated disputes currently requiring action. Good job!</p>
                ) : (
                    <div className="space-y-6">
                        {disputes.filter(d => d.status !== 'resolved').map(dispute => (
                            <div key={dispute._id} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-red-900/50">
                                <div className="flex justify-between items-start border-b border-gray-700 pb-3 mb-3">
                                    <div>
                                        <p className="text-xl font-bold text-white">Dispute ID: {dispute._id.slice(-6)}</p>
                                        <p className="text-sm text-gray-400">Raised by: {dispute.raisedBy.name}</p>
                                        <p className="text-xs text-gray-500">Filed on: {new Date(dispute.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase ${dispute.status === 'open' ? 'bg-red-800 text-white' : 'bg-orange-800 text-white'}`}>
                                        {dispute.status}
                                    </span>
                                </div>
                                
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-300 mb-2">Evidence ({dispute.evidence.length} items):</h3>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                                        
                                        {dispute.evidence.map((url, index) => (
                                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                                                Evidence {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-700">
                                    <h3 className="text-lg font-bold text-white mb-2">Admin Resolution</h3>
                                    <textarea
                                        placeholder="Enter final decision and resolution details..."
                                        value={resolvingId === dispute._id ? resolutionText : ""}
                                        onChange={(e) => {setResolvingId(dispute._id); setResolutionText(e.target.value);}}
                                        rows={3}
                                        className="w-full p-2 rounded bg-black/50 text-white resize-none border border-gray-600 focus:border-red-500"
                                    />
                                    <button
                                        onClick={() => handleResolve(dispute._id)}
                                        disabled={!resolutionText || resolvingId !== dispute._id}
                                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                                    >
                                        Resolve Dispute
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DisputePage;