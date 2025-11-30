import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";


function Navbar() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="bg-[#1F1F1F] text-white rounded-full shadow-2xl sticky z-50 flex justify-around items-center m-auto p-3 w-[99%]">
      <Link to="/" className="flex items-center gap-2">
        <img
          src="https://www.shutterstock.com/shutterstock/videos/1078496810/thumb/1.jpg?ip=x480"
          className="w-12 h-12 rounded-full border-2 border-black"
          alt="Logo"
        />
        <h1 className="font-extrabold text-2xl tracking-wide">SWAPVERSE</h1>
      </Link>
      <Link to='/my-items' className="font-semibold hover:text-white hover:scale-105 hover:underline">ADD ITEMS</Link>
      <Link to='/swaps' className="font-semibold hover:text-white hover:scale-105 hover:underline">SWAPS</Link>
      <Link to='/escrow' className="font-semibold hover:text-white hover:scale-105 hover:underline">DISPUTES</Link>
      {isLoggedIn ? <Link to='/profile' className="hover:scale-110">
        <img src="https://cdn-icons-gif.flaticon.com/8121/8121295.gif" alt="profile-gif" className="w-12 h-12 rounded-full" />
      </Link> : <Link to="/auth">
        <p>SIGN IN</p>
      </Link>}
    </div>
  )
};

export default Navbar;