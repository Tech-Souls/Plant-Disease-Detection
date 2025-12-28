import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import signupImg from '../../../assets/images/login-page.webp'
import { FiUserPlus } from "react-icons/fi";
import axios from "axios";

const initialState = { username: "", email: "", password: "", confirmPassword: "" }

export default function Signup() {
    const [state, setState] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: "", type: "" })
    const navigate = useNavigate();

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const validateForm = () => {
        const { username, email, password, confirmPassword } = state;
        
        if (!username || !email || !password || !confirmPassword) {
            setMessage({ text: "Please fill in all fields!", type: "error" });
            return false;
        }

        if (username.length < 3) {
            setMessage({ text: "Username must be at least 3 characters long!", type: "error" });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({ text: "Please enter a valid email address!", type: "error" });
            return false;
        }

        if (password.length < 6) {
            setMessage({ text: "Password must be at least 6 characters long!", type: "error" });
            return false;
        }

        if (password !== confirmPassword) {
            setMessage({ text: "Passwords do not match!", type: "error" });
            return false;
        }

        return true;
    }

    const handleSignup = async e => {
        e.preventDefault()
        
        if (!validateForm()) return;

        setLoading(true)
        setMessage({ text: "", type: "" })

        try {
            const { username, email, password } = state;
            const res = await axios.post(`${import.meta.env.VITE_HOST}/auth/signup`, { 
                username, 
                email, 
                password 
            })
            
            setMessage({ text: res.data.message || "Account created successfully! Redirecting to login...", type: "success" });
            setState(initialState);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);
            
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.message || "Something went wrong. Please try again!", 
                type: "error" 
            });
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-screen flex justify-center items-center p-3 bg-[#f3f3f3]'>
            <div className='login-form flex flex-col-reverse md:flex-row justify-between items-center gap-6 sm:gap-10 w-full max-w-4xl min-h-[70vh] bg-white p-4 sm:p-8 md:p-12 rounded-xl shad'>
                <form
                    className='w-full md:max-w-[50%] flex flex-col gap-4'
                    onSubmit={handleSignup}
                >
                    <h5 className='leading-px mt-4'>Create Account</h5>
                    <p className='text-sm text-gray-700 font-bold mb-2'>Sign up to get started</p>
                    
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-semibold text-gray-700'>Username</label>
                        <input
                            type="text"
                            name='username'
                            value={state.username}
                            placeholder="Choose a username"
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
                            placeholder="Enter your email"
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
                            placeholder="Create a password"
                            className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                            onChange={handleChange}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-semibold text-gray-700'>Confirm Password</label>
                        <input
                            type="password"
                            name='confirmPassword'
                            value={state.confirmPassword}
                            placeholder="Confirm your password"
                            className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center items-center gap-2 bg-[var(--secondary)] text-white p-3 mt-3 text-sm font-semibold rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75"
                    >
                        {loading ? "Creating account..." : <>Sign Up <FiUserPlus /></>}
                    </button>

                    {message.text && (
                        <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                            {message.text}
                        </p>
                    )}

                    <div className='text-center mt-2'>
                        <p className='text-sm text-gray-600'>
                            Already have an account?{' '}
                            <Link to="/auth/login" className='text-[var(--secondary)] hover:underline font-semibold'>
                                Login here
                            </Link>
                        </p>
                    </div>
                </form>

                <div className='w-full h-[30vh] sm:h-[400px] md:h-[500px]'>
                    <img src={signupImg} alt="signup-img" className='w-full h-full rounded-2xl object-cover' />
                </div>
            </div>
        </div>
    )
}