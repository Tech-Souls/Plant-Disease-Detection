import React, { useEffect, useRef, useState } from 'react'
import { HiMiniChatBubbleLeftEllipsis } from "react-icons/hi2";
import { IoTrash } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import Loader from '../../../components/Loader';

export default function ChatHistory() {
    const chat = {
        conversation: [
            { role: "user", message: "Hello, AI!" },
            { role: "ai", message: "Hello! How can I help you today?" },
            { role: "user", message: "Can you tell me a joke?" },
            { role: "ai", message: "Sure! Why did the computer go to the doctor? Because it caught a virus! 😆" },
            { role: "user", message: "Hello, AI!" },
            { role: "ai", message: "Hello! How can I help you today?" },
            { role: "user", message: "Can you tell me a joke?" },
            { role: "ai", message: "Sure! Why did the computer go to the doctor? Because it caught a virus! 😆" },
            { role: "user", message: "Hello, AI!" },
            { role: "ai", message: "Hello! How can I help you today?" },
            { role: "user", message: "Can you tell me a joke?" },
            { role: "ai", message: "Sure! Why did the computer go to the doctor? Because it caught a virus! 😆" },
        ]
    };

    const [chats, setChats] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (openModal) {
            messagesEndRef.current?.scrollIntoView();
        }
    }, [chat.conversation, openModal])

    if (loading) return <Loader />

    return (
        <div className='relative main-container min-h-screen py-10'>
            <h4 className='flex items-center gap-2 text-[var(--primary)]'><HiMiniChatBubbleLeftEllipsis /> Chat History</h4>
            <p className='text-[14px] bg-[var(--light)] text-[var(--dark)] w-fit px-2 py-1 rounded-[6px] mt-2 mb-6'>See the users chat history and manage them</p>
            <button onClick={() => setOpenModal(true)}>Open Modal</button>

            <div className="overflow-x-auto mt-8 shad">
                <table className="min-w-full bg-white rounded-[12px] overflow-hidden shadow">
                    <thead className="text-[var(--primary)] bg-[var(--light)]">
                        <tr className='text-sm'>
                            <th className="px-4 text-left">#</th>
                            <th className="px-4 py-3 text-left">Username</th>
                            <th className="px-4 py-3 text-left">Chat Title</th>
                            <th className="px-4 py-3 text-left">Created At</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chats.length > 0 ? chats.map((chat, i) => (
                            <tr key={chat._id} className={`${i % 2 == 0 ? '' : 'bg-gray-100'} text-sm hover:bg-gray-100`}>
                                <td className="px-4 py-3">{i + 1}</td>
                                <td className="px-4 py-3">{chat.username}</td>
                                <td className="px-4 py-3">{chat.chatTitle}</td>
                                <td className="px-4 py-3">{chat.createdAt}</td>
                                <td className='px-4 py-3 text-md'>
                                    <IoTrash
                                        className='text-red-500 cursor-pointer hover:text-red-300'
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td className="px-4 py-2 text-red-500 text-center" colSpan={5}>
                                    No chat found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Chat Modal */}
            <div className={`flex justify-center items-center p-2.5 sm:p-5 !pb-12 absolute inset-0 bg-[#f5feffbd] transition-all duration-300 ease-linear ${openModal ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className={`flex flex-col justify-between p-6 w-full max-w-[950px] h-[100%] sm:h-[80vh] bg-white rounded-3xl shad transition-all duration-300 ease-linear ${openModal ? 'translate-y-5' : 'translate-y-0'}`}>
                    <div className='flex justify-end'>
                        <FiX className='text-[20px] text-gray-600 cursor-pointer hover:text-gray-400' onClick={() => setOpenModal(false)} />
                    </div>
                    <div className='flex flex-col gap-4 mt-4 px-3 py-6 overflow-auto'>
                        {
                            chat.conversation.map((c, i) => (
                                <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <p className={`text-[14px] p-2 max-w-[450px] rounded-[12px] ${c.role === 'user' ? 'bg-[var(--secondary)] text-white' : 'bg-gray-100'}`}>{c.message}</p>
                                </div>
                            ))
                        }
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
        </div>
    )
}