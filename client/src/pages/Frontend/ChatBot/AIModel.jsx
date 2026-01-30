import React, { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ControlsSection from "./components/ControlsSection";
import ChatSection from "./components/ChatSection";
import { useChatLogic } from "./hooks/useChatLogic";
import { plantOptions } from "./constants/constants";

const AIModel = () => {
    const {
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
        retryGetLocation
    } = useChatLogic();

    // DEBUGGING: Log environment variables
    useEffect(() => {
        console.log('=== ENVIRONMENT VARIABLES CHECK ===');
        console.log('VITE_PYTHON_HOST:', import.meta.env.VITE_PYTHON_HOST);
        console.log('VITE_HOST:', import.meta.env.VITE_HOST);
        console.log('VITE_APIFY_API_TOKEN:', import.meta.env.VITE_APIFY_API_TOKEN ? 'SET' : 'NOT SET');
        console.log('===================================');
    }, []);

    // Apply Nastaleeq font to elements containing Urdu text
    useEffect(() => {
        const applyUrduFont = () => {
            const allElements = document.querySelectorAll('*');
            const urduRegex = /[\u0600-\u06FF]/; // Arabic/Urdu Unicode range
            
            allElements.forEach(element => {
                if (element.textContent && urduRegex.test(element.textContent)) {
                    element.style.fontFamily = "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif";
                    element.style.lineHeight = "2.2";
                }
            });
        };

        // Apply on mount and whenever language changes
        applyUrduFont();
        
        // Re-apply when DOM changes
        const observer = new MutationObserver(applyUrduFont);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            characterData: true 
        });

        return () => observer.disconnect();
    }, [languageMode, conversation, pastChats]);

    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Noto+Sans:wght@400;500;700&display=swap');
                
                .mixed-text {
                    font-family: 'Noto Nastaliq Urdu', 'Noto Sans', 'Segoe UI', Tahoma, Geneva, sans-serif;
                    line-height: 2.2;
                    unicode-bidi: plaintext;
                    text-align: start;
                }
                
                /* Apply Nastaleeq to any element containing Urdu characters */
                *[lang="ur"],
                *[dir="rtl"] {
                    font-family: 'Noto Nastaliq Urdu', 'Noto Sans', sans-serif !important;
                    line-height: 2.2 !important;
                }
                
                /* Ensure all text elements can use Nastaleeq */
                button, input, select, textarea, label, p, span, div, h1, h2, h3, h4, h5, h6, li, a {
                    font-variant-ligatures: normal;
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

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                setSidebarOpen={setSidebarOpen}
                pastChats={pastChats}
                activeChatId={activeChatId}
                loadChatFromHistory={loadChatFromHistory}
                deleteChatFromHistory={deleteChatFromHistory}
                startNewChat={startNewChat}
                userLocation={userLocation}
                locationLoading={locationLoading}
                locationError={locationError}
                retryGetLocation={retryGetLocation}
                t={t}
                languageMode={languageMode}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Controls Section */}
                <ControlsSection
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    toggleLanguageMode={toggleLanguageMode}
                    languageMode={languageMode}
                    t={t}
                    imageFile={imageFile}
                    imageFileName={imageFileName}
                    imageFilePreview={imageFilePreview}
                    imageFileRef={imageFileRef}
                    handleFileChange={handleFileChange}
                    setImageFile={setImageFile}
                    setImageFileName={setImageFileName}
                    setImageFilePreview={setImageFilePreview}
                    selectedPlant={selectedPlant}
                    handlePlantChange={handlePlantChange}
                    plantOptions={plantOptions}
                    handleSubmit={handleSubmit}
                    loading={loading}
                />

                {/* Chat Section */}
                <ChatSection
                    activeChatId={activeChatId}
                    pastChats={pastChats}
                    t={t}
                    conversation={conversation}
                    chatLoading={chatLoading}
                    chatContainerRef={chatContainerRef}
                    filteredPrediction={filteredPrediction}
                    customPrompt={customPrompt}
                    setCustomPrompt={setCustomPrompt}
                    sendCustomPrompt={sendCustomPrompt}
                    languageMode={languageMode}
                />
            </div>
        </div>
    );
};

export default AIModel;
