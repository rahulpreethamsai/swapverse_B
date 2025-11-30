import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function EditItemForm() {
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState<ItemFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchItemData() {
            if (!id) return;
            try {
                const { data } = await API.get(`/items/${id}`);
                if (data.success && data.item) {
                    setFormData({
                        name: data.item.name,
                        description: data.item.description || '',
                        category: data.item.category,
                        estimatedValue: data.item.estimatedValue,
                        condition: data.item.condition,
                        images: data.item.images?.length > 0 ? data.item.images : [''],
                    });
                    setImagePreview(data.item.images?.[0] || null); 
                } else {
                    setError("Item not found.");
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load item data.');
            } finally {
                setLoading(false);
            }
        }
        fetchItemData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (formData) {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file && formData) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, images: [base64String] });
                setImagePreview(base64String); 
            };
            reader.readAsDataURL(file); 
        } else if (formData) {
             setImagePreview(formData.images[0] || null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData) return;
        setLoading(true);

        try {
            await API.put(`/items/${id}`, {
                ...formData,
                estimatedValue: Number(formData.estimatedValue),
                images: formData.images.filter(img => img.length > 0)
            });

            alert('Item Updated Successfully!');
            navigate('/my-items');

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update item.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-white text-center mt-20">Loading item details...</p>;
    if (error) return <p className="text-red-500 text-center mt-20">{error}</p>;
    if (!formData) return null;

    return (
        <div className="min-h-screen bg-black text-white p-5">
            <Navbar />
            <div className="max-w-xl mx-auto mt-10 p-6 bg-[#1F1F1F] rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-blue-200 mb-6">Edit Item: {formData.name}</h1>
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
                        <label className="block text-gray-400">Condition</label>
                        <select name="condition" value={formData.condition} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                            <option value="used">Used</option>
                            <option value="new">New</option>
                            <option value="refurbished">Refurbished</option>
                        </select>
                    </div>
                    
                    <div className="border border-dashed border-gray-600 p-4 rounded-md">
                        <label htmlFor="imageUpload" className="block text-white mb-2">Change Item Photo</label>
                        {imagePreview && <img src={imagePreview} alt="Current Item Image" className="w-20 h-20 object-cover my-2 rounded-md" />}
                        <input 
                            type="file" 
                            id="imageUpload" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-200 file:text-black hover:file:bg-blue-300"
                        />
                         <p className="text-xs text-gray-400 mt-1">Select a new file to replace the current image.</p>
                    </div>


                    {error && <p className="text-red-500">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition duration-200">
                        {loading ? 'Updating...' : 'SAVE CHANGES'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditItemForm;