import { plantOptions } from "../constants/constants";

export const getPlantDisplayName = (plantValue, languageMode) => {
    const plant = plantOptions.find(p => p.value === plantValue);
    if (!plant) return plantValue;
    return languageMode === "english" ? plant.english : plant.urdu;
};

export const filterAndNormalizePredictions = (predictions, plant) => {
    const selectedPlantOption = plantOptions.find(p => p.value === plant);
    if (!selectedPlantOption || !selectedPlantOption.prefixes) return [];
    
    const filtered = predictions.filter(p => {
        const plantPrefix = p.class.split('_')[0];
        return selectedPlantOption.prefixes.includes(plantPrefix);
    });
    
    if (filtered.length === 0) return [];
    
    const totalConfidence = filtered.reduce((sum, p) => sum + p.confidence, 0);
    return filtered.map(p => ({
        ...p,
        displayClass: p.class.split('_').slice(1).join(' ').replace(/_/g, ' '),
        originalClass: p.class,
        confidence: (p.confidence / totalConfidence) * 100
    }));
};

export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
    });