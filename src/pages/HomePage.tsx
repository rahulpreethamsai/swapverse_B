import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import API from "../services/api";
import FilterLogic from "../components/common/filterLogic";
import { Link } from "react-router-dom";

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

const AVAILABLE_CATEGORIES = ['Electronics', 'Gadgets', 'Home', 'Apparel', 'Books', 'Other'];

function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('available'); 
  const [sortType, setSortType] = useState<string>('newest');

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data } = await API.get("/items");
        const processedItems = data.items.map((item: Item) => ({
          ...item,
          category: item.category || 'Other'
        }))
        setItems(processedItems || []);
      } catch (err: any) {
        console.error("Error In Fetching", err);
        setError(err.message || "Failed to fetch items");
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
              <p className="text-red-600 text-center w-full">{error}</p>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="relative group shadow-2xl hover:scale-105 hover:shadow-white/50 rounded-xl transition-transform duration-300 cursor-pointer overflow-hidden h-full"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-full h-55 rounded-lg object-center transition-transform duration-500 group-hover:blur-sm ease-in-out group-hover:scale-105"
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
              
              <p className="text-white text-center w-full col-span-full">No items available or found with the current filter and sort settings.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;