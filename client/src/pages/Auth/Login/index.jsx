import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import loginImg from '../../../assets/images/login-page.webp'
import { FiLogIn } from "react-icons/fi";
import axios from "axios";

const initialState = { username: "", password: "" }

export default function Login() {

    const { dispatch } = useAuthContext();
    const [state, setState] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const navigate = useNavigate();

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handleLogin = async e => {
        e.preventDefault()
        const { username, password } = state;

        if (!username || !password) {
            return setMessage("Please fill in all fields!");
        }

        setLoading(true)
        setMessage("")
        try {
            const res = await axios.post(`${import.meta.env.VITE_HOST}/auth/login`, { username, password })
            const { token, user, message } = res.data;
            setMessage(message);
            setState(initialState);

            localStorage.setItem("pddtjwt", token);
            localStorage.setItem("userId", user.userID);

            dispatch({ type: "SET_LOGGED_IN", payload: { user } });
            navigate("/");
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-screen flex justify-center items-center p-3 bg-[#f3f3f3]'>
            <div className='login-form flex flex-col-reverse md:flex-row justify-between items-center gap-6 sm:gap-10 w-full max-w-4xl min-h-[70vh] bg-white p-4 sm:p-8 md:p-12 rounded-xl shad'>
                <form
                    className='w-full md:max-w-[50%] flex flex-col gap-4'
                    onSubmit={handleLogin}
                >
                    <h5 className='leading-px mt-4'>Welcome back!</h5>
                    <p className='text-sm text-gray-700 font-bold mb-2'>Login to continue</p>

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
                        {loading ? "Please wait..." : <>Login <FiLogIn /></>}
                    </button>

                    {message && <p className="text-sm text-red-500">{message}</p>}

                    <div className='text-center mt-2'>
                        <p className='text-sm text-gray-600'>
                            Don't have an account?{' '}
                            <Link to="/auth/signup" className='text-[var(--secondary)] hover:underline font-semibold'>
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </form>

                <div className='w-full h-[30vh] sm:h-[400px] md:h-[500px]'>
                    <img src={loginImg} alt="login-img" className='w-full h-full rounded-2xl object-cover' />
                </div>
            </div>
        </div>
    )
}