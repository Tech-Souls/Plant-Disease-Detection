import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const ChatSection = ({
    activeChatId,
    pastChats,
    t,
    conversation,
    chatLoading,
    chatContainerRef,
    filteredPrediction,
    customPrompt,
    setCustomPrompt,
    sendCustomPrompt,
    languageMode
}) => {
    return (
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
                    <ChatMessages
                        conversation={conversation}
                        chatLoading={chatLoading}
                        chatContainerRef={chatContainerRef}
                        t={t}
                    />

                    {/* Chat Input */}
                    <ChatInput
                        customPrompt={customPrompt}
                        setCustomPrompt={setCustomPrompt}
                        sendCustomPrompt={sendCustomPrompt}
                        filteredPrediction={filteredPrediction}
                        chatLoading={chatLoading}
                        t={t}
                        languageMode={languageMode}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatSection;