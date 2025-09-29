import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <div className='flex flex-col md:flex-row justify-between gap-5 sm:gap-8 bg-gray-800 px-4 sm:px-10 py-3.5'>
            <p className='text-white'>Copyright &copy; 2025. All Rights Reserved.</p>
            <div className='flex flex-wrap gap-5 text-white text-center'>
                <Link to="/about" className='hover:opacity-70'>About</Link>
                <Link to="/contact" className='hover:opacity-70'>Contact</Link>
                <Link to="/privacy-policies" className='hover:opacity-70 whitespace-nowrap'>Privacy Policies</Link>
                <Link to="/terms-and-conditions" className='hover:opacity-70 whitespace-nowrap'>Terms & Conditions</Link>
            </div>
        </div>
    )
}