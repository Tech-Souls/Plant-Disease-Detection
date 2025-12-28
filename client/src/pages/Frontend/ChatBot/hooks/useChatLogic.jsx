import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getBase64, filterAndNormalizePredictions, getPlantDisplayName } from "../utils/utils";
import { textContent } from "../constants/constants";

export const useChatLogic = () => {
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

    const t = textContent[languageMode];

    // Auth check
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

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    // Save chats to localStorage
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem('plantChatHistory', JSON.stringify(pastChats));
        }
    }, [pastChats, isLoggedIn]);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImageFileName(file.name);
        setImageFilePreview(URL.createObjectURL(file));
    };

    const handlePlantChange = (e) => setSelectedPlant(e.target.value);
    const toggleLanguageMode = () => setLanguageMode(prev => prev === "english" ? "urdu" : "english");

    const sendInitialAnalysisToDeepSeek = async (filteredPreds) => {
        try {
            const context = {
                plant: selectedPlant,
                plantDisplayName: getPlantDisplayName(selectedPlant, languageMode),
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

    const saveChatToHistory = async (conversationData, predictions, plant, imagePreview) => {
        const newChat = {
            id: Date.now().toString(),
            title: `${getPlantDisplayName(plant, languageMode)} - ${new Date().toLocaleDateString()}`,
            plant: plant,
            plantDisplayName: getPlantDisplayName(plant, languageMode),
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
            const plantDisplayName = getPlantDisplayName(selectedPlant, languageMode);
            
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
                        ? `I've analyzed your **${getPlantDisplayName(selectedPlant, languageMode)}** leaf. No diseases were detected. Your plant appears healthy!`
                        : `میں نے آپ کی **${getPlantDisplayName(selectedPlant, languageMode)}** کی پتی کا تجزیہ کیا ہے۔ کوئی بیماری نہیں ملی۔ آپ کا پودا صحت مند نظر آتا ہے!`,
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
        
        const userMessage = { 
            role: "user", 
            content: customPrompt, 
            timestamp: new Date().toISOString(), 
            isMarkdown: false 
        };
        const updatedConversation = [...conversation, userMessage];
        setConversation(updatedConversation);
        setCustomPrompt("");
        setChatLoading(true);
        
        try {
            const context = {
                plant: selectedPlant,
                plantDisplayName: getPlantDisplayName(selectedPlant, languageMode),
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
            
            const assistantMessage = { 
                role: "assistant", 
                content: responseText, 
                timestamp: new Date().toISOString(), 
                isMarkdown: true 
            };
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
                setPastChats(prev => prev.map(chat => 
                    chat.id === activeChatId ? { ...chat, conversation: finalConversation } : chat
                ));
            }
        } catch (err) {
            console.error("Error sending prompt:", err);
            const errorMessage = { 
                role: "assistant", 
                content: t.error, 
                timestamp: new Date().toISOString(), 
                isMarkdown: false 
            };
            const finalConversation = [...updatedConversation, errorMessage];
            setConversation(finalConversation);
            
            if (activeChatId) {
                setPastChats(prev => prev.map(chat => 
                    chat.id === activeChatId ? { ...chat, conversation: finalConversation } : chat
                ));
            }
        } finally {
            setChatLoading(false);
        }
    };

    return {
        imageFile,
        setImageFile,
        imageFileName,
        setImageFileName,
        imageFilePreview,
        setImageFilePreview,
        filteredPrediction,
        loading,
        selectedPlant,
        customPrompt,
        setCustomPrompt,
        conversation,
        chatLoading,
        languageMode,
        userLocation,
        locationLoading,
        locationError,
        pastChats,
        activeChatId,
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        imageFileRef,
        chatContainerRef,
        t,
        getUserLocation,
        handleFileChange,
        handlePlantChange,
        toggleLanguageMode,
        handleSubmit,
        sendCustomPrompt,
        loadChatFromHistory,
        deleteChatFromHistory,
        startNewChat
    };
};