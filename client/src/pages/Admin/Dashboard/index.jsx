import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GrAnalytics } from 'react-icons/gr'
import { FaUsers } from 'react-icons/fa'
import { BsChatLeftDotsFill } from "react-icons/bs";
import { TbDeviceMobileMessage } from "react-icons/tb";

export default function Dashboard() {
    const navigate = useNavigate()
x
    return (
        <div className='main-container py-10'>
            <h4 className='flex items-center gap-2 text-[var(--primary)]'><GrAnalytics /> Dashboard</h4>
            <p className='text-[14px] bg-[var(--light)] text-[var(--dark)] w-fit px-2 py-1 rounded-[6px] mt-2 mb-6'>See your web performance analytics here</p>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6'>
                <div className='flex flex-col items-center gap-2 p-8 bg-white cursor-pointer rounded-[12px] shad' onClick={() => navigate("/admin/users")}>
                    <FaUsers className='text-[28px] text-[var(--dark)]' />
                    <p className='text-sm text-[var(--dark)] font-bold'>Total Users</p>
                    <p className='text-[24px] text-[var(--dark)] font-bold'>10</p>
                </div>
                <div className='flex flex-col items-center gap-2 p-8 bg-white cursor-pointer rounded-[12px] shad' onClick={() => navigate("/admin/chat-history")}>
                    <BsChatLeftDotsFill className='text-[24px] text-[var(--dark)]' />
                    <p className='text-sm text-[var(--dark)] font-bold'>Total Chats</p>
                    <p className='text-[24px] text-[var(--dark)] font-bold'>120</p>
                </div>
                <div className='flex flex-col items-center gap-2 p-8 bg-white cursor-pointer rounded-[12px] shad' onClick={() => navigate("/admin/messages")}>
                    <TbDeviceMobileMessage className='text-[28px] text-[var(--dark)]' />
                    <p className='text-sm text-[var(--dark)] font-bold'>Messages Received</p>
                    <p className='text-[24px] text-[var(--dark)] font-bold'>20</p>
                </div>
            </div>
        </div>
    )
}