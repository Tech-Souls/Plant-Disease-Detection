import React from "react";
import { IoSend } from "react-icons/io5";

const ChatInput = ({
    customPrompt,
    setCustomPrompt,
    sendCustomPrompt,
    filteredPrediction,
    chatLoading,
    t,
    languageMode
}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendCustomPrompt();
        }
    };

    return (
        <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    disabled={!filteredPrediction || chatLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed mixed-text"
                    dir="auto"
                />
                <button
                    onClick={sendCustomPrompt}
                    disabled={!customPrompt.trim() || !filteredPrediction || chatLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                    <IoSend className="mr-1" size={16} />
                    <span className="hidden sm:inline">
                        {languageMode === "english" ? "Send" : "بھیجیں"}
                    </span>
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
                                disabled={chatLoading}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInput;