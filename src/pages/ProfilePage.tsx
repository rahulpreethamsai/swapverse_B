import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import API from "../services/api";

interface Review {
    _id: string;
    rating: number;
    comment: string;
    fromUserId: { name: string };
}

function Profile() {
    const { user, logout } = useAuth();
    const [trustScore, setTrustScore] = useState(0);
    const [kycImage, setKycImage] = useState<string | null>(null);
    const [uploadMsg, setUploadMsg] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileMsg, setProfileMsg] = useState("");
    
 
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        let score = 0;
        const targetScore = user?.trust?.score || 50; 
        const interval = setInterval(() => {
            if (score < targetScore) {
                score += 1;
                setTrustScore(score);
            } else {
                clearInterval(interval);
            }
        }, 40);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const savedProfile = localStorage.getItem("profileImage");
        const savedKyc = localStorage.getItem("kycImage");
        if (savedProfile) setProfileImage(savedProfile);
        if (savedKyc) {
            setKycImage(savedKyc);
            setUploadMsg("Aadhar loaded from previous session");
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        async function fetchReviews() {
            try {
                const { data } = await API.get(`/review/${user?._id}`); 
                setReviews(data || []); 
            } catch (e) {
                console.error("Failed to fetch reviews", e);
            } finally {
                setReviewsLoading(false);
            }
        }
        fetchReviews();
    }, [user]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setKycImage(reader.result as string);
                setUploadMsg("Aadhar Uploaded Successfully");
                localStorage.setItem("kycImage", reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setUploadMsg("Please upload a valid image file (jpg/png)");
        }
    };

    const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
                setProfileMsg("Profile Image Uploaded");
                localStorage.setItem("profileImage", reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setProfileMsg("Please upload a valid image file (jpg/png)");
        }
    };


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a40] to-[#101020] text-white">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold text-[#F4C430] mb-4">
                        Please Log In
                    </h1>
                    <Link to="/auth">
                        <button className="border border-[#5169BD] px-6 py-2 rounded-md text-[#F4C430] hover:bg-[#F4C430] hover:text-[#1a1a40] transition-all duration-200">
                            Go to Login
                        </button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#2a2a2a] via-[#1c1c1c] to-black text-white px-10 py-12">
            <div className="flex flex-row justify-between items-center">
                <Link to='/'>
                    <img src="https://www.shutterstock.com/shutterstock/videos/1078496810/thumb/1.jpg?ip=x480" className="w-12 h-12 rounded-full border-2 border-black" alt='home-logo' />
                </Link>
                <h1 className="text-3xl tracking-wide font-bold">
                    Profile Page
                </h1>
                <Link to="/auth">
                    <button
                        onClick={() => { localStorage.removeItem("profileImage"); localStorage.removeItem("kycImage"); logout(); }}
                        className="font-semibold border rounded-md shadow-lg px-4 py-2 border hover:scale-105 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
                    >
                        LOG OUT
                    </button>
                </Link>
            </div>

            <div className="flex flex-row items-center justify-start mt-10 gap-10 flex-wrap">
               
                <div className="relative">
                    <label
                        htmlFor="profileUpload"
                        className="cursor-pointer w-28 h-28 rounded-full overflow-hidden border-2 border flex items-center justify-center"
                        title="Upload profile image"
                    >
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm text-gray-300">Upload</span>
                        )}
                    </label>
                    <input id="profileUpload" type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
                    <p className="text-xs text-gray-400 mt-2">{profileMsg}</p>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-2xl font-semibold">{user.name}</p>
                    <p className="text-gray-300">{user.email}</p>
                    <p className="text-sm text-gray-400">KYC Status: {user.kycStatus.toUpperCase()}</p>
                </div>

                <div className="ml-20 relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="white"
                            strokeWidth="6"
                            fill="none"
                            className="opacity-25"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="#F4C430"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="276"
                            strokeDashoffset={276 - (trustScore / 100) * 276}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">
                        {trustScore}%
                    </div>
                    <p className="text-sm text-white text-center mt-2">Trust Score</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mt-12 bg-[#1F1F1F] p-8 rounded-xl shadow-2xl w-[80%] mx-auto"
            >
                <h2 className="text-xl font-semibold  mb-4">
                    KYC Verification
                </h2>
                <div className="flex flex-col items-center gap-4">
                    <label htmlFor="kycUpload" className="cursor-pointer border-2 border-dashed w-[220px] h-[140px] rounded-lg flex items-center justify-center hover:bg-white transition-all duration-200">
                        {kycImage ? (
                            <img src={kycImage} alt="KYC Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <p className="text-gray-400 text-sm">Click to upload Aadhar</p>
                        )}
                    </label>
                    <input type="file" id="kycUpload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <p className="text-gray-400 text-sm">{uploadMsg}</p>
                    <div className="text-gray-300 text-sm text-center">
                        <p>Step 1: Upload Aadhar card</p>
                        <p>Step 2: Verify details</p>
                        <p>Step 3: Complete KYC verification</p>
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-row justify-between mt-16 w-[80%] mx-auto gap-10 flex-wrap">
                
   
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-1/2 border bg-[#1F1F1F] p-6 rounded-xl shadow-2xl"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Disputes & Admin Access
                    </h2>
                    <div className="text-gray-300 space-y-2">
                        <p>You have 0 disputes currently raised.</p>
                        {user.role === 'admin' && (
                            <Link to="/escrow" className="text-red-400 hover:underline mt-2 block font-semibold">
                                Go to Admin Dispute Board
                            </Link>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-1/2 border bg-[#1F1F1F] p-6 rounded-xl shadow-2xl"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Manage Swaps & Items
                    </h2>
                    <div className="flex flex-col gap-3">
                        <Link to="/swaps" className="bg-gray-700 p-3 rounded-md text-white hover:bg-gray-600 transition">
                            View Swap Dashboard (Proposals/Active)
                        </Link>
                        <Link to="/my-items" className="bg-gray-700 p-3 rounded-md text-white hover:bg-gray-600 transition">
                            View My Inventory & Requests Sent
                        </Link>
                    </div>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full border bg-[#1F1F1F] p-6 rounded-xl shadow-2xl mt-4"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        User Reviews Received
                    </h2>
                    {reviewsLoading ? (
                        <p className="text-gray-400">Loading reviews...</p>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {reviews.map(review => (
                                <div key={review._id} className="border-b border-gray-700 pb-2">
                                    <p className="text-lg font-bold" style={{ color: review.rating >= 4 ? '#4ADE80' : '#FBBF24' }}>
                                        Rating: {review.rating} / 5
                                    </p>
                                    <p className="text-gray-300 text-sm">"{review.comment}"</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        — Reviewed by {review.fromUserId?.name || 'User'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-300">No reviews received yet.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default Profile;