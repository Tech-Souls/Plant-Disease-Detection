import React from "react";
import {
    IoChatbubbleOutline,
    IoTimeOutline,
    IoTrashOutline,
    IoClose,
    IoChevronBack,
    IoChevronForward,
    IoLocationOutline
} from "react-icons/io5";

// Updated Sidebar.jsx - Remove button, show status only

const Sidebar = ({
    sidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    setSidebarOpen,
    pastChats,
    activeChatId,
    loadChatFromHistory,
    deleteChatFromHistory,
    startNewChat,
    userLocation,
    locationLoading,
    locationError,
    retryGetLocation, // Add retry function
    t,
    languageMode
}) => {
    return (
        <div className={`sidebar-mobile md:relative sidebar-transition bg-gray-50 border-r border-gray-200 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-80'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    {!sidebarCollapsed && (
                        <h6 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <IoChatbubbleOutline />
                            <strong>{t.chatHistory}</strong>
                        </h6>
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
                                className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${
                                    activeChatId === chat.id
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

            {/* Location Status Section - NO BUTTON */}
            {!sidebarCollapsed && (
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            <IoLocationOutline />
                            {t.location}
                        </h4>
                        {userLocation && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                ✓ {languageMode === "english" ? "Active" : "فعال"}
                            </span>
                        )}
                    </div>

                    {locationLoading ? (
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            {t.gettingLocation}
                        </div>
                    ) : userLocation ? (
                        <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                            <p className="mb-1 text-green-700 font-medium">
                                {languageMode === "english"
                                    ? "✓ Location enabled for local recommendations"
                                    : "✓ مقامی سفارشات کے لیے مقام فعال ہے"}
                            </p>
                            <p className="text-gray-500 text-[10px]">
                                Lat: {userLocation.latitude.toFixed(4)}, Long: {userLocation.longitude.toFixed(4)}
                            </p>
                        </div>
                    ) : locationError ? (
                        <div className="text-xs">
                            <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                                <p className="text-red-600 mb-1">{locationError}</p>
                                <p className="text-gray-600">
                                    {languageMode === "english"
                                        ? "Enable location in your browser settings for local recommendations."
                                        : "مقامی سفارشات کے لیے اپنے براؤزر میں مقام فعال کریں۔"}
                                </p>
                            </div>
                            <button
                                onClick={retryGetLocation}
                                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <IoLocationOutline />
                                {languageMode === "english" ? "Retry" : "دوبارہ کوشش کریں"}
                            </button>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p>
                                {languageMode === "english"
                                    ? "Waiting for location access..."
                                    : "مقام تک رسائی کا انتظار ہے..."}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;