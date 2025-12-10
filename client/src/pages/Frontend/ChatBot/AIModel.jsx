import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AIModel = () => {
  const [imageFile, setImageFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [filteredPrediction, setFilteredPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef(null);
  
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
      return [];
    }

    // Calculate total confidence of filtered predictions
    const totalConfidence = filtered.reduce((sum, p) => sum + p.confidence, 0);
    
    // Normalize confidence scores to sum to 100%
    const normalized = filtered.map(p => ({
      ...p,
      confidence: (p.confidence / totalConfidence) * 100
    }));

    setFilteredPrediction(normalized);
    return normalized;
  };

  // Convert image to Base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  // Initialize conversation with AI explanation
  const initializeConversation = (filteredPreds) => {
    const initialMessage = {
      role: "assistant",
      content: `I've analyzed the image of the ${selectedPlant} leaf. Here are the detected diseases with their confidence scores:`,
      timestamp: new Date().toISOString()
    };
    
    const diseaseList = {
      role: "assistant",
      content: filteredPreds.map(p => `${p.class}: ${p.confidence.toFixed(2)}%`).join('\n'),
      timestamp: new Date().toISOString(),
      isData: true
    };
    
    const followUp = {
      role: "assistant",
      content: "You can ask me questions about these results. For example: 'What does bacterial spot look like?' or 'How should I treat this disease?'",
      timestamp: new Date().toISOString()
    };
    
    setConversation([initialMessage, diseaseList, followUp]);
  };

  // Send custom prompt to Deepseek
  const sendCustomPrompt = async () => {
    if (!customPrompt.trim() || !filteredPrediction) return;
    
    // Add user message to conversation
    const userMessage = {
      role: "user",
      content: customPrompt,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setCustomPrompt("");
    setChatLoading(true);
    
    try {
      // Prepare the context for Deepseek
      const context = {
        plant: selectedPlant,
        predictions: filteredPrediction,
        conversation: conversation.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        currentPrompt: customPrompt
      };
      
      // Send to Deepseek API with conversation context
      const deepseekRes = await axios.post("http://localhost:8000/deepseek", {
        prompt_data: JSON.stringify(context),
      });
      
      // Add assistant response to conversation
      const assistantMessage = {
        role: "assistant",
        content: typeof deepseekRes.data === 'string' 
          ? deepseekRes.data 
          : JSON.stringify(deepseekRes.data, null, 2),
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending custom prompt:", err);
      
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) return alert("Select an image first!");
    if (!selectedPlant) return alert("Please select a plant first!");
    
    setLoading(true);
    setFilteredPrediction(null);
    setConversation([]);

    try {
      const base64Image = await getBase64(imageFile);
      
      // 1️⃣ Send to /predict
      const predictRes = await axios.post("http://localhost:8000/predict", {
        image: base64Image,
      });
      console.log("Prediction result:", predictRes.data);
      setPrediction(predictRes.data);
      
      // Filter and normalize predictions for the selected plant
      const filteredPreds = filterAndNormalizePredictions(predictRes.data, selectedPlant);
      
      // Initialize conversation with results
      if (filteredPreds && filteredPreds.length > 0) {
        initializeConversation(filteredPreds);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something failed, check console");
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Update filtered predictions when selectedPlant changes
  useEffect(() => {
    if (prediction && selectedPlant) {
      filterAndNormalizePredictions(prediction, selectedPlant);
    }
  }, [selectedPlant]);

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
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
          style={{ padding: "5px 10px", fontSize: "16px", marginRight: 20 }}
        >
          {plantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button 
          onClick={handleSubmit} 
          disabled={loading || !selectedPlant || !imageFile} 
          style={{ marginLeft: 10 }}
        >
          {loading ? "Processing..." : "Analyze Image"}
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        {/* Left column: Results */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {/* Filtered Prediction Results */}
          {filteredPrediction && filteredPrediction.length > 0 && (
            <div style={{ marginTop: 20, background: "#f8f9fa", padding: 15, borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Prediction Results for {selectedPlant}:</h3>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {filteredPrediction.map((p, idx) => (
                  <li key={idx} style={{ padding: "5px 0", borderBottom: "1px solid #eee" }}>
                    <strong>{p.class}:</strong> {p.confidence.toFixed(2)}%
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
            <div style={{ marginTop: 20, padding: 15, background: "#fff3cd", borderRadius: 8 }}>
              <h3 style={{ marginTop: 0, color: "#856404" }}>No diseases found for {selectedPlant}</h3>
              <p style={{ color: "#856404" }}>
                Try selecting a different plant or check if the image contains a {selectedPlant} leaf.
              </p>
            </div>
          )}

          {/* Original Prediction Results (optional - for debugging) */}
          {prediction && (
            <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 20 }}>
              <details>
                <summary style={{ cursor: "pointer", color: "#666" }}>
                  Show All Predictions (Original - {prediction.length} classes)
                </summary>
                <ul style={{ fontSize: "14px", color: "#666", maxHeight: 200, overflowY: "auto" }}>
                  {prediction.map((p, idx) => (
                    <li key={idx}>
                      {p.class}: {p.confidence.toFixed(2)}%
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>

        {/* Right column: Chat */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{
            background: "#f8f9fa",
            borderRadius: 8,
            padding: 15,
            height: 500,
            display: "flex",
            flexDirection: "column"
          }}>
            <h3 style={{ marginTop: 0 }}>Ask About Results</h3>
            
            {/* Chat messages */}
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: 15,
                padding: 10,
                background: "white",
                borderRadius: 5
              }}
            >
              {conversation.length === 0 ? (
                <div style={{ color: "#666", textAlign: "center", marginTop: 50 }}>
                  Analyze an image first, then ask questions about the results.
                </div>
              ) : (
                conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 10,
                      padding: 8,
                      borderRadius: 5,
                      background: msg.role === "user" ? "#e3f2fd" : 
                                msg.isData ? "#f1f8e9" : "#f5f5f5",
                      borderLeft: `4px solid ${
                        msg.role === "user" ? "#2196f3" : 
                        msg.isData ? "#4caf50" : "#9e9e9e"
                      }`,
                      whiteSpace: "pre-wrap",
                      fontSize: msg.isData ? "12px" : "14px",
                      fontFamily: msg.isData ? "monospace" : "inherit"
                    }}
                  >
                    <strong>{msg.role === "user" ? "You" : "AI Assistant"}:</strong><br />
                    {msg.content}
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ padding: 8, color: "#666" }}>
                  AI is thinking...
                </div>
              )}
            </div>
            
            {/* Chat input */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendCustomPrompt()}
                placeholder="Ask about the results..."
                disabled={!filteredPrediction || chatLoading}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: 4
                }}
              />
              <button
                onClick={sendCustomPrompt}
                disabled={!customPrompt.trim() || !filteredPrediction || chatLoading}
                style={{
                  padding: "10px 20px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </div>
            
            {/* Suggested prompts */}
            {filteredPrediction && filteredPrediction.length > 0 && (
              <div style={{ marginTop: 10, fontSize: "12px", color: "#666" }}>
                <div>Try asking:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                  {[
                    "How do I treat this?",
                    "What are the symptoms?",
                    "Is this contagious to other plants?",
                    "What causes this disease?"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomPrompt(prompt)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        background: "#e8f5e8",
                        border: "1px solid #c8e6c9",
                        borderRadius: 3,
                        cursor: "pointer"
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModel;
