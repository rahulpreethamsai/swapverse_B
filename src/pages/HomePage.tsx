import { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import API from "../services/api";
import FilterLogic from "../components/common/filterLogic";
import { Link } from "react-router-dom";
import { PageContainer } from "../contexts/Pagination";

interface Item {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  estimatedValue?: number;
  condition?: string;
  images: string[];
  owner?: string;
  status: string;
  date?: string;
}

interface PageContextType {
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
}

const AVAILABLE_CATEGORIES = ['Electronics', 'Gadgets', 'Home', 'Apparel', 'Books', 'Other'];

function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [sortType, setSortType] = useState<string>('newest');

  const pageContext = useContext(PageContainer) as PageContextType | undefined;

  if (!pageContext) {
    throw new Error('Home component must be used within a PageContainer.Provider');
  }

  const { pageNum, setPageNum, pageSize } = pageContext;
  
  useEffect(() => {
    async function fetchItems() {
      try {
        const { data } = await API.get("/items");
        const processedItems = data.items.map((item: Item) => ({
          ...item,
          category: item.category || 'Other' 
        }));
        setItems(processedItems || []);
      } catch (err: any) {
        console.error("Error In Fetching", err);
        setError(err.message || "Failed to fetch items. Please check the network connection.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return FilterLogic(items, searchQuery, categoryFilters, statusFilter, sortType);
  }, [items, searchQuery, categoryFilters, statusFilter, sortType]);

  useEffect(() => {
    if (pageNum !== 1) {
      setPageNum(1);
    }
  }, [searchQuery, categoryFilters, statusFilter, sortType]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const sidx = (pageNum - 1) * pageSize;
  const eidx = sidx + pageSize;
  
  const currentItems = filteredItems.slice(sidx, eidx);

  const handlePrevPage = () => {
    setPageNum(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPageNum(prev => Math.min(totalPages, prev + 1));
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pageNum - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen w-full bg-black p-5">
      <Navbar />

      <div className="flex flex-row p-5 gap-5">

        <Sidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilters={categoryFilters}
          setCategoryFilters={setCategoryFilters}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortType={sortType}
          setSortType={setSortType}
          availableCategories={AVAILABLE_CATEGORIES}
        />

      
        <aside className="bg-[#1F1F1F] shadow-2xl rounded-lg p-5 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {loading ? (
              <img
                src="https://media.tenor.com/UnFx-k_lSckAAAAM/amalie-steiness.gif"
                alt="Loading"
                className="mx-auto"
              />
            ) : error ? (
              <p className="text-red-600 text-center w-full col-span-full">{error}</p>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <div
                  key={item._id}
                  className="relative group shadow-2xl hover:scale-105 hover:shadow-white/50 rounded-xl transition-transform duration-300 cursor-pointer overflow-hidden h-full"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-full h-55 rounded-lg object-cover object-center transition-transform duration-500 group-hover:blur-sm ease-in-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="text-xl font-bold drop-shadow">{item.name}</h3>
                    <p className="text-sm text-gray-300 uppercase tracking-wider drop-shadow-sm">
                      ₹{item.estimatedValue || 0}
                    </p>
                  </div>

                  <Link to={`/items/${item._id}`}>
                    <div className='absolute bottom-10 right-3 bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='black'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='w-5 h-5'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5.25 5.653v12.694a.75.75 0 0 0 1.142.639l10.569-6.347a.75.75 0 0 0 0-1.278L6.392 5.014a.75.75 0 0 0-1.142.639Z'
                        />
                      </svg>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-white text-center w-full col-span-full">
                No items available or found with the current filter and sort settings.
              </p>
            )}
          </div>


          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={pageNum === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${pageNum === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                Previous
              </button>
              
              {getPageNumbers().map(page => (
                  <button
                      key={page}
                      onClick={() => setPageNum(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                  >
                      {page}
                  </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={pageNum === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${pageNum === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                Next
              </button>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}

export default Home;