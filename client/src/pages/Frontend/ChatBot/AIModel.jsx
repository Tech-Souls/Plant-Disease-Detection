import React, { useState, useEffect, useRef } from "react";
import {
    IoSend,
    IoImageOutline,
    IoLanguage,
    IoChatbubbleOutline,
    IoTrashOutline,
    IoTimeOutline,
    IoClose,
    IoMenu,
    IoLocationOutline,
    IoChevronBack,
    IoChevronForward
} from "react-icons/io5";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AIModel = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageFilePreview, setImageFilePreview] = useState(null);
    const [filteredPrediction, setFilteredPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [conversation, setConversation] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [languageMode, setLanguageMode] = useState("english");
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [pastChats, setPastChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const imageFileRef = useRef(null);
    const chatContainerRef = useRef(null);

    const plantOptions = [
        { value: "", english: "Select a plant", urdu: "پودا منتخب کریں", prefixes: [] },
        { value: "Maize", english: "Maize", urdu: "مکئی", prefixes: ["Corn"] },
        { value: "Chickpeas", english: "Chickpeas", urdu: "چنے", prefixes: ["Chickpea", "ChickPea"] },
        { value: "Mango", english: "Mango", urdu: "آم", prefixes: ["Mango"] },
        { value: "Rice", english: "Rice", urdu: "چاول", prefixes: ["Rice"] }
    ];

    const textContent = {
        english: {
            welcome: "AI Plant Disease Predictor",
            selectImage: "Select an image",
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
            suggestedPrompts: ["Tell me more about this disease", "How do I treat this?", "What are the symptoms?", "Is this serious?"],
            location: "Location",
            gettingLocation: "Getting location...",
            locationAccess: "Allow location access for local recommendations",
            enableLocation: "Enable Location",
            locationError: "Location access denied or unavailable",
            chatHistory: "Chat History",
            newChat: "New Chat",
            noChats: "No previous chats",
            deleteChat: "Delete chat",
            currentChat: "Current Chat",
            collapseSidebar: "Collapse sidebar",
            expandSidebar: "Expand sidebar"
        },
        urdu: {
            welcome: "پلانٹ ڈیزیز پریڈکٹر",
            selectImage: "تصویر منتخب کریں",
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
            suggestedPrompts: ["اس بیماری کے بارے میں مزید بتائیں", "علاج کیا ہے؟", "علامات کیا ہیں؟", "کیا یہ سنگین ہے؟"],
            location: "مقام",
            gettingLocation: "مقام حاصل کیا جا رہا ہے...",
            locationAccess: "مقامی سفارشات کے لیے مقام تک رسائی کی اجازت دیں",
            enableLocation: "مقام فعال کریں",
            locationError: "مقام تک رسائی مسترد یا دستیاب نہیں",
            chatHistory: "چیٹ تاریخ",
            newChat: "نیا چیٹ",
            noChats: "کوئی پچھلی چیٹس نہیں",
            deleteChat: "چیٹ حذف کریں",
            currentChat: "موجودہ چیٹ",
            collapseSidebar: "سائیڈبار بند کریں",
            expandSidebar: "سائیڈبار کھولیں"
        }
    };

    const t = textContent[languageMode];

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const user = localStorage.getItem('userId');
                if (token && user) {
                    setIsLoggedIn(true);
                    setUserId(user);
                    await loadChatsFromDatabase(user);
                } else {
                    setIsLoggedIn(false);
                    loadChatsFromLocalStorage();
                }
            } catch (error) {
                console.error("Auth check error:", error);
                loadChatsFromLocalStorage();
            }
        };
        checkAuth();
    }, []);

    const loadChatsFromDatabase = async (userId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_PYTHON_HOST}/chats/${userId}`);
            if (response.data && Array.isArray(response.data)) {
                setPastChats(response.data);
                if (response.data.length > 0) {
                    const latestChat = response.data[0];
                    setActiveChatId(latestChat.id);
                    setConversation(latestChat.conversation);
                    setFilteredPrediction(latestChat.filteredPrediction);
                    setSelectedPlant(latestChat.plant);
                    setImageFilePreview(latestChat.imagePreview);
                }
            }
        } catch (error) {
            console.error("Error loading chats from database:", error);
            loadChatsFromLocalStorage();
        }
    };

    const loadChatsFromLocalStorage = () => {
        const savedChats = localStorage.getItem('plantChatHistory');
        if (savedChats) {
            try {
                const parsedChats = JSON.parse(savedChats);
                setPastChats(parsedChats);
                if (parsedChats.length > 0) {
                    setActiveChatId(parsedChats[0].id);
                    setConversation(parsedChats[0].conversation);
                    setFilteredPrediction(parsedChats[0].filteredPrediction);
                    setSelectedPlant(parsedChats[0].plant);
                    setImageFilePreview(parsedChats[0].imagePreview);
                }
            } catch (err) {
                console.error("Error loading chat history:", err);
            }
        }
    };

    const saveChatToDatabase = async (chatData) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_PYTHON_HOST}/chats`, {
                userId: userId,
                ...chatData
            });
            return response.data;
        } catch (error) {
            console.error("Error saving chat to database:", error);
            throw error;
        }
    };

    const updateChatInDatabase = async (chatId, conversationData) => {
        try {
            await axios.put(`${import.meta.env.VITE_PYTHON_HOST}/chats/${chatId}`, {
                conversation: conversationData
            });
        } catch (error) {
            console.error("Error updating chat in database:", error);
            throw error;
        }
    };

    const deleteChatFromDatabase = async (chatId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_PYTHON_HOST}/chats/${chatId}`);
        } catch (error) {
            console.error("Error deleting chat from database:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem('plantChatHistory', JSON.stringify(pastChats));
        }
    }, [pastChats, isLoggedIn]);

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(t.locationError);
            return;
        }
        setLocationLoading(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLocationLoading(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationError(t.locationError);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const getPlantDisplayName = (plantValue) => {
        const plant = plantOptions.find(p => p.value === plantValue);
        if (!plant) return plantValue;
        return languageMode === "english" ? plant.english : plant.urdu;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImageFileName(file.name);
        setImageFilePreview(URL.createObjectURL(file));
    };

    const handlePlantChange = (e) => setSelectedPlant(e.target.value);
    const toggleLanguageMode = () => setLanguageMode(prev => prev === "english" ? "urdu" : "english");

    const filterAndNormalizePredictions = (predictions, plant) => {
        const selectedPlantOption = plantOptions.find(p => p.value === plant);
        if (!selectedPlantOption || !selectedPlantOption.prefixes) return [];
        const filtered = predictions.filter(p => {
            const plantPrefix = p.class.split('_')[0];
            return selectedPlantOption.prefixes.includes(plantPrefix);
        });
        if (filtered.length === 0) return [];
        const totalConfidence = filtered.reduce((sum, p) => sum + p.confidence, 0);
        return filtered.map(p => ({
            ...p,
            displayClass: p.class.split('_').slice(1).join(' ').replace(/_/g, ' '),
            originalClass: p.class,
            confidence: (p.confidence / totalConfidence) * 100
        }));
    };

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
        });

    const saveChatToHistory = async (conversationData, predictions, plant, imagePreview) => {
        const newChat = {
            id: Date.now().toString(),
            title: `${getPlantDisplayName(plant)} - ${new Date().toLocaleDateString()}`,
            plant: plant,
            plantDisplayName: getPlantDisplayName(plant),
            conversation: conversationData,
            filteredPrediction: predictions,
            imagePreview: imagePreview,
            location: userLocation,
            timestamp: new Date().toISOString()
        };

        if (isLoggedIn && userId) {
            try {
                const savedChat = await saveChatToDatabase(newChat);
                setPastChats(prev => [savedChat, ...prev]);
                setActiveChatId(savedChat.id);
                return savedChat.id;
            } catch (error) {
                setPastChats(prev => [newChat, ...prev]);
                setActiveChatId(newChat.id);
                return newChat.id;
            }
        } else {
            setPastChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id);
            return newChat.id;
        }
    };

    const loadChatFromHistory = (chatId) => {
        const chat = pastChats.find(c => c.id === chatId);
        if (chat) {
            setConversation(chat.conversation);
            setFilteredPrediction(chat.filteredPrediction);
            setSelectedPlant(chat.plant);
            setImageFilePreview(chat.imagePreview);
            setActiveChatId(chatId);
            setSidebarOpen(false);
        }
    };

    const deleteChatFromHistory = async (chatId, e) => {
        e.stopPropagation();
        if (isLoggedIn && userId) {
            try {
                await deleteChatFromDatabase(chatId);
            } catch (error) {
                console.error("Failed to delete from database:", error);
            }
        }
        const updatedChats = pastChats.filter(chat => chat.id !== chatId);
        setPastChats(updatedChats);
        if (activeChatId === chatId) {
            if (updatedChats.length > 0) {
                loadChatFromHistory(updatedChats[0].id);
            } else {
                setConversation([]);
                setFilteredPrediction(null);
                setSelectedPlant("");
                setImageFilePreview(null);
                setActiveChatId(null);
            }
        }
    };

    const startNewChat = () => {
        setConversation([]);
        setFilteredPrediction(null);
        setSelectedPlant("");
        setImageFile(null);
        setImageFileName(null);
        setImageFilePreview(null);
        setActiveChatId(null);
    };

    const sendInitialAnalysisToDeepSeek = async (filteredPreds) => {
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
                location: userLocation,
                isInitialAnalysis: true
            };
            const deepseekRes = await axios.post(`${import.meta.env.VITE_PYTHON_HOST}/deepseek`, {
                prompt_data: JSON.stringify(context),
            });
            let responseText;
            if (typeof deepseekRes.data === 'string') {
                responseText = deepseekRes.data;
            } else if (deepseekRes.data && typeof deepseekRes.data === 'object') {
                responseText = deepseekRes.data.response || deepseekRes.data.answer || JSON.stringify(deepseekRes.data, null, 2);
            } else {
                responseText = String(deepseekRes.data);
            }
            return responseText;
        } catch (err) {
            console.error("Error getting initial analysis:", err);
            throw err;
        }
    };

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
        try {
            const base64Image = await getBase64(imageFile);
            const plantDisplayName = getPlantDisplayName(selectedPlant);
            const loadingMessage = {
                role: "assistant",
                content: t.analyzing(plantDisplayName),
                timestamp: new Date().toISOString(),
                isMarkdown: false
            };
            setConversation([loadingMessage]);
            const predictRes = await axios.post(`${import.meta.env.VITE_PYTHON_HOST}/predict`, { image: base64Image });
            const filteredPreds = filterAndNormalizePredictions(predictRes.data, selectedPlant);
            setFilteredPrediction(filteredPreds);
            if (filteredPreds && filteredPreds.length > 0) {
                const analysisResponse = await sendInitialAnalysisToDeepSeek(filteredPreds);
                const analysisMessage = {
                    role: "assistant",
                    content: analysisResponse,
                    timestamp: new Date().toISOString(),
                    isMarkdown: true
                };
                setConversation([analysisMessage]);
                await saveChatToHistory([analysisMessage], filteredPreds, selectedPlant, imageFilePreview);
            } else {
                const noDiseasesMessage = {
                    role: "assistant",
                    content: languageMode === "english"
                        ? `I've analyzed your **${getPlantDisplayName(selectedPlant)}** leaf. No diseases were detected. Your plant appears healthy!`
                        : `میں نے آپ کی **${getPlantDisplayName(selectedPlant)}** کی پتی کا تجزیہ کیا ہے۔ کوئی بیماری نہیں ملی۔ آپ کا پودا صحت مند نظر آتا ہے!`,
                    timestamp: new Date().toISOString(),
                    isMarkdown: true
                };
                setConversation([noDiseasesMessage]);
                await saveChatToHistory([noDiseasesMessage], [], selectedPlant, imageFilePreview);
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

    const sendCustomPrompt = async () => {
        if (!customPrompt.trim()) return;
        if (!filteredPrediction) {
            alert(languageMode === "english" ? "Please analyze an image first" : "براہ کرم پہلے تصویر کا تجزیہ کریں");
            return;
        }
        const userMessage = { role: "user", content: customPrompt, timestamp: new Date().toISOString(), isMarkdown: false };
        const updatedConversation = [...conversation, userMessage];
        setConversation(updatedConversation);
        setCustomPrompt("");
        setChatLoading(true);
        try {
            const context = {
                plant: selectedPlant,
                plantDisplayName: getPlantDisplayName(selectedPlant),
                predictions: filteredPrediction.map(p => ({
                    disease: p.displayClass,
                    confidence: p.confidence.toFixed(2),
                    originalClass: p.originalClass
                })),
                userQuestion: customPrompt,
                conversation: conversation.slice(-3).map(msg => ({ role: msg.role, content: msg.content })),
                location: userLocation,
                language: languageMode,
                isInitialAnalysis: false
            };
            const deepseekRes = await axios.post(`${import.meta.env.VITE_PYTHON_HOST}/deepseek`, {
                prompt_data: JSON.stringify(context),
            });
            let responseText;
            if (typeof deepseekRes.data === 'string') {
                responseText = deepseekRes.data;
            } else if (deepseekRes.data && typeof deepseekRes.data === 'object') {
                responseText = deepseekRes.data.response || deepseekRes.data.answer || JSON.stringify(deepseekRes.data, null, 2);
            } else {
                responseText = String(deepseekRes.data);
            }
            const assistantMessage = { role: "assistant", content: responseText, timestamp: new Date().toISOString(), isMarkdown: true };
            const finalConversation = [...updatedConversation, assistantMessage];
            setConversation(finalConversation);
            if (activeChatId) {
                if (isLoggedIn && userId) {
                    try {
                        await updateChatInDatabase(activeChatId, finalConversation);
                    } catch (error) {
                        console.error("Failed to update chat in database:", error);
                    }
                }
                setPastChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, conversation: finalConversation } : chat));
            }
        } catch (err) {
            console.error("Error sending prompt:", err);
            const errorMessage = { role: "assistant", content: t.error, timestamp: new Date().toISOString(), isMarkdown: false };
            const finalConversation = [...updatedConversation, errorMessage];
            setConversation(finalConversation);
            if (activeChatId) {
                setPastChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, conversation: finalConversation } : chat));
            }
        } finally {
            setChatLoading(false);
        }
    };

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

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap');
                .mixed-text {
                    font-family: 'Noto Sans Arabic', 'Noto Sans', 'Segoe UI', Tahoma, Geneva, sans-serif;
                    line-height: 1.8;
                    unicode-bidi: plaintext;
                    text-align: start;
                }
                @media (max-width: 768px) {
                    .sidebar-mobile {
                        position: fixed;
                        left: ${sidebarOpen ? '0' : '-100%'};
                        transition: left 0.3s ease-in-out;
                        z-index: 50;
                        height: 100vh;
                    }
                    .sidebar-overlay {
                        display: ${sidebarOpen ? 'block' : 'none'};
                    }
                }
                .sidebar-transition {
                    transition: width 0.3s ease-in-out;
                }
                `}
            </style>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`sidebar-mobile md:relative sidebar-transition bg-gray-50 border-r border-gray-200 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-80'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                        {!sidebarCollapsed && (
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <IoChatbubbleOutline />
                                {t.chatHistory}
                            </h3>
                        )}
                        <div className="flex items-center gap-2">
                            {!sidebarCollapsed && (
                                <button
                                    onClick={startNewChat}
                                    className="p-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {t.newChat}
                                </button>
                            )}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="hidden md:block p-2 text-gray-600 hover:text-gray-800"
                                title={sidebarCollapsed ? t.expandSidebar : t.collapseSidebar}
                            >
                                {sidebarCollapsed ? <IoChevronForward size={20} /> : <IoChevronBack size={20} />}
                            </button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {pastChats.length === 0 ? (
                        !sidebarCollapsed && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <IoTimeOutline size={48} className="mb-3" />
                                <p className="text-center">{t.noChats}</p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-2">
                            {pastChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${activeChatId === chat.id
                                            ? 'bg-green-50 border-l-4 border-green-500'
                                            : 'bg-white'
                                        }`}
                                    onClick={() => loadChatFromHistory(chat.id)}
                                    title={sidebarCollapsed ? chat.title : ''}
                                >
                                    {sidebarCollapsed ? (
                                        <div className="flex justify-center">
                                            <IoChatbubbleOutline size={24} className="text-gray-600" />
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">
                                                    {chat.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="truncate">
                                                        {chat.plantDisplayName}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(chat.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                                                    {chat.conversation[0]?.content?.substring(0, 60)}...
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => deleteChatFromHistory(chat.id, e)}
                                                className="p-1 text-gray-400 hover:text-red-500 ml-2"
                                                title={t.deleteChat}
                                            >
                                                <IoTrashOutline size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location Section */}
                {!sidebarCollapsed && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                <IoLocationOutline />
                                {t.location}
                            </h4>
                            {userLocation && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    ✓ {languageMode === "english" ? "Enabled" : "فعال"}
                                </span>
                            )}
                        </div>

                        {locationLoading ? (
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                {t.gettingLocation}
                            </div>
                        ) : userLocation ? (
                            <div className="text-xs text-gray-600">
                                <p className="mb-1">
                                    {languageMode === "english"
                                        ? "Location enabled for local recommendations"
                                        : "مقامی سفارشات کے لیے مقام فعال ہے"}
                                </p>
                                <p className="text-gray-400">
                                    Lat: {userLocation.latitude.toFixed(4)}, Long: {userLocation.longitude.toFixed(4)}
                                </p>
                            </div>
                        ) : (
                            <div>
                                {locationError ? (
                                    <p className="text-xs text-red-600 mb-2">{locationError}</p>
                                ) : (
                                    <p className="text-xs text-gray-600 mb-2">{t.locationAccess}</p>
                                )}
                                <button
                                    onClick={getUserLocation}
                                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <IoLocationOutline />
                                    {t.enableLocation}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Section: Controls */}
                <div className="w-full p-4 sm:p-6 xl:py-6 xl:px-12 bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                                >
                                    <IoMenu size={24} />
                                </button>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{t.welcome}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {languageMode === "english"
                                            ? "Upload a plant leaf image for analysis"
                                            : "تجزیے کے لیے پودے کی پتی کی تصویر اپ لوڈ کریں"}
                                    </p>
                                </div>
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
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h5 className="text-gray-800 font-bold mixed-text" dir="auto">
                                            {activeChatId ? pastChats.find(c => c.id === activeChatId)?.title : t.chatTitle}
                                        </h5>
                                        <p className="text-gray-600 text-xs mt-1 mixed-text" dir="auto">
                                            {t.chatSubtitle}
                                        </p>
                                    </div>
                                    {activeChatId && (
                                        <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                                            {t.currentChat}
                                        </span>
                                    )}
                                </div>
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
        </div>
    );
};

export default AIModel;