import React from "react";
import { IoClose } from "react-icons/io5";
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
        startNewChat
    } = useChatLogic();

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
                getUserLocation={getUserLocation}
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