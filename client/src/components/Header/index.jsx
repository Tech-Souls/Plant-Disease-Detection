import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext';
import { FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import { FiUserPlus } from "react-icons/fi";
import { RiMenu3Line } from "react-icons/ri";
import { FaX, FaChevronDown } from "react-icons/fa6";

export default function Header() {
    const { isAuthenticated, user, handleLogout } = useAuthContext()
    const [open, setOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const navigate = useNavigate()
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            <header className='w-full flex justify-between items-center px-4 sm:px-10 py-4 sm:py-5'>
                <div>
                    <h5 className='text-[var(--primary)] cursor-pointer' onClick={() => navigate("/")}>PD Detector</h5>
                </div>
                <div className='hidden md:flex items-center gap-3'>
                    <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/privacy-policies")}>Privacy Policies</button>
                    <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/about")}>About</button>
                    <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/contact")}>Contact</button>
                    {
                        !isAuthenticated ? (
                            <>
                                <button className='flex items-center gap-2 bg-white text-[var(--secondary)] border-2 border-[var(--secondary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)] hover:text-white' onClick={() => navigate("/auth/login")}>
                                    Login <FiLogIn />
                                </button>
                                <button className='flex items-center gap-2 bg-[var(--secondary)] text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75' onClick={() => navigate("/auth/signup")}>
                                    Sign Up <FiUserPlus />
                                </button>
                            </>
                        ) : (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    className='flex items-center gap-2 bg-[var(--secondary)] text-white px-4 py-2 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75'
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <FiUser />
                                    <span>{user?.username || 'Account'}</span>
                                    <FaChevronDown className={`text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        {user?.role === 'admin' && (
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => {
                                                    navigate("/admin/dashboard")
                                                    setDropdownOpen(false)
                                                }}
                                            >
                                                <FiUser />
                                                Admin Panel
                                            </button>
                                        )}
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            onClick={() => {
                                                handleLogout()
                                                setDropdownOpen(false)
                                            }}
                                        >
                                            <FiLogOut />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
                <div className='block md:hidden'>
                    {
                        !open ?
                            <RiMenu3Line className='text-[var(--primary)] text-[20px] md:text-[24px]' onClick={() => setOpen(true)} />
                            :
                            <FaX className='text-[var(--primary)] text-[14px] md:text-[20px]' onClick={() => setOpen(false)} />
                    }
                </div>
            </header >

            <div className={`flex md:hidden flex-col bg-[var(--x-light)] px-4 transition-all duration-300 ease-linear ${open ? 'visible h-[100%] py-8 opacity-100 gap-2' : 'invisible h-0 py-0 opacity-0 gap-0'}`}>
                <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/about")}>About</button>
                <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/contact")}>Contact</button>
                <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/terms-and-conditions")}>Terms & Condition</button>
                <button className='text-[var(--primary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:text-[var(--primary)]/50' onClick={() => navigate("/privacy-policies")}>Privacy Policies</button>
                {
                    !isAuthenticated ? (
                        <>
                            <button className='flex justify-center items-center gap-2 bg-white text-[var(--secondary)] border-2 border-[var(--secondary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)] hover:text-white' onClick={() => navigate("/auth/login")}>
                                Login <FiLogIn />
                            </button>
                            <button className='flex justify-center items-center gap-2 bg-[var(--secondary)] text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75' onClick={() => navigate("/auth/signup")}>
                                Sign Up <FiUserPlus />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className='px-4 py-2 bg-white rounded-[8px] border-2 border-gray-200'>
                                <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            {user?.role === 'admin' && (
                                <button 
                                    className='flex justify-center items-center gap-2 bg-white text-[var(--secondary)] border-2 border-[var(--secondary)] px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)] hover:text-white' 
                                    onClick={() => navigate("/admin/dashboard")}
                                >
                                    <FiUser /> Admin Panel
                                </button>
                            )}
                            <button 
                                className='flex justify-center items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-red-600' 
                                onClick={() => handleLogout()}
                            >
                                <FiLogOut /> Logout
                            </button>
                        </>
                    )
                }
            </div>
        </>
    )
}