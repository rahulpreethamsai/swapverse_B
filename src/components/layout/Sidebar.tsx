interface SidebarProps {
    searchQuery: string; 
    setSearchQuery: (query: string) => void; 
    categoryFilters: string[];
    setCategoryFilters: React.Dispatch<React.SetStateAction<string[]>>;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    sortType: string;
    setSortType: (sort: string) => void;
    availableCategories: string[];
}

function Sidebar({ 
    searchQuery, 
    setSearchQuery,
    categoryFilters, 
    setCategoryFilters, 
    statusFilter, 
    setStatusFilter, 
    sortType, 
    setSortType,
    availableCategories
}: SidebarProps) {

    const handleCategoryChange = (category: string) => {
        setCategoryFilters(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category]
        );
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-[#1F1F1F] rounded-xl shadow-2xl sticky top-20 h-fit min-w-[250px]">
            
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Search</h2>
                <input 
                    type="search" 
                    placeholder="Search by Name..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full p-2 rounded-lg shadow-lg bg-black/60 text-white border border-slate-600 outline-none" 
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Category</h2>
                <div className="flex flex-col gap-2">
                    {availableCategories.map((category) => (
                        <label key={category} className="flex items-center text-white cursor-pointer hover:text-pink-400 transition-colors">
                            <input
                                type="checkbox"
                                value={category}
                                checked={categoryFilters.includes(category)}
                                onChange={() => handleCategoryChange(category)}
                                className="mr-3 w-4 h-4 text-pink-400 bg-gray-600 border-gray-500 rounded focus:ring-pink-500"
                            />
                            {category}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Status</h2>
                <div className="flex flex-col gap-2">
                    {['available', 'unavailable'].map((status) => (
                        <label key={status} className="flex items-center text-white cursor-pointer hover:text-pink-400 transition-colors">
                            <input
                                type="radio"
                                name="statusFilter"
                                value={status}
                                checked={statusFilter === status}
                                onChange={() => setStatusFilter(status)}
                                className="mr-3 w-4 h-4 text-pink-400 bg-gray-600 border-gray-500 focus:ring-pink-500"
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </label>
                    ))}
                    <label className="flex items-center text-white cursor-pointer hover:text-pink-400 transition-colors">
                        <input
                            type="radio"
                            name="statusFilter"
                            value=""
                            checked={statusFilter === ""}
                            onChange={() => setStatusFilter("")}
                            className="mr-3 w-4 h-4 text-pink-400 bg-gray-600 border-gray-500 focus:ring-pink-500"
                        />
                        All Statuses
                    </label>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Sort By</h2>
                <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    className="w-full bg-black/60 text-white p-2 rounded-lg border border-slate-600 outline-none"
                >
                    <option value="newest">Newest First (Default)</option>
                    <option value="oldest">Oldest First</option>
                    <option value="value_high">Value: High to Low</option>
                    <option value="value_low">Value: Low to High</option>
                    <option value="name_asc">Name: A-Z</option>
                </select>
            </div>
        </div>
    );
}

export default Sidebar;