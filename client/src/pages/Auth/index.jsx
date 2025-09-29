import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'

export default function Auth() {
    return (
        <Routes>
            <Route index element={<Login />} />
            <Route path='login' element={<Login />} />
            <Route path='*' element={<Login />} />
        </Routes>
    )
}