import React from "react";
import { IoImageOutline } from "react-icons/io5";

const ImageUpload = ({
    imageFile,
    imageFileName,
    imageFilePreview,
    imageFileRef,
    handleFileChange,
    setImageFile,
    setImageFileName,
    setImageFilePreview,
    t,
    languageMode
}) => {
    const handleClearImage = (e) => {
        e.stopPropagation();
        setImageFile(null);
        setImageFileName(null);
        setImageFilePreview(null);
    };

    const urduFontStyle = languageMode === "urdu" ? {
        fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif",
        lineHeight: "2.2"
    } : {};

    return (
        <div>
            <label className="block text-sm font-medium mb-2" style={urduFontStyle}>{t.selectImage}:</label>
            <div
                role="button"
                className="relative flex justify-center p-4 text-neutral-600 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer transition-all hover:border-green-500 hover:text-green-500 min-h-[120px]"
                onClick={() => imageFileRef.current.click()}
            >
                <input
                    ref={imageFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                {imageFilePreview ? (
                    <img
                        src={imageFilePreview}
                        alt="preview"
                        className="w-full h-full object-contain rounded-lg"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <IoImageOutline size={40} className="mb-2 text-gray-400" />
                        <p className="text-sm text-gray-700" style={urduFontStyle}>{t.selectImage}</p>
                    </div>
                )}
                {imageFile && (
                    <button
                        className="absolute top-2 right-2 text-white text-xs bg-red-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-600 transition-colors"
                        onClick={handleClearImage}
                    >
                        ×
                    </button>
                )}
            </div>
            {imageFileName && (
                <p className="mt-1 text-xs text-gray-600" style={urduFontStyle}>
                    {t.selected}: {imageFileName}
                </p>
            )}
        </div>
    );
};

export default ImageUpload;