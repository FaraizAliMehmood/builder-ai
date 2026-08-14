import React from 'react'
import { Routes, Route } from "react-router-dom";
import AuthPage from './pages/AuthPage.jsx';
import { GuestLayout, AuthLayout } from './pages/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import BuilderPage from './pages/BuilderPage.jsx';
import PreviewPage from './pages/PreviewPage.jsx';
const App = () => {
  return (
    <Routes>
    <Route element={<GuestLayout/>}>
    <Route path='login' element={<AuthPage mode="login"/>}/>
    <Route path='register' element={<AuthPage mode="register"/>}/>
    </Route>


    <Route element={<AuthLayout/>}>
    <Route path='/' element={<HomePage/>}/>
    <Route path='/builder/:id' element={<BuilderPage/>}/>
    <Route path='/preview/:id' element={<PreviewPage/>}/>
    </Route>

    </Routes>
  )
}

export default App