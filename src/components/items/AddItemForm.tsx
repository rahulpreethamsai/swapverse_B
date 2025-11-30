import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../layout/Navbar";

interface ItemFormData {
    name: string;
    description: string;
    category: string;
    estimatedValue: number;
    condition: string;
    images: string[];
}

const initialItemState: ItemFormData = {
    name: '',
    description: '',
    category: '',
    estimatedValue: 0,
    condition: 'used',
    images: [], 
};

function AddItemForm() {
    const [formData, setFormData] = useState(initialItemState);
    const [loading, isLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, images: [base64String] });
                setImagePreview(base64String); 
            };
            reader.readAsDataURL(file); 
        } else {
             setFormData({ ...formData, images: [] });
             setImagePreview(null);
             if (e.target.value) setError("Please upload a valid image file.");
        }
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        isLoading(true);

        if (!formData.name || !formData.description || !formData.category || formData.estimatedValue <= 0 || formData.images.length === 0) {
             setError("Please fill all fields and upload an image.");
             isLoading(false);
             return;
        }

        try {
            await API.post('/items', { 
                ...formData, 
                estimatedValue: Number(formData.estimatedValue), 
            });
            alert("Item Added Successfully!!");
            navigate('/my-items');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Unable To Add Item (Failed)")
        } finally {
            isLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-5">
            <Navbar />
            <div className="max-w-xl mx-auto mt-10 p-6 bg-[#1F1F1F] rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-blue-200 mb-6">List a New Item</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white">Item Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-white">Item Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 border border-gray-600" rows={4} />
                    </div>
                    <div>
                        <label className="block text-white">Item Category</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-white">Item Estimated Value (₹)</label>
                       
                        <input type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-white">Condition</label>
                        <select name="condition" value={formData.condition} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                            <option value="used">Used</option>
                            <option value="new">New</option>
                            <option value="refurbished">Refurbished</option>
                        </select>
                    </div>

                    <div className="border border-dashed border-gray-600 p-4 rounded-md">
                        <label htmlFor="imageUpload" className="block text-white mb-2">Upload Primary Item Photo</label>
                        <input 
                            type="file" 
                            id="imageUpload" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            required
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-200 file:text-black hover:file:bg-blue-300"
                        />
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-gray-400 text-sm mb-2">Image Preview</p>
                                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border border-gray-500" />
                            </div>
                        )}
                        <p className="text-xs text-red-400 mt-2">Note: Image is converted to a large string (Base64) for submission. Requires cloud storage for scalability.</p>
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full text-white font-bold py-2 rounded border border-white hover:bg-white hover:text-black hover:scale-105 transition duration-200 cursor-pointer">
                        {loading ? 'Posting...' : 'POST ITEM'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddItemForm