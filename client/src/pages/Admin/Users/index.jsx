import React, { useEffect, useState } from 'react'
import CreateUserSection from '../../../components/CreateUserSection'
import { FaUsers } from 'react-icons/fa'
import { MdModeEdit } from "react-icons/md";
import { IoTrash } from "react-icons/io5";
import Loader from '../../../components/Loader'
import axios from 'axios'

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [editingUser, setEditingUser] = useState(null)
    const [editData, setEditData] = useState({ username: "", email: "", role: "user" })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_HOST}/users/all`)
            setUsers(res.data.allUsers)
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return

        try {
            await axios.delete(`${import.meta.env.VITE_HOST}/users/delete/${id}`)
            setUsers(prev => prev.filter(user => user._id !== id))
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong")
        }
    }

    const handleEditClick = (user) => {
        setEditingUser(user._id)
        setEditData({ username: user.username, email: user.email, role: user.role })
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.put(`${import.meta.env.VITE_HOST}/users/update/${editingUser}`, editData)
            setUsers(prev =>
                prev.map(user => user._id === editingUser ? res.data.user : user)
            )
            setEditingUser(null)
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong")
        }
    }

    if (loading) return <Loader />

    return (
        <div className='main-container pt-10 pb-16'>
            <h4 className='flex items-center gap-2 text-[var(--primary)]'>
                <FaUsers /> Users Management
            </h4>
            <p className='text-[14px] bg-[var(--light)] text-[var(--dark)] w-fit px-2 py-1 rounded-[6px] mt-2 mb-6'>
                Manage users and their roles here
            </p>

            <CreateUserSection setUsers={setUsers} />

            {message && <p className='text-red-500 mt-2'>{message}</p>}

            <div className="overflow-x-auto mt-8 shad">
                <table className="min-w-full bg-white rounded-[12px] overflow-hidden shadow">
                    <thead className="text-[var(--primary)] bg-[var(--light)]">
                        <tr className='text-sm'>
                            <th className="px-4 text-left">User ID</th>
                            <th className="px-4 py-3 text-left">Username</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map((user, i) => (
                            <tr key={user._id} className={`${i % 2 == 0 ? '' : 'bg-gray-100'} text-sm hover:bg-gray-100`}>
                                <td className="px-4 py-3">{user.userID}</td>
                                <td className="px-4 py-3">{user.username}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-2 rounded-full ${user.role === 'admin' && 'text-[12px] bg-[var(--secondary)] text-white'}`}>{user.role}</span>
                                </td>
                                <td className='px-4 py-3 flex justify-center items-center gap-2 text-md'>
                                    <MdModeEdit
                                        className='text-blue-500 cursor-pointer hover:text-blue-300'
                                        onClick={() => handleEditClick(user)}
                                    />
                                    <IoTrash
                                        className='text-red-500 cursor-pointer hover:text-red-300'
                                        onClick={() => handleDeleteUser(user._id)}
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td className="px-4 py-2 text-red-500 text-center" colSpan={5}>
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <div className={`fixed inset-0 flex items-center justify-center bg-black/40 p-2 z-50 transition-all duration-200 ease-linear ${editingUser ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className={`bg-white p-3 sm:p-6 rounded-xl w-[450px] transition-all duration-200 ease-linear ${editingUser ? 'translate-y-3' : 'translate-y-0'}`}>
                    <h4 className="text-lg font-semibold mb-4 text-[var(--primary)]">Edit User</h4>
                    <form onSubmit={handleUpdateUser} className="flex flex-col gap-3">
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm text-gray-800 font-semibold'>Username</label>
                            <input
                                type="text"
                                value={editData.username}
                                onChange={e => setEditData({ ...editData, username: e.target.value })}
                                placeholder="Username"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm text-gray-800 font-semibold'>Email</label>
                            <input
                                type="email"
                                value={editData.email}
                                onChange={e => setEditData({ ...editData, email: e.target.value })}
                                placeholder="Email"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm text-gray-800 font-semibold'>Role</label>
                            <select
                                value={editData.role}
                                onChange={e => setEditData({ ...editData, role: e.target.value })}
                                className="border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm rounded-md bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/80"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}