import React from "react";

const PlantSelector = ({
    selectedPlant,
    handlePlantChange,
    plantOptions,
    languageMode,
    t
}) => {
    return (
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
    );
};

export default PlantSelector;