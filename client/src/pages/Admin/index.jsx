import React, { useEffect, useState } from 'react'
import './admin.css'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import Users from './Users'
import { BsArrowRight } from 'react-icons/bs'
import { GrAnalytics } from 'react-icons/gr'
import { CiUser } from 'react-icons/ci'
import { HiMiniChatBubbleLeftEllipsis } from "react-icons/hi2";
import { LuCircleUserRound } from "react-icons/lu";
import { FiLogOut } from 'react-icons/fi'
import { FaUsers } from 'react-icons/fa'
import { TbDeviceMobileMessage } from "react-icons/tb";
import { useAuthContext } from '../../contexts/AuthContext'
import ChatHistory from './ChatHistory'
import Profile from './Profile'
import Messages from './Messages'

export default function Admin() {

    const { handleLogout } = useAuthContext()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (window.innerWidth <= 991) {
            setOpen(true)
        }
    }, [])

    return (
        <div className='flex'>
            <div className={`sider shad ${open ? 'sider-open' : 'sider-closed'}`}>
                <h6 className={`border-b-2 border-gray-100 !text-[var(--primary)] px-5 py-4 cursor-pointer ${open && '!hidden'}`} onClick={() => navigate('/')}>PD Detector</h6>

                <div className={`flex flex-col flex-1 justify-between p-2 ${open && 'items-center'}`}>
                    <div className={`flex flex-col gap-2 mt-5 ${open && 'mt-15'}`}>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `sider-link hover:bg-[var(--light)] ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><GrAnalytics /> <span className={`sider-text ${open && '!hidden'}`}>Dashboard</span></NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => `sider-link hover:bg-[var(--light)] ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><FaUsers /> <span className={`sider-text ${open && '!hidden'}`}>Users</span></NavLink>
                        <NavLink to="/admin/chat-history" className={({ isActive }) => `sider-link hover:bg-[var(--light)] ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><HiMiniChatBubbleLeftEllipsis /> <span className={`sider-text ${open && '!hidden'}`}>Chat History</span></NavLink>
                        <NavLink to="/admin/messages" className={({ isActive }) => `sider-link hover:bg-[var(--light)] ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><TbDeviceMobileMessage /> <span className={`sider-text ${open && '!hidden'}`}>Messages</span></NavLink>
                        <NavLink to="/admin/profile" className={({ isActive }) => `sider-link hover:bg-[var(--light)] ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><LuCircleUserRound /> <span className={`sider-text ${open && '!hidden'}`}>Profile</span></NavLink>
                    </div>

                    <div className='border-t-2 border-gray-100 pt-5'>
                        <div className='flex gap-2 items-center p-2'>
                            <CiUser className='bg-[#e8e8e8] p-2 w-8 h-8 rounded-full' />
                            <div className={`${open && '!hidden'}`}>
                                <div>Admin</div>
                                <div className='text-[#666] text-[12px]'>admin@gmail.com</div>
                            </div>
                        </div>

                        <div className='flex justify-center py-5'>
                            <button className='text-sm flex gap-2 items-center !text-red-500 hover:!text-red-400' onClick={() => handleLogout()}><FiLogOut /> <span className={`sider-text ${open && '!hidden'}`}>Logout</span></button>
                        </div>
                    </div>
                </div>

                <div className={`sider-arrow bg-[var(--x-light)] !text-[var(--dark)] cursor-pointer p-3 rounded-full transition-all duration-200 ease-out ${open ? 'rotate-0' : 'rotate-180'}`} onClick={() => setOpen(prev => !prev)}>
                    <BsArrowRight />
                </div>
            </div>

            <div className={`content overflow-x-hidden ${open ? '!ml-[50px] md:!ml-[65px]' : '!ml-[220px]'}`}>
                <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/users' element={<Users />} />
                    <Route path='/chat-history' element={<ChatHistory />} />
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/messages' element={<Messages />} />
                </Routes>
            </div>
        </div>
    )
}