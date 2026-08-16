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

// States
 const [projects, setProjects] = useState([])
 const [loadingProjects, setLoadingProjects] = useState(true)
 const [activeProject, setActiveProject] = useState(null)
 const [loadingActiveProjects, setLoadingActiveProjects] = useState(true)
 const [chatLoading, setChatLoading] = useState(false)
 const [generatingProject, setGeneratingProject] = useState(false)
 const [activeFile, setActiveFile] = useState("/App.js")
 const [showCode, setShowCode] = useState(false)
 
 
 
 
 
 


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


const logout = async () => {
    try {
        await api.post("/api/auth/logout")
        setUser(null)
        setProjects([])
        setActiveProject(null)
        toast.success("Logged out successfully")
        navigate("/")
    } catch (err) {
        console.error("Logout failed:",err);
        toast.error("Logout failed")
    }
}

//Projects Actions
const loadProjects = useCallback(async () => {
    if(!user) return;
    try {

        const {data} = await api.get("/api/projects")
        setProjects(data)

    } catch (err) {
        console.error("Failed to list projects:",err);
        toast.error("Failed to load projects list")
    }finally{
        setLoadingProjects(false);
    }
}, [user])

const loadProject = async (id, silent = false) => {
     if(!user) return;
        if(!silent) setLoadingActiveProjects(true)
    try {
       const {data} = await api.get(`/api/projects/${id}`)
       setActiveProject(data)
       //Default File Selection
       const files = Object.keys(data.files)
       if(files.length > 0){
        setActiveFile((prev)=>{
          if(files.includes(prev)) return prev;
          if(files.includes("/App.js")) return "/App.js";
          return files[0];
        })
       }
    } catch (err) {
        console.error("Failed to load projects:",err);
        if(!silent){
            toast.error("Failed to load project details")
            navigate("/");
        }
    }finally{
        if(!silent) setLoadingActiveProjects(false)
    }
}

//Automatically poll active project status if generating or pending
useEffect(() => {
if(!activeProject?._id || !user) {
    setChatLoading(false);
    return;
}
const isOnging = activeProject.status === "generating" || activeProject.status === "pending" || activeProject.status === "revising";
setChatLoading(isOnging);
if(isOnging){
    const interval = setInterval(() => {
        loadProject(activeProject._id, true)
    }, 2000);
    return ()=> clearInterval(interval);
}

}, [activeProject?._id,activeProject?.status,loadProject,user])

const handleGenerate = useCallback(async (prompt)=>{
    if(!user) return;
    setGeneratingProject(true);
    try {
        const {data} = await api.post("/api/projects", {prompt});
        toast.success("AI agent planning the structure ...");
        navigate(`/builder/${data._id}`);
    } catch (err) {
        console.error("Failed to generate projects:",err);
        toast.error(err?.response?.data?.error || "Failed to generate project");
    }finally{
        setGeneratingProject(false)
    }
},[navigate,user])

const handleDelete = useCallback(async (id)=>{
    if(!user) return;
    try {
        const {data} = await api.delete(`/api/projects/${id}`);
        setProjects((prev)=> prev.filter((p)=> p._id !== id));
        toast.success("Project deleted successfully");
    } catch (err) {
        console.error("Failed to delete project:",err);
        toast.error("Failed to delete project");
    }
},[user])

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
        <AppContext.Provider value={{
            user,
            loadingUser,
            login,
            register,
            projects,
            loadingProjects,
            activeProject,
            loadingActiveProjects,
            chatLoading,
            generatingProject,
            activeFile,
            showCode,
            setActiveFile,
            setShowCode,
            loadProjects,
            loadProject,
            handleGenerate,
            handleDelete}}>
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