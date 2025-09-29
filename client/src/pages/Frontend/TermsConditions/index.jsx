import React from 'react';

export default function TermsAndConditions() {
    return (
        <div className='bg-white font-sans text-gray-800 pt-8 pb-20 sm:pt-12 sm:pb-24'>
            <div className="max-w-4xl mx-auto px-4">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-[var(--primary)] mt-4">Terms & Conditions</h2>
                </div>

                {/* Main Content */}
                <div className="prose lg:prose-lg max-w-none text-gray-700">
                    <p>
                        Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the PlantGuard website (the "Service") operated by PlantGuard ("us", "we", or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                    </p>

                    {/* Section: Acceptance of Terms */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">1. Acceptance of Terms</h4>
                    <p>
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                    </p>

                    {/* Section: Use of the Service */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">2. Use of the Service</h4>
                    <p>
                        Our Service provides an AI-powered analysis to help identify potential plant diseases based on images you provide. You agree to use the Service for its intended purpose and not to misuse it. You are responsible for the images you upload. You agree not to upload any content that:
                    </p>
                    <ul className='list-disc ml-4'>
                        <li>Is unlawful, harmful, threatening, abusive, or otherwise objectionable.</li>
                        <li>Violates the privacy or intellectual property rights of others.</li>
                        <li>Contains software viruses or any other computer code, files, or programs designed to interrupt, destroy, or limit the functionality of any computer software or hardware.</li>
                    </ul>

                    {/* Section: User-Generated Content */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">3. User-Generated Content</h4>
                    <p>
                        You retain all of your ownership rights in the images you upload to the Service. However, by uploading an image, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, and display the content in connection with the Service and our business, including for the purpose of training and improving our AI models. This use is always subject to the privacy protections outlined in our Privacy Policy.
                    </p>

                    {/* Section: Disclaimer of Warranties */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">4. Disclaimer of Warranties</h4>
                    <p>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The information and diagnosis provided by our Service are for informational purposes only and are not a substitute for professional advice from a qualified horticulturist or agricultural scientist. We make no warranties, expressed or implied, that the diagnosis will be accurate, complete, reliable, or timely. You acknowledge that you use the Service at your own risk.
                    </p>

                    {/* Section: Limitation of Liability */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">5. Limitation of Liability</h4>
                    <p>
                        In no event shall PlantGuard, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>

                    {/* Section: Governing Law */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">6. Governing Law</h4>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is based, without regard to its conflict of law provisions.
                    </p>

                    {/* Section: Changes to Terms */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">7. Changes to These Terms</h4>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>

                    {/* Section: Contact Us */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">8. Contact Us</h4>
                    <p>
                        If you have any questions about these Terms, please contact us at: <a href="mailto:contact@plantguard.com" className="text-green-600 hover:underline">contact@plantguard.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}