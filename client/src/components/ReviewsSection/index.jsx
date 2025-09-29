import React from 'react'
import { BiUser } from 'react-icons/bi';
import { IoIosStar } from "react-icons/io";

export default function ReviewsSection() {
    return (
        <div className='main-container pt-4 sm:pt-8 md:pt-10'>
            <h2 className='text-center'>What our users <span className='text-[var(--primary)]'>say?</span></h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-12'>
                <div className='flex flex-col justify-center items-center gap-5 p-6 bg-gray-100 rounded-[24px] shad'>
                    <div className='flex items-center gap-3'>
                        <BiUser />
                        <p>rrackle</p>
                    </div>
                    <div className='flex gap-2'>
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                    </div>
                    <p className='text-center text-gray-700'>This plant app is by far my favorite. It’s plant diagnostics are great and almost always spot on. I love the care routines and the interesting articles</p>
                </div>
                <div className='flex flex-col justify-center items-center gap-5 p-6 bg-gray-100 rounded-[24px] shad'>
                    <div className='flex items-center gap-3'>
                        <BiUser />
                        <p>JessWP10</p>
                    </div>
                    <div className='flex gap-2'>
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                    </div>
                    <p className='text-center text-gray-700'>I used to struggle with watering too much or not enough. My poor plant babies suffered so much. Thanks to this app they suffer no more and are healthy and thriving!</p>
                </div>
                <div className='flex flex-col justify-center items-center gap-5 p-6 bg-gray-100 rounded-[24px] shad'>
                    <div className='flex items-center gap-3'>
                        <BiUser />
                        <p>ellie</p>
                    </div>
                    <div className='flex gap-2'>
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                        <IoIosStar className='text-[20px] text-[#fdde77]' />
                    </div>
                    <p className='text-center text-gray-700'>My husband won’t be able to make fun of me for killing every plant I get! Now I have all the information to provide the right care!</p>
                </div>
            </div>
        </div>
    )
}