import React, { useState, useEffect } from "react";
import axios from "axios";

const AIModel = () => {
  const [imageFile, setImageFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [filteredPrediction, setFilteredPrediction] = useState(null);
  const [deepseekResult, setDeepseekResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState("");
  
  // List of available plants (extracted from your prediction output)
  const plantOptions = [
    { value: "", label: "Select a plant" },
    { value: "Tomato", label: "Tomato" },
    { value: "Potato", label: "Potato" },
    { value: "Apple", label: "Apple" },
    { value: "Bell_pepper", label: "Bell Pepper" },
    { value: "Grape", label: "Grape" },
    { value: "Blueberry", label: "Blueberry" },
    { value: "Raspberry", label: "Raspberry" },
    { value: "Soyabean", label: "Soyabean" },
    { value: "Peach", label: "Peach" },
    { value: "Squash", label: "Squash" },
    { value: "Strawberry", label: "Strawberry" },
    { value: "Cherry", label: "Cherry" },
    { value: "Corn", label: "Corn" }
  ];

  // Handle file selection
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle plant selection
  const handlePlantChange = (e) => {
    const plant = e.target.value;
    setSelectedPlant(plant);
    
    // If we have predictions and a plant is selected, filter and normalize
    if (prediction && plant) {
      filterAndNormalizePredictions(prediction, plant);
    } else {
      setFilteredPrediction(null);
    }
  };

  // Filter predictions to only include selected plant and normalize confidence scores
  const filterAndNormalizePredictions = (predictions, plant) => {
    // Filter predictions for the selected plant
    const filtered = predictions.filter(p => {
      // Extract plant name from class string (first word before space)
      const className = p.class;
      const plantName = className.split(' ')[0];
      
      // Handle special case for Bell_pepper (underscore in name)
      if (plant === "Bell_pepper") {
        return plantName === "Bell_pepper";
      }
      
      return plantName === plant;
    });

    if (filtered.length === 0) {
      setFilteredPrediction(null);
      return;
    }

    // Calculate total confidence of filtered predictions
    const totalConfidence = filtered.reduce((sum, p) => sum + p.confidence, 0);
    
    // Normalize confidence scores to sum to 100%
    const normalized = filtered.map(p => ({
      ...p,
      confidence: (p.confidence / totalConfidence) * 100
    }));

    setFilteredPrediction(normalized);
  };

  // Convert image to Base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    if (!imageFile) return alert("Select an image first!");
    if (!selectedPlant) return alert("Please select a plant first!");
    
    setLoading(true);
    setFilteredPrediction(null);
    setDeepseekResult(null);

    try {
      const base64Image = await getBase64(imageFile);
      
      // 1️⃣ Send to /predict
      const predictRes = await axios.post("http://localhost:8000/predict", {
        image: base64Image,
      });
      console.log("Prediction result:", predictRes.data);
      setPrediction(predictRes.data);
      
      // Filter and normalize predictions for the selected plant
      filterAndNormalizePredictions(predictRes.data, selectedPlant);

      // 2️⃣ Send filtered prediction to /deepseek
      if (filteredPrediction) {
        const deepseekRes = await axios.post("http://localhost:8000/deepseek", {
          prompt_data: JSON.stringify(filteredPrediction),
        });
        console.log("Deepseek result:", deepseekRes.data);
        setDeepseekResult(deepseekRes.data);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something failed, check console");
    } finally {
      setLoading(false);
    }
  };

  // Update filtered predictions when selectedPlant changes
  useEffect(() => {
    if (prediction && selectedPlant) {
      filterAndNormalizePredictions(prediction, selectedPlant);
    }
  }, [selectedPlant]);

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Plant Disease Predictor</h2>

      {/* Plant Selection Dropdown */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="plant-select" style={{ marginRight: 10 }}>
          Select Plant:
        </label>
        <select
          id="plant-select"
          value={selectedPlant}
          onChange={handlePlantChange}
          style={{ padding: "5px 10px", fontSize: "16px" }}
        >
          {plantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button 
          onClick={handleSubmit} 
          disabled={loading || !selectedPlant || !imageFile} 
          style={{ marginLeft: 10 }}
        >
          {loading ? "Processing..." : "Predict"}
        </button>
      </div>

      {/* Filtered Prediction Results */}
      {filteredPrediction && filteredPrediction.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Prediction Results for {selectedPlant}:</h3>
          <ul>
            {filteredPrediction.map((p, idx) => (
              <li key={idx}>
                {p.class}: {p.confidence.toFixed(2)}%
              </li>
            ))}
          </ul>
          <p>
            <strong>Total Confidence:</strong>{" "}
            {filteredPrediction.reduce((sum, p) => sum + p.confidence, 0).toFixed(2)}%
          </p>
        </div>
      )}

      {filteredPrediction && filteredPrediction.length === 0 && (
        <div style={{ marginTop: 20, color: "orange" }}>
          <h3>No diseases found for {selectedPlant}</h3>
          <p>Try selecting a different plant or check if the image contains a {selectedPlant} leaf.</p>
        </div>
      )}

      {/* Original Prediction Results (optional - for debugging) */}
      {prediction && (
        <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <details>
            <summary style={{ cursor: "pointer", color: "#666" }}>
              Show All Predictions (Original - {prediction.length} classes)
            </summary>
            <ul style={{ fontSize: "14px", color: "#666" }}>
              {prediction.map((p, idx) => (
                <li key={idx}>
                  {p.class}: {p.confidence.toFixed(2)}%
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {deepseekResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Deepseek Interpretation:</h3>
          <pre style={{ 
            background: "#f5f5f5", 
            padding: "15px", 
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word"
          }}>
            {typeof deepseekResult === 'string' 
              ? deepseekResult 
              : JSON.stringify(deepseekResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIModel;
