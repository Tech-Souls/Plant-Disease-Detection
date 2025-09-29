import React, { useState } from 'react'
import userLaptop from '../../assets/images/user-laptop.svg'
import { FiPlusCircle } from "react-icons/fi";
import axios from "axios";

const initialState = { username: "", email: "", password: "", role: "" }

export default function CreateUserSection({ setUsers }) {

    const [state, setState] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handleCreateUser = async e => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const res = await axios.post(`${import.meta.env.VITE_HOST}/auth/create-user`, state)
            setUsers(users => [res.data.user, ...users])
            setMessage(res.data.message)
            setState(initialState)
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex justify-between items-center gap-10'>
            <form
                className='w-full max-w-[500px] bg-white flex flex-col gap-4 p-6 rounded-xl shad'
                onSubmit={handleCreateUser}
            >
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Username</label>
                    <input
                        type="text"
                        name='username'
                        value={state.username}
                        placeholder="Enter username"
                        className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                        onChange={handleChange}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Email</label>
                    <input
                        type="email"
                        name='email'
                        value={state.email}
                        placeholder="Enter email"
                        className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                        onChange={handleChange}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Password</label>
                    <input
                        type="password"
                        name='password'
                        value={state.password}
                        placeholder="Enter password"
                        className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center gap-2 bg-[var(--secondary)] text-white p-3 mt-3 text-sm font-semibold rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75"
                >
                    {loading ? "Creating..." : "Create User"} <FiPlusCircle />
                </button>

                {message && <p className="text-sm">{message}</p>}
            </form>

            <div className='hidden md:block'>
                <img src={userLaptop} alt="user-laptop" className='h-[280px]' />
            </div>
        </div>
    )
}