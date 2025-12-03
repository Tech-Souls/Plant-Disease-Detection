import React from 'react'
import hero from '../../assets/images/hero.webp'
import leafSmooth from '../../assets/images/leaf-smooth.svg'
import shapesTri from '../../assets/images/shape-traingles-two.svg'
import image from '../../assets/images/image.svg'
import result from '../../assets/images/result.svg'
import process from '../../assets/images/process.svg'
import { CgArrowRight } from 'react-icons/cg'
import { IoReturnDownBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/ChatBot')
    };

    return (
        <div className='w-full min-h-screen flex flex-col !p-3 sm:!p-10'>
            <div className='main-container relative flex flex-col md:flex-row md:gap-20 xl:gap-30 !px-0 pt-5 pb-30 !mb-20'>
                <div className='w-full mx-auto max-w-[400px] md:max-w-[480px]'>
                    <img src={hero} alt="hero" className='w-full' />
                </div>
                <div className='w-full max-w-[600px] py-10'>
                    <h1 className='w-full max-w-[600px] leading-tight'>Identify and cure <span className='text-[var(--primary)]'>plant diseases</span> with our tool</h1>
                    <div className='py-6'>
                        <p className='text-[18px] sm:text-[20px] bg-[var(--light)] px-2 mb-2 border-l-4 border-[var(--secondary)] text-[var(--dark)]'>Is your green buddy dying?</p>
                        <p className='text-[18px] sm:text-[20px]'>Try our detector app to identify the cause and get extensive disease and care info in a snap with efficient results.</p>
                    </div>
                    <ul className='text-[18px] ml-4 list-disc'>
                        <li>100% free for usage</li>
                        <li>AI-Powered identification</li>
                    </ul>
                    <button
                        onClick={handleClick}
                        className='flex items-center gap-2 bg-[var(--secondary)] text-white font-semibold px-10 py-3.5 rounded-[12px] mt-14 transition-all duration-200 ease-linear hover:bg-[var(--secondary)]/80 hover:gap-4'>Try now <CgArrowRight /></button>
                </div>

                <img src={leafSmooth} alt="leaf-smooth" className='absolute -right-20 bottom-0 sm:bottom-20 w-[200px] opacity-80 -z-1' />
                <img src={shapesTri} alt="shapes-tri" className='absolute -left-20 bottom-0 w-[250px] opacity-60 -z-1 rotate-45' />
            </div>

            <div className='flex justify-center md:justify-end bg-[var(--x-light)] p-2 rounded-[8px]'>
                <p className='w-full max-w-[470px] text-[var(--dark)] text-[16px] sm:text-[18px]'>we're developing a platform for AI powered plant — disease detection and diagnosis for moderate use</p>
            </div>

            <div className='flex justify-between items-center mt-20 md:mt-30 mb-20 sm:mb-28 md:mb-36'>
                <h1 className='w-full md:max-w-[60vw] md:!text-[5vw] leading-tight !font-medium'>The Future Of <span className='text-[var(--primary)]'>Diagnosis</span> Starts Here</h1>
                <IoReturnDownBack className='hidden sm:block text-[10vw]' />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-10'>
                <div className='flex flex-col justify-between p-6 h-[35vh] sm:h-[400px] bg-[var(--light)] rounded-[24px]'>
                    <img src={image} alt="image" className='w-10' />
                    <h2 className='w-full max-w-[300px] text-[var(--primary)] !font-normal leading-tight'>Image Identification</h2>
                </div>
                <div className='flex flex-col justify-between p-6 h-[35vh] sm:h-[400px] bg-[var(--light)] rounded-[24px]'>
                    <img src={result} alt="result" className='w-10' />
                    <h2 className='w-full max-w-[300px] text-[var(--primary)] !font-normal leading-tight'>AI - Powered Processing</h2>
                </div>
                <div className='flex flex-col justify-between p-6 h-[35vh] sm:h-[400px] bg-[var(--light)] rounded-[24px]'>
                    <img src={process} alt="process" className='w-10' />
                    <h2 className='w-full max-w-[300px] text-[var(--primary)] !font-normal leading-tight'>100% Efficient Results</h2>
                </div>
            </div>
        </div>
    )
}