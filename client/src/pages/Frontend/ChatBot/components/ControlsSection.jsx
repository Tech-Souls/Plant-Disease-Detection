import React from "react";
import { IoMenu, IoLanguage, IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ImageUpload from "./ImageUpload";
import PlantSelector from "./PlantSelector";

const ControlsSection = ({
    sidebarOpen,
    setSidebarOpen,
    toggleLanguageMode,
    languageMode,
    t,
    imageFile,
    imageFileName,
    imageFilePreview,
    imageFileRef,
    handleFileChange,
    setImageFile,
    setImageFileName,
    setImageFilePreview,
    selectedPlant,
    handlePlantChange,
    plantOptions,
    handleSubmit,
    loading
}) => {
    const navigate = useNavigate();
    
    return (
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            title={languageMode === "english" ? "Back to Home" : "گھر واپس جائیں"}
                        >
                            <IoArrowBack className="text-lg" />
                            <span className="hidden sm:inline font-medium">
                                {languageMode === "english" ? "Home" : "گھر"}
                            </span>
                        </button>
                        <button
                            onClick={toggleLanguageMode}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <IoLanguage className="text-lg" />
                            <span className="font-small">
                                {languageMode === "english" ? "اردو" : "English"}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageUpload
                        imageFile={imageFile}
                        imageFileName={imageFileName}
                        imageFilePreview={imageFilePreview}
                        imageFileRef={imageFileRef}
                        handleFileChange={handleFileChange}
                        setImageFile={setImageFile}
                        setImageFileName={setImageFileName}
                        setImageFilePreview={setImageFilePreview}
                        t={t}
                    />

                    <PlantSelector
                        selectedPlant={selectedPlant}
                        handlePlantChange={handlePlantChange}
                        plantOptions={plantOptions}
                        languageMode={languageMode}
                        t={t}
                    />

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
    );
};

export default ControlsSection;