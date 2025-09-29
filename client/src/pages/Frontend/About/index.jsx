import React from 'react';
import FaqsSection from '../../../components/FaqsSection';

const UploadCloud = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-[var(--secondary)] mb-4">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
    </svg>
);

const Microscope = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-[var(--secondary)] mb-4">
        <path d="M6 18h8" /><path d="M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2" /><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" /><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
);

const Stethoscope = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-[var(--secondary)] mb-4">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" />
    </svg>
);


export default function About() {
    return (
        <div className='bg-[var(--x-light)] min-h-screen font-sans text-gray-800'>
            <div className='main-container py-10 sm:py-20'>
                {/* Hero Section */}
                <div className='text-center bg-white p-8 sm:p-12 rounded-[24px]'>
                    <div className="max-w-4xl mx-auto">
                        <h2 className='text-[var(--primary)]'>About PlantGuard</h2>
                        <p className='text-md md:text-xl text-gray-600 mt-3 sm:mt-6 max-w-2xl mx-auto'>
                            Empowering gardeners and farmers with technology to cultivate healthier plants and ensure a bountiful harvest.
                        </p>
                    </div>
                </div>

                {/* Our Mission Section */}
                <div className="pt-10 sm:pt-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--primary)] mb-4">Our Mission</h2>
                            <p className="text-gray-600 mb-4">
                                At PlantGuard, our mission is to make plant care simple and accessible for everyone. We believe that healthy plants are the cornerstone of a healthy planet. Whether you're a home gardener nurturing your first sprout or a seasoned farmer managing acres of crops, plant diseases can be a significant challenge.
                            </p>
                            <p className="text-gray-600">
                                We've harnessed the power of artificial intelligence to create an intuitive tool that helps you identify plant diseases quickly and accurately. By providing instant diagnoses and actionable advice, we aim to reduce crop loss, promote sustainable farming practices, and help you grow with confidence.
                            </p>
                        </div>
                        <div className="order-1 md:order-2">
                            <img
                                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop"
                                alt="Lush green plant leaves"
                                className="rounded-[24px] shadow-xl w-full h-auto object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/a0d9b1/333333?text=Healthy+Plants'; }}
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* How It Works Section */}
            <div className="bg-white py-12 md:py-20 px-2.5 sm:px-10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[var(--primary)] mb-2">Simple Steps to a Healthy Plant</h2>
                    <p className="text-gray-600 mb-16 max-w-2xl mx-auto">Our process is designed to be fast, easy, and effective. Get a diagnosis in just three simple steps.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center p-6">
                            <UploadCloud />
                            <h3 className="text-xl font-semibold text-[var(--secondary)] mb-2">1. Upload an Image</h3>
                            <p className="text-gray-600">Take a clear photo of the affected plant leaf and upload it to our platform.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center p-6">
                            <Microscope />
                            <h3 className="text-xl font-semibold text-[var(--secondary)] mb-2">2. Get Instant Analysis</h3>
                            <p className="text-gray-600">Our AI model analyzes the image against a vast database of plant diseases to identify the issue.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center p-6">
                            <Stethoscope />
                            <h3 className="text-xl font-semibold text-[var(--secondary)] mb-2">3. Receive a Solution</h3>
                            <p className="text-gray-600">Get a detailed report on the disease, along with recommended organic and chemical treatment options.</p>
                        </div>
                    </div>
                </div>
            </div>

            <FaqsSection />
        </div>
    );
}