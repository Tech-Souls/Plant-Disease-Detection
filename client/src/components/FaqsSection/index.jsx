import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function FaqsSection() {
    const faqs = [
        {
            q: "How does Blossom identify plant diseases?",
            a: "Blossom uses AI to recognize the disease your green buddy has. Our database contains 100 diseases, such as root rot, overwatering, powdery mildew, thrips, and more.",
        },
        {
            q: "Can Blossom identify plant pests?",
            a: "Sure! Our technology can recognize many species, from houseplant pests to outdoor ones. You will get tips on how to fight and prevent spider mites, thrips, aphids, mealybugs, and many others.",
        },
        {
            q: "Does Blossom work for outdoor species?",
            a: "Blossom is a plant problem identifier that works for both indoor and outdoor plants - it can recognize a variety of problems and diseases. Be sure you will find solutions for your garden pals, from flowers and trees to veggies and fruits.",
        },
    ];

    const [activeIndex, setActiveIndex] = useState(null);

    const toggle = (idx) => {
        setActiveIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <div className="main-container py-30">
            <h2 className="text-center mb-12">Frequently Asked <span className="text-[var(--primary)]">Questions</span></h2>

            <div className="space-y-4">
                {faqs.map((item, idx) => {
                    const open = activeIndex === idx;
                    return (
                        <div
                            key={idx}
                            className="border border-gray-200 rounded-2xl overflow-hidden"
                        >
                            {/* Question */}
                            <button
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start"
                                onClick={() => toggle(idx)}
                            >
                                <span className="text-base md:text-lg font-medium">
                                    {idx + 1}. {item.q}
                                </span>
                                <FiChevronDown className={`text-gray-800 text-2xl shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                            </button>

                            {/* Answer with transition */}
                            <div
                                className={`px-5 transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-40 opacity-100 pb-5" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <p className="text-gray-700 leading-relaxed">{item.a}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}