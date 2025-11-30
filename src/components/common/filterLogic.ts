interface Item {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    estimatedValue?: number;
    status: string;
    date?: string;
    images: string[];
}

export default function FilterLogic(
    items: Item[], 
    textQuery: string, 
    categoryFilters: string[], 
    statusFilter: string, 
    sortType: string
) {
    let filtered = [...items];

    const query = textQuery ? textQuery.toLowerCase() : '';
    const activeCategories = Array.isArray(categoryFilters) ? categoryFilters.map(c => c.toLowerCase()) : [];
    const activeStatus = statusFilter ? statusFilter.toLowerCase() : '';

    // 1. Text Search Filter (Name only for simplicity)
    if (query) {
        filtered = filtered.filter(item => {
            return item.name?.toLowerCase().includes(query);
        });
    }

    // 2. Category Checkbox Filter
    if (activeCategories.length > 0) {
        filtered = filtered.filter(item => {
            if (!item.category) return false;
            return activeCategories.includes(item.category.toLowerCase());
        });
    }

    // 3. Status Radio Filter
    if (activeStatus) {
        filtered = filtered.filter(item => {
            if (!item.status) return false;
            return item.status.toLowerCase() === activeStatus;
        });
    }

    // 4. Apply Sorting
    filtered.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        switch (sortType) {
            case 'newest':
                return dateB - dateA; 
            case 'oldest':
                return dateA - dateB; 
            case 'value_high':
                return (b.estimatedValue || 0) - (a.estimatedValue || 0);
            case 'value_low':
                return (a.estimatedValue || 0) - (b.estimatedValue || 0);
            case 'name_asc':
                return (a.name || '').localeCompare(b.name || ''); 
            default:
                return 0;
        }
    });

    return filtered;
}