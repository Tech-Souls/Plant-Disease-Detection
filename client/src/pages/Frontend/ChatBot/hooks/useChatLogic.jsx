import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getBase64, filterAndNormalizePredictions, getPlantDisplayName } from "../utils/utils";
import { textContent } from "../constants/constants";

export const useChatLogic = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageFilePreview, setImageFilePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null); // Store base64 for database
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
    const [apifyResults, setApifyResults] = useState(null);
    const [apifyLoading, setApifyLoading] = useState(false);
    const [apifyUsedInChat, setApifyUsedInChat] = useState(false);

    const imageFileRef = useRef(null);
    const chatContainerRef = useRef(null);

    const t = textContent[languageMode];

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('pddtjwt');
                const storedUserId = localStorage.getItem('userId');

                console.log('Auth Check:', {
                    hasToken: !!token,
                    hasUserId: !!storedUserId,
                    userId: storedUserId
                });

                if (token && storedUserId) {
                    setIsLoggedIn(true);
                    setUserId(storedUserId);
                    console.log('User is logged in, loading chats from database...');
                    await loadChatsFromDatabase(storedUserId);
                } else {
                    setIsLoggedIn(false);
                    console.log('User not logged in, using localStorage for chats');
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

    // Save chats to localStorage only when NOT logged in
    useEffect(() => {
        if (!isLoggedIn && pastChats.length > 0) {
            console.log('Saving to localStorage (user not logged in)');
            localStorage.setItem('plantChatHistory', JSON.stringify(pastChats));
        }
    }, [pastChats, isLoggedIn]);
    useEffect(() => {
        const requestLocation = () => {
            if (!navigator.geolocation) {
                setLocationError(
                    languageMode === "english"
                        ? "Geolocation is not supported by your browser"
                        : "آپ کا براؤزر جغرافیائی مقام کو سپورٹ نہیں کرتا"
                );
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
                    console.log('Location obtained:', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    let errorMsg;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = languageMode === "english"
                                ? "Location access denied. Please enable location in your browser settings."
                                : "مقام تک رسائی مسترد۔ براہ کرم اپنے براؤزر کی ترتیبات میں مقام کو فعال کریں۔";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = languageMode === "english"
                                ? "Location information unavailable."
                                : "مقام کی معلومات دستیاب نہیں۔";
                            break;
                        case error.TIMEOUT:
                            errorMsg = languageMode === "english"
                                ? "Location request timed out."
                                : "مقام کی درخواست ٹائم آؤٹ ہو گئی۔";
                            break;
                        default:
                            errorMsg = languageMode === "english"
                                ? "An unknown error occurred."
                                : "ایک نامعلوم خرابی پیش آئی۔";
                    }
                    setLocationError(errorMsg);
                    setLocationLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // Cache for 5 minutes
                }
            );
        };

        requestLocation();

        const watchId = navigator.geolocation?.watchPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            null,
            {
                enableHighAccuracy: false,
                maximumAge: 600000 // Update every 10 minutes max
            }
        );

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [languageMode]); // Re-run if language changes for error messages

    const retryGetLocation = () => {
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

    const loadChatsFromDatabase = async (userId) => {
        try {
            console.log('Loading chats from database for user:', userId);
            const response = await axios.get(`${import.meta.env.VITE_PYTHON_HOST}/chats/${userId}`);

            if (response.data && Array.isArray(response.data)) {
                console.log(`Loaded ${response.data.length} chats from database`);
                setPastChats(response.data);

                if (response.data.length > 0) {
                    const latestChat = response.data[0];
                    setActiveChatId(latestChat.id);
                    setConversation(latestChat.conversation);
                    setFilteredPrediction(latestChat.filteredPrediction);
                    setSelectedPlant(latestChat.plant);
                    // Set both preview and base64 from database
                    if (latestChat.imageData) {
                        setImageFilePreview(`data:image/jpeg;base64,${latestChat.imageData}`);
                        setImageBase64(latestChat.imageData);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading chats from database:", error);
            console.log('Falling back to localStorage');
            loadChatsFromLocalStorage();
        }
    };

    const loadChatsFromLocalStorage = () => {
        const savedChats = localStorage.getItem('plantChatHistory');
        if (savedChats) {
            try {
                const parsedChats = JSON.parse(savedChats);
                console.log(`Loaded ${parsedChats.length} chats from localStorage`);
                setPastChats(parsedChats);

                if (parsedChats.length > 0) {
                    setActiveChatId(parsedChats[0].id);
                    setConversation(parsedChats[0].conversation);
                    setFilteredPrediction(parsedChats[0].filteredPrediction);
                    setSelectedPlant(parsedChats[0].plant);
                    if (parsedChats[0].imageData) {
                        setImageFilePreview(`data:image/jpeg;base64,${parsedChats[0].imageData}`);
                        setImageBase64(parsedChats[0].imageData);
                    }
                }
            } catch (err) {
                console.error("Error loading chat history from localStorage:", err);
            }
        }
    };

    const saveChatToDatabase = async (chatData) => {
        try {
            console.log('Saving chat to database for user:', userId);
            const response = await axios.post(`${import.meta.env.VITE_PYTHON_HOST}/chats`, {
                userId: userId,
                ...chatData
            });
            console.log('Chat saved to database successfully');
            return response.data;
        } catch (error) {
            console.error("Error saving chat to database:", error);
            throw error;
        }
    };

    const updateChatInDatabase = async (chatId, conversationData) => {
        try {
            console.log('Updating chat in database:', chatId);
            await axios.put(`${import.meta.env.VITE_PYTHON_HOST}/chats/${chatId}`, {
                conversation: conversationData
            });
            console.log('Chat updated in database successfully');
        } catch (error) {
            console.error("Error updating chat in database:", error);
            throw error;
        }
    };

    const deleteChatFromDatabase = async (chatId) => {
        try {
            console.log('Deleting chat from database:', chatId);
            await axios.delete(`${import.meta.env.VITE_PYTHON_HOST}/chats/${chatId}`);
            console.log('Chat deleted from database successfully');
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

    const fetchApifyResults = async (latitude, longitude, plant) => {
        try {
            setApifyLoading(true);
            console.log('Fetching Apify results for location:', { latitude, longitude });

            // Create targeted search query for pesticides and agricultural supplies
            const searchQuery = languageMode === "english"
                ? "pesticide shop agricultural supplies fungicide dealer plant medicine pharmacy"
                : "کیڑے کش دکان زراعی سامان فنگسائیڈ پودوں کی دوا فارمیسی";

            // Call Apify actor
            const apifyToken = import.meta.env.VITE_APIFY_API_TOKEN;
            const apifyActorId = "compass~crawler-google-places";

            const actorRunUrl = `https://api.apify.com/v2/acts/${apifyActorId}/runs`;
            const inputData = {
                searchString: searchQuery,
                maxResults: 5, 
                lat: latitude,
                lng: longitude
            };

            const response = await axios.post(actorRunUrl, inputData, {
                params: { token: apifyToken },
                headers: { "Content-Type": "application/json" }
            });

            console.log('Apify API response status:', response.status);
            console.log('Apify API response:', response.data);

            if (response.status !== 201 && response.status !== 200) {
                throw new Error(`Apify API error: ${response.status}`);
            }

            const runData = response.data.data;
            const runId = runData.id;
            const datasetId = runData.defaultDatasetId;

            console.log('Apify run started:', { runId, datasetId });

            // Poll for results
            let status = runData.status;
            let attempts = 0;
            const maxAttempts = 60; // 5 minutes max with 5 second intervals

            while (status !== "SUCCEEDED" && status !== "FAILED" && status !== "ABORTED" && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                attempts++;

                const statusResponse = await axios.get(
                    `https://api.apify.com/v2/actor-runs/${runId}`,
                    { params: { token: apifyToken } }
                );
                status = statusResponse.data.data.status;
                console.log(`Apify status check ${attempts}: ${status}`);
            }

            if (status === "SUCCEEDED") {
                // Fetch results from dataset
                const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`;
                const resultsResponse = await axios.get(datasetUrl, {
                    params: { token: apifyToken }
                });

                const places = resultsResponse.data.map(place => ({
                    title: place.title,
                    website: place.website,
                    phone: place.phone,
                    address: place.address,
                    type: place.type || "Business"
                }));

                console.log(`Apify returned ${places.length} places:`, places);
                setApifyResults(places);
                setApifyUsedInChat(true);
                console.log('State updated - apifyResults set to:', places);
                return places;
            } else {
                console.warn('Apify run did not succeed:', status);
                setApifyResults([]);
                setApifyUsedInChat(true);
                return [];
            }
        } catch (error) {
            console.error("Error fetching Apify results:", error);
            setApifyResults([]);
            setApifyUsedInChat(true);
            return [];
        } finally {
            setApifyLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImageFileName(file.name);
        setImageFilePreview(URL.createObjectURL(file));

        // Convert to base64 for storage
        try {
            const base64 = await getBase64(file);
            setImageBase64(base64);
        } catch (error) {
            console.error("Error converting image to base64:", error);
        }
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
                nearbyPlaces: apifyResults || [],
                isInitialAnalysis: true
            };
            
            console.log('Sending to DeepSeek with context:', context);
            console.log('nearbyPlaces being sent:', apifyResults);
            
            const deepseekRes = await axios.post(`${import.meta.env.VITE_PYTHON_HOST}/deepseek`, {
                prompt_data: JSON.stringify(context),
            });

            console.log('DeepSeek response:', deepseekRes.data);

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

    const saveChatToHistory = async (conversationData, predictions, plant, imageData) => {
        const newChat = {
            id: Date.now().toString(),
            title: `${getPlantDisplayName(plant, languageMode)} - ${new Date().toLocaleDateString()}`,
            plant: plant,
            plantDisplayName: getPlantDisplayName(plant, languageMode),
            conversation: conversationData,
            filteredPrediction: predictions,
            imageData: imageData, // Store full base64 image
            location: userLocation,
            timestamp: new Date().toISOString()
        };

        // Save to database if logged in, otherwise save to localStorage
        if (isLoggedIn && userId) {
            try {
                console.log('User is logged in, saving to database...');
                const savedChat = await saveChatToDatabase(newChat);
                setPastChats(prev => [savedChat, ...prev]);
                setActiveChatId(savedChat.id);
                return savedChat.id;
            } catch (error) {
                console.error('Failed to save to database, falling back to localStorage');
                setPastChats(prev => [newChat, ...prev]);
                setActiveChatId(newChat.id);
                return newChat.id;
            }
        } else {
            console.log('User not logged in, saving to localStorage');
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
            // Load image from stored base64
            if (chat.imageData) {
                setImageFilePreview(`data:image/jpeg;base64,${chat.imageData}`);
                setImageBase64(chat.imageData);
            }
            setActiveChatId(chatId);
            setSidebarOpen(false);
        }
    };

    const deleteChatFromHistory = async (chatId, e) => {
        e.stopPropagation();

        // Delete from database if logged in
        if (isLoggedIn && userId) {
            try {
                await deleteChatFromDatabase(chatId);
                console.log('Chat deleted from database');
            } catch (error) {
                console.error("Failed to delete from database:", error);
            }
        }

        // Remove from local state
        const updatedChats = pastChats.filter(chat => chat.id !== chatId);
        setPastChats(updatedChats);

        // If deleted chat was active, load another or clear
        if (activeChatId === chatId) {
            if (updatedChats.length > 0) {
                loadChatFromHistory(updatedChats[0].id);
            } else {
                setConversation([]);
                setFilteredPrediction(null);
                setSelectedPlant("");
                setImageFilePreview(null);
                setImageBase64(null);
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
        setImageBase64(null);
        setActiveChatId(null);
        setApifyResults(null);
        setApifyUsedInChat(false);
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
            const base64Image = imageBase64 || await getBase64(imageFile);
            const plantDisplayName = getPlantDisplayName(selectedPlant, languageMode);

            const loadingMessage = {
                role: "assistant",
                content: t.analyzing(plantDisplayName),
                timestamp: new Date().toISOString(),
                isMarkdown: false
            };
            setConversation([loadingMessage]);

            // Reset Apify state for new chat
            setApifyUsedInChat(false);
            setApifyResults(null);

            // Fetch Apify results if location is available and not yet used
            if (userLocation && !apifyUsedInChat) {
                console.log('Starting Apify fetch for location-based places...');
                const apifyData = await fetchApifyResults(userLocation.latitude, userLocation.longitude, selectedPlant);
                console.log('Apify data fetched in handleSubmit:', apifyData);
            } else {
                console.log('Apify not called:', { hasLocation: !!userLocation, apifyUsedInChat });
            }

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
                await saveChatToHistory([analysisMessage], filteredPreds, selectedPlant, base64Image);
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
                await saveChatToHistory([noDiseasesMessage], [], selectedPlant, base64Image);
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
                nearbyPlaces: apifyResults || [],
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

            // Update in database if logged in
            if (activeChatId) {
                if (isLoggedIn && userId) {
                    try {
                        console.log('Updating conversation in database...');
                        await updateChatInDatabase(activeChatId, finalConversation);
                    } catch (error) {
                        console.error("Failed to update chat in database:", error);
                    }
                }

                // Update local state
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
        startNewChat,
        apifyResults,
        apifyLoading,
        fetchApifyResults
    };
};