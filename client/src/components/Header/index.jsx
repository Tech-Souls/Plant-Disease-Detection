import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext';
import { FiLogIn } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { RiMenu3Line } from "react-icons/ri";
import { FaX } from "react-icons/fa6";

export default function Header() {
    const { isAuthenticated } = useAuthContext()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

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
                        !isAuthenticated ?
                            <button className='flex items-center gap-2 bg-[var(--secondary)] text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75' onClick={() => navigate("/auth/login")}>Login <FiLogIn /></button>
                            :
                            <button className='flex items-center gap-2 bg-[var(--secondary)] text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75' onClick={() => navigate("/admin/dashboard")}><MdOutlineAdminPanelSettings /> Admin</button>
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
                    !isAuthenticated ?
                        <button className='flex justify-center items-center gap-2 bg-[var(--secondary)] text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75' onClick={() => navigate("/auth/login")}>Login <FiLogIn /></button>
                        :
                        <button className='flex justify-center items-center gap-2 bg-[var(--secondary)] text-white px-4 py-1.5 rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75' onClick={() => navigate("/admin/dashboard")}><MdOutlineAdminPanelSettings /> Admin</button>
                }
            </div>
        </>
    )
}