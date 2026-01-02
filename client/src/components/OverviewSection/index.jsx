import React from 'react'
import overview1 from '../../assets/images/overview1.jpg'
import overview2 from '../../assets/images/overview2.jpg'
import overview3 from '../../assets/images/overview3.jpg'
import leafSharp from '../../assets/images/leaf-sharp.svg'
import { MdOutlineSavedSearch } from "react-icons/md";
import { CgArrowRight } from 'react-icons/cg'
import { useNavigate } from 'react-router-dom'

export default function OverviewSection() {
    const navigate = useNavigate();
    const handleClick = ()=>{
        return navigate('/ChatBot')
    };
    return (
        <div className='main-container py-20'>
            <div>
                <h1 className='text-center'>Personal <span className='text-[var(--primary)]'>plant doctor</span> in your pocket</h1>
                <p className='w-full max-w-[880px] mx-auto text-center text-[20px] pt-4'>Have you ever searched ‘what’s wrong with my plant’? The results may have been disappointing… No more with our tool! Simply snap a photo of the issue to get a diagnosis. We will give you detailed info on the disease, what caused it, how to treat it, and how to prevent it.</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-20'>
                    <div className='group flex flex-col justify-center items-center gap-4 h-[35vh] sm:h-[400px] border-2 border-gray-400 border-dashed cursor-pointer rounded-[24px] hover:border-[var(--secondary)]'>
                        <MdOutlineSavedSearch className='text-[50px] text-gray-500 group-hover:text-[var(--secondary)]' />
                        <button 
                        onClick={handleClick}
                        className='text-[18px] text-gray-700 group-hover:text-[var(--secondary)]'>Start diagnosing</button>
                    </div>
                    <div className='h-[35vh] sm:h-[400px] rounded-[24px]'>
                        <img src={overview1} alt="overview1" className='w-full h-full rounded-[24px]' />
                    </div>
                    <div className='h-[35vh] sm:h-[400px] rounded-[24px]'>
                        <img src={overview2} alt="overview2" className='w-full h-full rounded-[24px]' />
                    </div>
                    <div className='h-[35vh] sm:h-[400px] rounded-[24px]'>
                        <img src={overview3} alt="overview3" className='w-full h-full rounded-[24px]' />
                    </div>
                </div>
            </div>

            <div className='relative flex flex-col items-center gap-8 bg-[var(--light)] mt-20 sm:mt-30 p-10 md:p-20 rounded-[24px]'>
                <h1><span className='text-[var(--primary)]'>Stop killing</span> – start treating your plants!</h1>
                <button 
                onClick={handleClick}
                className='flex justify-center items-center gap-2 w-full sm:w-fit bg-[var(--secondary)] text-white px-12 py-4 rounded-[12px] transition-all duration-200 ease-linear hover:bg-[var(--secondary)]/80 hover:gap-4'>Diagnose Now <CgArrowRight /></button>

                <div className="absolute top-0 right-0 rotate-240 opacity-50">
                    <img src={leafSharp} alt="leaf-sharp" className='w-34' />
                </div>
            </div>
        </div>
    )
}