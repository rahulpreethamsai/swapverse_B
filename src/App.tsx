// src/App.tsx

import { Route, Routes } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import AuthForm from "./components/common/AuthForm"
import Profile from "./pages/ProfilePage";
import Home from "./pages/HomePage";
import ItemDetails from "./pages/ItemDetailsPage";
import SwapPage from "./pages/SwapPage";
import MyItemsPage from "./pages/MyItemsPage";
import EditItemForm from "./components/items/EditItemForm";
import AddItemForm from "./components/items/AddItemForm";
import DisputePage from "./pages/DisputePage";
import Pagination from "./contexts/Pagination";

function App() {
  return (
    <Routes>
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route 
            path="/" 
            element={
                <Pagination>
                    <Home />
                </Pagination>
            } 
        />
        <Route path="/my-items" element={<MyItemsPage />} />
        <Route path="/escrow" element={<DisputePage />} />
        <Route path="/items/edit/:id" element={<EditItemForm />} />
        <Route path="/items/new" element={<AddItemForm />} />
        <Route path="/swaps" element={<SwapPage />} />
        <Route path="/items/:id" element={<ItemDetails />} />
    </Routes>
  )
};

export default App;