import React, { useState, useEffect, useRef } from "react";
import { IoSend, IoImageOutline, IoLanguage } from "react-icons/io5";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AIModel = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageFilePreview, setImageFilePreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [filteredPrediction, setFilteredPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [conversation, setConversation] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [languageMode, setLanguageMode] = useState("english");
    const imageFileRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Plant options with Urdu names
    const plantOptions = [
        { value: "", english: "Select a plant", urdu: "پودا منتخب کریں", prefixes: [] },
        { value: "Maize", english: "Maize", urdu: "مکئی", prefixes: ["Corn"] },
        { value: "Chickpeas", english: "Chickpeas", urdu: "چنے", prefixes: ["Chickpea", "ChickPea"] },
        { value: "Mango", english: "Mango", urdu: "آم", prefixes: ["Mango"] },
        { value: "Rice", english: "Rice", urdu: "چاول", prefixes: ["Rice"] }
    ];

    // Language content
    const textContent = {
        english: {
            welcome: "AI Plant Disease Predictor",
            selectImage: "Select an image",
            imageTypes: "(JPEG, PNG, WEBP)",
            selectPlant: "Select Plant",
            startAnalyzing: "Start Analyzing",
            processing: "Processing...",
            selected: "Selected",
            chatTitle: "Ask About Results",
            chatSubtitle: "Ask questions about the detected diseases",
            analyzeFirst: "Upload an image, select a plant, and click 'Start Analyzing' to begin.",
            placeholder: "Ask a question...",
            tryAsking: "Try asking",
            you: "You",
            assistant: "AI Assistant",
            thinking: "AI is thinking",
            analyzing: (plant) => `Analyzing your ${plant} leaf image...`,
            error: "Sorry, I encountered an error. Please try again.",
            initialAnalysisPrompt: "Analyze these plant disease predictions and provide a helpful summary for the farmer.",
            suggestedPrompts: [
                "Tell me more about this disease",
                "How do I treat this?",
                "What are the symptoms?",
                "Is this serious?"
            ]
        },
        urdu: {
            welcome: "پلانٹ ڈیزیز پریڈکٹر",
            selectImage: "تصویر منتخب کریں",
            imageTypes: "(JPEG, PNG, WEBP)",
            selectPlant: "پودا منتخب کریں",
            startAnalyzing: "تجزیہ شروع کریں",
            processing: "جاری ہے...",
            selected: "منتخب شدہ",
            chatTitle: "نتائج کے بارے میں پوچھیں",
            chatSubtitle: "پائی گئی بیماریوں کے بارے میں سوالات پوچھیں",
            analyzeFirst: "شروع کرنے کے لیے تصویر اپ لوڈ کریں، پودا منتخب کریں، اور 'تجزیہ شروع کریں' پر کلک کریں۔",
            placeholder: "سوال پوچھیں...",
            tryAsking: "کوشش کریں",
            you: "آپ",
            assistant: "AI معاون",
            thinking: "سوچ رہا ہوں",
            analyzing: (plant) => `آپ کی ${plant} کی پتی کی تصویر کا تجزیہ کیا جا رہا ہے...`,
            error: "معذرت، کچھ مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔",
            initialAnalysisPrompt: "ان پلانٹ ڈیزیز پیشنگوئیوں کا تجزیہ کریں اور کسان کے لیے مددگار خلاصہ پیش کریں۔",
            suggestedPrompts: [
                "اس بیماری کے بارے میں مزید بتائیں",
                "علاج کیا ہے؟",
                "علامات کیا ہیں؟",
                "کیا یہ سنگین ہے؟"
            ]
        }
    };

    // Get current language content
    const t = textContent[languageMode];

    // Get plant display name
    const getPlantDisplayName = (plantValue) => {
        const plant = plantOptions.find(p => p.value === plantValue);
        if (!plant) return plantValue;
        return languageMode === "english" ? plant.english : plant.urdu;
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImageFileName(file.name);
        setImageFilePreview(URL.createObjectURL(file));
    };

    // Handle plant selection
    const handlePlantChange = (e) => {
        const plant = e.target.value;
        setSelectedPlant(plant);
    };

    // Toggle language
    const toggleLanguageMode = () => {
        setLanguageMode(prev => prev === "english" ? "urdu" : "english");
    };

    // Filter predictions
    const filterAndNormalizePredictions = (predictions, plant) => {
        const selectedPlantOption = plantOptions.find(p => p.value === plant);
        if (!selectedPlantOption || !selectedPlantOption.prefixes) {
            return [];
        }

        const filtered = predictions.filter(p => {
            const plantPrefix = p.class.split('_')[0];
            return selectedPlantOption.prefixes.includes(plantPrefix);
        });

        if (filtered.length === 0) {
            return [];
        }

        const totalConfidence = filtered.reduce((sum, p) => sum + p.confidence, 0);
        const normalized = filtered.map(p => ({
            ...p,
            displayClass: p.class.split('_').slice(1).join(' ').replace(/_/g, ' '),
            originalClass: p.class,
            confidence: (p.confidence / totalConfidence) * 100
        }));

        return normalized;
    };

    // Convert image to Base64
    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
        });

    // Send initial analysis to DeepSeek
    const sendInitialAnalysisToDeepSeek = async (filteredPreds, plantName) => {
        try {
            const context = {
                plant: selectedPlant,
                plantDisplayName: getPlantDisplayName(selectedPlant),
                predictions: filteredPreds.map(p => ({
                    disease: p.displayClass,
                    confidence: p.confidence.toFixed(2),
                    originalClass: p.originalClass
                })),
                userQuestion: t.initialAnalysisPrompt,
                language: languageMode,
                isInitialAnalysis: true
            };

            const deepseekRes = await axios.post("http://localhost:8000/deepseek", {
                prompt_data: JSON.stringify(context),
            });

            // Extract response
            let responseText;
            if (typeof deepseekRes.data === 'string') {
                responseText = deepseekRes.data;
            } else if (deepseekRes.data && typeof deepseekRes.data === 'object') {
                responseText = deepseekRes.data.response ||
                    deepseekRes.data.answer ||
                    JSON.stringify(deepseekRes.data, null, 2);
            } else {
                responseText = String(deepseekRes.data);
            }

            return responseText;
        } catch (err) {
            console.error("Error getting initial analysis:", err);
            throw err;
        }
    };

    // Handle image analysis
    const handleSubmit = async () => {
        if (!imageFile) {
            alert(languageMode === "english" ? "Please select an image first" : "براہ کرم پہلے تصویر منتخب کریں");
            return;
        }
        if (!selectedPlant) {
            alert(languageMode === "english" ? "Please select a plant first" : "براہ کرم پہلے پودا منتخب کریں");
            return;
        }

        setLoading(true);
        setConversation([]);

        try {
            const base64Image = await getBase64(imageFile);
            
            // Show initial loading message
            const plantDisplayName = getPlantDisplayName(selectedPlant);
            setConversation([{
                role: "assistant",
                content: t.analyzing(plantDisplayName),
                timestamp: new Date().toISOString(),
                isMarkdown: false
            }]);

            // Send to /predict
            const predictRes = await axios.post("http://localhost:8000/predict", {
                image: base64Image,
            });
            
            console.log("Prediction result:", predictRes.data);

            // Filter predictions
            const filteredPreds = filterAndNormalizePredictions(predictRes.data, selectedPlant);
            setFilteredPrediction(filteredPreds);

            if (filteredPreds && filteredPreds.length > 0) {
                // Get initial analysis from DeepSeek
                const analysisResponse = await sendInitialAnalysisToDeepSeek(filteredPreds, getPlantDisplayName(selectedPlant));
                
                // Update conversation with analysis
                const analysisMessage = {
                    role: "assistant",
                    content: analysisResponse,
                    timestamp: new Date().toISOString(),
                    isMarkdown: true
                };
                
                setConversation([analysisMessage]);
            } else {
                // No diseases found
                const noDiseasesMessage = {
                    role: "assistant",
                    content: languageMode === "english" 
                        ? `I've analyzed your **${getPlantDisplayName(selectedPlant)}** leaf. No diseases were detected. Your plant appears healthy! You can still ask me general questions about plant care.`
                        : `میں نے آپ کی **${getPlantDisplayName(selectedPlant)}** کی پتی کا تجزیہ کیا ہے۔ کوئی بیماری نہیں ملی۔ آپ کا پودا صحت مند نظر آتا ہے! آپ پھر بھی مجھ سے پودوں کی دیکھ بھال کے بارے میں سوالات پوچھ سکتے ہیں۔`,
                    timestamp: new Date().toISOString(),
                    isMarkdown: true
                };
                setConversation([noDiseasesMessage]);
            }
        } catch (err) {
            console.error("Error:", err);
            
            const errorMessage = {
                role: "assistant",
                content: t.error,
                timestamp: new Date().toISOString(),
                isMarkdown: false
            };
            setConversation([errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Send user message to DeepSeek
    const sendCustomPrompt = async () => {
        if (!customPrompt.trim()) return;
        if (!filteredPrediction) {
            alert(languageMode === "english" 
                ? "Please analyze an image first" 
                : "براہ کرم پہلے تصویر کا تجزیہ کریں");
            return;
        }

        // Add user message to conversation
        const userMessage = {
            role: "user",
            content: customPrompt,
            timestamp: new Date().toISOString(),
            isMarkdown: false
        };

        setConversation(prev => [...prev, userMessage]);
        setCustomPrompt("");
        setChatLoading(true);

        try {
            // Prepare context with predictions and conversation history
            const context = {
                plant: selectedPlant,
                plantDisplayName: getPlantDisplayName(selectedPlant),
                predictions: filteredPrediction.map(p => ({
                    disease: p.displayClass,
                    confidence: p.confidence.toFixed(2),
                    originalClass: p.originalClass
                })),
                userQuestion: customPrompt,
                conversation: conversation.slice(-3).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                language: languageMode,
                isInitialAnalysis: false
            };

            // Send to DeepSeek
            const deepseekRes = await axios.post("http://localhost:8000/deepseek", {
                prompt_data: JSON.stringify(context),
            });

            // Extract response
            let responseText;
            if (typeof deepseekRes.data === 'string') {
                responseText = deepseekRes.data;
            } else if (deepseekRes.data && typeof deepseekRes.data === 'object') {
                responseText = deepseekRes.data.response ||
                    deepseekRes.data.answer ||
                    JSON.stringify(deepseekRes.data, null, 2);
            } else {
                responseText = String(deepseekRes.data);
            }

            // Add assistant response
            const assistantMessage = {
                role: "assistant",
                content: responseText,
                timestamp: new Date().toISOString(),
                isMarkdown: true
            };

            setConversation(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error("Error sending prompt:", err);
            const errorMessage = {
                role: "assistant",
                content: t.error,
                timestamp: new Date().toISOString(),
                isMarkdown: false
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setChatLoading(false);
        }
    };

    // Markdown components
    const MarkdownComponents = {
        p: ({ node, ...props }) => <p className="mb-2 mixed-text" dir="auto" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 mixed-text" dir="auto" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 mixed-text" dir="auto" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-2 mb-1 mixed-text" dir="auto" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 mixed-text" dir="auto" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 mixed-text" dir="auto" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1 mixed-text" dir="auto" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold mixed-text" {...props} />,
        em: ({ node, ...props }) => <em className="italic mixed-text" {...props} />,
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 mixed-text" dir="auto" {...props} />
        ),
        code: ({ node, inline, ...props }) =>
            inline ? (
                <code className="bg-gray-100 px-1 rounded font-mono text-sm mixed-text" dir="ltr" {...props} />
            ) : (
                <pre className="bg-gray-100 p-3 rounded my-2 overflow-x-auto" dir="ltr">
                    <code className="font-mono text-sm" {...props} />
                </pre>
            ),
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    return (
        <div className="flex flex-col w-full min-h-screen">
            {/* Urdu font import */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap');
                
                .mixed-text {
                    font-family: 'Noto Sans Arabic', 'Noto Sans', 'Segoe UI', Tahoma, Geneva, sans-serif;
                    line-height: 1.8;
                    unicode-bidi: plaintext;
                    text-align: start;
                }
                `}
            </style>

            {/* Top Section: Controls */}
            <div className="w-full p-4 sm:p-6 xl:py-6 xl:px-12 bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{t.welcome}</h3>
                            <p className="text-gray-600 text-sm">
                                {languageMode === "english" 
                                    ? "Upload a plant leaf image for analysis" 
                                    : "تجزیے کے لیے پودے کی پتی کی تصویر اپ لوڈ کریں"}
                            </p>
                        </div>
                        <button
                            onClick={toggleLanguageMode}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors self-start md:self-auto"
                        >
                            <IoLanguage className="text-lg" />
                            <span className="font-medium">
                                {languageMode === "english" ? "اردو" : "English"}
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">{t.selectImage}:</label>
                            <div role="button" 
                                className="relative flex justify-center p-4 text-neutral-600 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer transition-all hover:border-green-500 hover:text-green-500 min-h-[120px]"
                                onClick={() => imageFileRef.current.click()}
                            >
                                <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                {imageFilePreview ? (
                                    <img src={imageFilePreview} alt="preview" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <IoImageOutline size={40} className="mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-700">{t.selectImage}</p>
                                    </div>
                                )}
                                {imageFile && (
                                    <button className="absolute top-2 right-2 text-white text-xs bg-red-500 w-5 h-5 flex items-center justify-center rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImageFileName(null);
                                            setImageFilePreview(null);
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {imageFileName && <p className="mt-1 text-xs text-gray-600">{t.selected}: {imageFileName}</p>}
                        </div>

                        {/* Plant Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">{t.selectPlant}:</label>
                            <select
                                value={selectedPlant}
                                onChange={handlePlantChange}
                                className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 h-[56px]"
                            >
                                {plantOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {languageMode === "english" ? option.english : option.urdu}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Analyze Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !selectedPlant || !imageFile}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t.processing}
                                    </span>
                                ) : t.startAnalyzing}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Chatbot */}
            <div className="flex-1 w-full p-4 sm:p-6 xl:px-12 bg-gray-50">
                <div className="max-w-6xl mx-auto h-full">
                    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h5 className="text-gray-800 font-bold mixed-text" dir="auto">
                                {t.chatTitle}
                            </h5>
                            <p className="text-gray-600 text-xs mt-1 mixed-text" dir="auto">
                                {t.chatSubtitle}
                            </p>
                        </div>

                        {/* Chat Messages */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 p-4 bg-gray-50 overflow-y-auto"
                            style={{ 
                                fontFamily: "'Noto Sans Arabic', 'Noto Sans', sans-serif",
                                minHeight: '300px',
                                maxHeight: 'calc(100vh - 350px)'
                            }}
                        >
                            {conversation.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <p className="text-gray-500 mixed-text" dir="auto">
                                            {t.analyzeFirst}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                conversation.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`mb-3 p-3 rounded-lg ${msg.role === "user"
                                                ? "bg-green-50 border-l-4 border-green-500"
                                                : "bg-gray-50 border-l-4 border-gray-500"
                                            } mixed-text`}
                                        dir="auto"
                                        style={{
                                            fontFamily: "'Noto Sans Arabic', 'Noto Sans', sans-serif",
                                            lineHeight: '1.6'
                                        }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-semibold text-sm">
                                                {msg.role === "user" ? t.you : t.assistant}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        {msg.isMarkdown ? (
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={MarkdownComponents}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap">
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {chatLoading && (
                                <div className="flex items-center p-3 text-gray-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                    {t.thinking}
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendCustomPrompt()}
                                    placeholder={t.placeholder}
                                    disabled={!filteredPrediction || chatLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 mixed-text"
                                    dir="auto"
                                />
                                <button
                                    onClick={sendCustomPrompt}
                                    disabled={!customPrompt.trim() || !filteredPrediction || chatLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <IoSend className="mr-1" size={16} />
                                    <span className="hidden sm:inline">{languageMode === "english" ? "Send" : "بھیجیں"}</span>
                                </button>
                            </div>
                            
                            {/* Suggested Prompts */}
                            {filteredPrediction && filteredPrediction.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-xs text-gray-600 mb-2">{t.tryAsking}:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {t.suggestedPrompts.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCustomPrompt(prompt)}
                                                className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors mixed-text"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModel;