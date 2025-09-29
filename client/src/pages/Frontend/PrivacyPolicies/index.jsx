import React from 'react';

export default function PrivacyPolicies() {
    return (
        <div className='bg-white font-sans text-gray-800 pt-8 pb-20 sm:pt-12 sm:pb-24'>
            <div className="max-w-4xl mx-auto px-4">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-[var(--primary)] mt-4">Privacy Policy</h2>
                </div>

                {/* Introduction */}
                <div className="prose lg:prose-lg max-w-none text-gray-700">
                    <p>
                        Welcome to PlantGuard. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our plant disease detection website and services (collectively, the "Service"). Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                    </p>

                    {/* Section: Information We Collect */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">1. Information We Collect</h4>
                    <p>
                        We collect information that you provide directly to us and information that is automatically collected when you use our Service.
                    </p>
                    <h5 className="text-xl font-semibold text-gray-700 mt-4">A. Information You Provide to Us</h5>
                    <p>
                        The primary information we collect is the content you provide for analysis:
                    </p>
                    <ul className='list-disc ml-4'>
                        <li><strong>Images of Plants:</strong> When you use our service to detect diseases, you upload images of plants, leaves, or stems. These images are the core data we use to provide our service.</li>
                        <li><strong>Communications:</strong> If you contact us directly for support or with inquiries, we may receive additional information about you such as your name, email address, and the contents of your message.</li>
                    </ul>
                    <h5 className="text-xl font-semibold text-gray-700 mt-4">B. Information We Collect Automatically</h5>
                    <p>
                        When you use our Service, we may automatically collect certain information about your device and usage:
                    </p>
                    <ul className='list-disc ml-4'>
                        <li><strong>Log and Usage Data:</strong> We may log information such as your IP address, browser type, operating system, referral URLs, and pages visited. This helps us understand how our Service is used and to improve it.</li>
                        <li><strong>Cookies:</strong> We may use cookies to help us operate and provide our Service. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</li>
                    </ul>

                    {/* Section: How We Use Your Information */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">2. How We Use Your Information</h4>
                    <p>We use the information we collect for various purposes, including:</p>
                    <ul className='list-decimal ml-4'>
                        <li>To provide, operate, and maintain our Service.</li>
                        <li>To analyze the images you upload to identify plant diseases.</li>
                        <li>To improve, personalize, and expand our Service.</li>
                        <li>To develop new products, services, features, and functionality.</li>
                        <li>To understand and analyze how you use our Service.</li>
                        <li>For research and development, including training our artificial intelligence models to better recognize plant diseases. All images used for this purpose are handled with privacy in mind.</li>
                    </ul>

                    {/* Section: How We Share Your Information */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">3. How We Share Your Information</h4>
                    <p>We do not sell your personal information. We may share information we collect in the following circumstances:</p>
                    <ul className='list-disc ml-4'>
                        <li><strong>With Service Providers:</strong> We may share information with third-party vendors and service providers that perform services for us, such as cloud hosting.</li>
                        <li><strong>For Research:</strong> We may share anonymized or aggregated data (data that cannot be used to identify you) with research partners to advance the study of plant pathology.</li>
                        <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                    </ul>

                    {/* Section: Data Security */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">4. Data Security</h4>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    {/* Section: Children's Privacy */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">5. Children's Privacy</h4>
                    <p>
                        Our Service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                    </p>

                    {/* Section: Changes to This Policy */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">6. Changes to This Privacy Policy</h4>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                    </p>

                    {/* Section: Contact Us */}
                    <h4 className="text-2xl font-semibold text-[var(--secondary)] mt-8">7. Contact Us</h4>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@plantguard.com" className="text-green-600 hover:underline">privacy@plantguard.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}