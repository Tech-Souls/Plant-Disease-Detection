import React, { useState } from 'react'
import contactImg from '../../../assets/images/contact.svg'
import axios from 'axios'

const initialState = { username: "", email: "", subject: "", message: "" }

export default function Contact() {

    const [state, setState] = useState(initialState)
    const [loading, setLoading] = useState(false)

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handleSendMessage = () => {
        setLoading(true)
        axios.post(`${import.meta.env.VITE_HOST}/contact/message/send`, state)
            .then(res => {
                if (res.status === 201) {
                    alert(res.data.message)
                    setState(initialState)
                }
            })
            .catch(err => {
                console.error("Frontend POST error: ", err);
                alert(err.response.data.message || "Something went wrong. Please try again!")
            })
            .finally(() => setLoading(false))
    }

    return (
        <div className='main-container min-h-screen py-20'>
            <div className='flex flex-col md:flex-row sm:justify-between gap-20'>
                <div className='w-full max-w-[520px]'>
                    <h2 className='text-[var(--primary)]'>Get in Touch</h2>
                    <p>Have a question or feedback? Fill out the form below to contact our team.</p>
                    <div className='bg-[var(--light)] w-fit p-8 mt-8 sm:mt-12 rounded-full'>
                        <img src={contactImg} alt="contact-img" className='w-32' />
                    </div>
                </div>
                <div className='flex w-full max-w-xl flex-col gap-5'>
                    <div className='w-full'>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Username</label>
                        <input type="text" name="username" id="username" value={state.username} placeholder='Enter username' className='w-full border border-gray-200' onChange={handleChange} />
                    </div>
                    <div className='w-full'>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Email</label>
                        <input type="text" name="email" id="email" value={state.email} placeholder='Enter email' className='w-full border border-gray-200' onChange={handleChange} />
                    </div>
                    <div className='w-full'>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Subject</label>
                        <input type="text" name="subject" id="subject" value={state.subject} placeholder='Enter subject' className='w-full border border-gray-200' onChange={handleChange} />
                    </div>
                    <div className='w-full'>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Message</label>
                        <textarea name="message" id="message" rows={6} value={state.message} placeholder='Type your message...' className='w-full p-3 border border-gray-200 rounded-[8px] resize-none' onChange={handleChange}></textarea>
                    </div>
                    <button className='bg-[var(--secondary)] text-white p-3 rounded-[12px] transition-all duration-200 ease-linear hover:opacity-80'
                        disabled={loading}
                        onClick={handleSendMessage}
                    >
                        {!loading ? 'Send Message' : 'Sending...'}
                    </button>
                </div>
            </div>
        </div>
    )
}