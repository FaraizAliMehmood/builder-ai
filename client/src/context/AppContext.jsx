import { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const AppContext = createContext(undefined);
export function AppContextProvider({children}) {


    const navigate = useNavigate();

 
// Auth States
const [user, setUser] = useState(null);
const [loadingUser, setLoadingUser] = useState(true);

 // Auth Actions
 const checkSession = useCallback(async () => {
    try {
        setLoadingUser(true);
        const {data} = await api.get("/api/auth/me");
        setUser(data.user);
    } catch (error) {
        setUser(null);
    } finally {
        setLoadingUser(false);
    }
 }, []);





  const login = async (email,password) => {
    try {
        const {data} = await api.post("/api/auth/login", {email,password});
        setUser(data.user);
        toast.success("Logged in successfully");
        navigate("/");
    } catch (err) {
        console.error("Login failed:", err);
        const errorMsg = err?.response?.data?.error || "Invalid email and password";
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
  }

   const register = async (name,email,password) => {
    try {
        const {data} = await api.post("/api/auth/register", {name,email,password});
        setUser(data.user);
        toast.success("Registered successfully");
        navigate("/");
    } catch (err) {
        console.error("Registration failed:", err);
        const errorMsg = err?.response?.data?.error || "Registration failed";
        toast.error(errorMsg);
        throw new Error(errorMsg);
    }
  }
  

 useEffect(() => {
   checkSession();
 }, [checkSession]);
 

    return(
        <AppContext.Provider value={{user,loadingUser,login,register}}>
        {children}
        </AppContext.Provider>
    )
    
}

export function  useAppContext() {
   const context = useContext(AppContext);
   if (context === undefined) {
      throw new Error("useAppContext must be used within an AppContextProvider");
   }    
   return context;
}