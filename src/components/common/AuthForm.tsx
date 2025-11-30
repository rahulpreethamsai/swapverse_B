import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  location: string;
}

interface LoginData {
  email: string;
  passwordHash: string;
}

function AuthForm() {
  const [isUser, setIsUser] = useState(false);
  

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '', email: '', phone: '', passwordHash: '', location: ''
  });

  const [loginData, setLoginData] = useState<LoginData>({
    email: '', passwordHash: ''
  });
  
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegisterInput = (e: ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginInput = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/auth/register', registerData);
      alert('Success! Please log in.');
      setIsUser(false);
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(message);
      }
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await API.post('/auth/login', loginData);
      
      localStorage.setItem('token', data.token);
      API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      const { data: meData } = await API.get('/auth/me');
      

      login(meData.user);
      navigate('/');

    } catch (err: any) {

      const message = err.response?.data?.message;
      setError(message);
    }
  };

  const handleSubmit = isUser ? handleRegisterSubmit : handleLoginSubmit;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#2a2a2a] to-[#1c1c1c] to-black">
      <form
        className="flex flex-col md:flex-row justify-center items-center gap-12 p-10"
        onSubmit={handleSubmit}
      >
        <div className="w-80 h-80 md:w-96 md:h-96 bg-[#1F1F1F] rounded-full flex flex-col justify-center items-center text-center shadow-2xl p-6 hover:scale-105 transition-all duration-300">
          <div className="flex flex-col items-center gap-4">
            <img
              src="https://www.logoground.com/uploads6/dv6y2020130322020-01-162886054Infinity-Exchange-Logo.jpg"
              alt="logo"
              className="rounded-full w-20 h-20 border-4 border-white"
            />
            <p className="font-extrabold text-white text-3xl tracking-wide">SwapVerse</p>
          </div>
          <p className="text-white text-sm mt-6 leading-relaxed font-mono">
            Swap It – Use It – Maintain It – Return It
            <br />
            <span className="font-bold text-2xl text-black">&</span>
            <br />
            Build Trust – Gain Score – Raise Dispute
          </p>
        </div>

        <div className="w-80 h-80 md:w-96 md:h-96 bg-[#1F1F1F] rounded-full flex flex-col justify-center items-center shadow-2xl p-6 hover:scale-105 transition-all duration-300">
          <p className="text-white font-bold text-lg mb-4">
            {isUser ? "SIGN UP" : "SIGN IN"}
          </p>

          {isUser ? (
            <div className="flex flex-col justify-evenly items-center w-60 gap-2">
              <input name="name" value={registerData.name} onChange={handleRegisterInput} placeholder="Name" required className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60"/>
              <input name="email" type="email" value={registerData.email} onChange={handleRegisterInput} placeholder="Email" required className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60" />
              <input name="phone" value={registerData.phone} onChange={handleRegisterInput} placeholder="Phone" className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60" />
              <input name="passwordHash" type="password" value={registerData.passwordHash} onChange={handleRegisterInput} placeholder="Password" required className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60" />
              <input name="location" value={registerData.location} onChange={handleRegisterInput} placeholder="Location" className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60" />
              <button type="submit" className="bg-black text-white font-bold px-4 py-2 rounded-md mt-2 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer">
                Register
              </button>
              <p onClick={() => setIsUser(false)} className="text-sm text-white mt-2 cursor-pointer hover:underline">
                Already have an account? Sign In
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-evenly items-center w-60 gap-2">
              <input name="email" type="email" value={loginData.email} onChange={handleLoginInput} placeholder="Email" required className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60" />
              <input name="passwordHash" type="password" value={loginData.passwordHash} onChange={handleLoginInput} placeholder="Password" required className="w-full px-3 py-1 rounded-md text-white shadow-2xl outline-none bg-black/60" />
              <button type="submit" className="bg-black text-white font-bold px-4 py-2 rounded-md mt-2 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer">
                Login
              </button>
              <p onClick={() => setIsUser(true)} className="text-sm text-white mt-2 cursor-pointer hover:underline">
                Don’t have an account? Sign Up
              </p>
            </div>
          )}
          {error && <p className="text-red-500 mt-2 text-sm max-w-xs text-center">{error}</p>}
        </div>
      </form>
    </div>
  );
}

export default AuthForm;