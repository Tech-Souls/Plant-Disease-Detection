import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Frontend from './Frontend'
import Admin from './Admin'
import Auth from './Auth'
import { useAuthContext } from '../contexts/AuthContext'
import PrivateRoute from '../components/PrivateRoute'
import AImodel from './Frontend/ChatBot/AIModel.jsx'

export default function Index() {
    const { isAuthenticated } = useAuthContext()

    return (
        <Routes>
            <Route path='/*' element={<Frontend />} />
            <Route path='/auth/*' element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
            <Route path='/admin/*' element={<Admin/>} />
            <Route path='/ChatBot' element={<AImodel />} />
        </Routes>
    )
}