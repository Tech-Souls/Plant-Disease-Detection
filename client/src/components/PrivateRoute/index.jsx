import React from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext';
import { FaArrowLeftLong } from "react-icons/fa6";


export default function PrivateRoute({ Component, allowedRoles }) {

    const { user, isAuthenticated } = useAuthContext()
    const location = useLocation()

    // if (!isAuthenticated) return <Navigate to='/' state={{ from: location }} replace />

    if (allowedRoles.includes(user?.role)) return <Component />

    return (
        <div className='h-screen flex flex-col justify-center items-center gap-4'>
            <h1 className='text-center mt-5 w-[50%]'>You don't have permission to access this page.</h1>
            <div className='text-center mt-5'>
                <Link
                    to='/'
                    className='px-6 py-2.5 flex gap-3 items-center rounded-[12px] text-[#fff] bg-[var(--secondary)] decoration-0'
                >
                    <FaArrowLeftLong /> Go To Home
                </Link>
            </div>
        </div>
    )
}