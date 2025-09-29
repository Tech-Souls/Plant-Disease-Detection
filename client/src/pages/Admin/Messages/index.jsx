import React, { useEffect, useState } from 'react'
import { TbDeviceMobileMessage } from "react-icons/tb";
import { IoTrash } from "react-icons/io5";
import { MdModeEdit } from "react-icons/md";
import Loader from '../../../components/Loader';
import dayjs from 'dayjs'
import axios from 'axios'
import { FiX } from 'react-icons/fi';

export default function Messages() {
    const [messages, setMessages] = useState([])
    const [open, setOpen] = useState(false)
    const [updatingMessage, setUpdatingMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/contact/messages/all`)
            .then(res => {
                if (res.status === 200) {
                    setMessages(res.data.messages)
                }
            })
            .catch(err => {
                console.error("Frontend error: ", err);
            })
            .finally(() => setLoading(false))
    }, [])

    const handleUpdate = (msg) => {
        setOpen(true)
        setUpdatingMessage(msg)
    }

    const handleUpdateFunc = () => {
        setLoading(true)
        axios.patch(`${import.meta.env.VITE_HOST}/contact/message/update/${updatingMessage._id}`, updatingMessage)
            .then(res => {
                if (res.status === 202) {
                    setMessages(messages.map(msg => msg._id === updatingMessage._id ? { ...msg, status: updatingMessage.status } : msg))
                }
            })
            .catch(err => {
                console.error("Frontend error: ", err);
            })
            .finally(() => {
                setOpen(false)
                setLoading(false)
            })
    }

    const handelDelete = (id) => {
        setLoading(true)
        axios.delete(`${import.meta.env.VITE_HOST}/contact/message/delete/${id}`)
            .then(res => {
                if (res.status === 203) {
                    setMessages(messages.filter(msg => msg._id !== id))
                    alert(res.data.message)
                }
            })
            .catch(err => {
                console.error("Frontend error: ", err);
                alert("Something went wrong. Please try again!")
            })
            .finally(() => setLoading(false))
    }

    if (loading) return <Loader />

    return (
        <div className='relative main-container min-h-screen pt-10 pb-16'>
            <h4 className='flex items-center gap-2 text-[var(--primary)]'>
                <TbDeviceMobileMessage /> Contact Messages
            </h4>
            <p className='text-[14px] bg-[var(--light)] text-[var(--dark)] w-fit px-2 py-1 rounded-[6px] mt-2 mb-6'>
                Manage messages received from users here
            </p>

            <div className="overflow-x-auto mt-8 shad">
                <table className="min-w-full bg-white rounded-[12px] overflow-hidden shadow">
                    <thead className="text-[var(--primary)] bg-[var(--light)]">
                        <tr className='text-sm'>
                            <th className="px-4 text-left">#</th>
                            <th className="px-4 py-3 text-left">Username</th>
                            <th className="px-4 py-3 text-left">Subject</th>
                            <th className="px-4 py-3 text-left">Message</th>
                            <th className="px-4 py-3 text-left">Received At</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length > 0 ? messages.map((message, i) => (
                            <tr key={message._id} className={`${i % 2 == 0 ? '' : 'bg-gray-100'} text-sm hover:bg-gray-100`}>
                                <td className="px-4 py-3">{i + 1}</td>
                                <td className="px-4 py-3">{message.username}</td>
                                <td className="px-4 py-3">{message.subject}</td>
                                <td className="px-4 py-3 line-clamp-2">{message.message}</td>
                                <td className="px-4 py-3">{dayjs(message.createdAt).format("DD-MM-YYYY HH:MM")}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block text-[12px] px-2 rounded-full
                                        ${message.status === 'pending' ? 'bg-[#eff625d0]' : message.status === 'completed' ? 'bg-[#5dd033] text-white' : 'bg-[#f33a3a] text-white'}`}
                                    >
                                        {message.status}
                                    </span>
                                </td>
                                <td className='flex justify-end gap-3 px-4 py-3 text-md'>
                                    <MdModeEdit className='text-blue-500 cursor-pointer hover:text-blue-300' onClick={() => handleUpdate(message)} />
                                    <IoTrash className='text-red-500 cursor-pointer hover:text-red-300' onClick={() => handelDelete(message._id)} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td className="px-4 py-2 text-red-500 text-center" colSpan={7}>
                                    No message received yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={`absolute inset-0 flex justify-center items-center bg-[#f5feffbd]  transition-all duration-200 ease-linear ${open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-5'}`}>
                <div className='w-full max-w-[400px] p-6 bg-white rounded-[24px] shad'>
                    <div className='flex justify-between items-center'>
                        <h6 className='text-[var(--primary)]'>Update Status</h6>
                        <FiX className='text-[20px] text-gray-600 cursor-pointer hover:text-gray-400' onClick={() => setOpen(false)} />
                    </div>
                    <select name="status" id="status" value={updatingMessage?.status} className='w-full border border-gray-200 p-3 mt-4 outline-none rounded-[12px]' onChange={e => setUpdatingMessage({ ...updatingMessage, status: e.target.value })} >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <div className='flex justify-end mt-6'>
                        <button className='bg-[var(--secondary)] text-white px-6 py-2 rounded-[12px] hover:bg-[var(--secondary)]/80' onClick={() => handleUpdateFunc()}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}