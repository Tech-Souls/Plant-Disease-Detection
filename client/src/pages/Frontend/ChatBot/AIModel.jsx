import React, { useState, useEffect, useRef } from "react";
import { IoSend, IoImageOutline } from "react-icons/io5";
import axios from "axios";

const AIModel = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);
    const [imageFilePreview, setImageFilePreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [filteredPrediction, setFilteredPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [conversation, setConversation] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const imageFileRef = useRef(null);
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
        const file = e.target.files[0]
        setImageFile(file);
        setImageFileName(file.name);
        setImageFilePreview(URL.createObjectURL(file));
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
        <div className="flex flex-col lg:flex-row w-full min-h-screen">
            <div className="flex-1 p-4 sm:p-6 xl:py-12 xl:px-8 h-screen overflow-y-auto">
                <h4 className="text-center leading-none">Hi, Welcome To</h4>
                <h3 className="text-center">AI Plant Disease Predictor</h3>

                {/* File Upload */}
                <div role="button" className="relative flex justify-center mt-6 p-2 text-neutral-600 border-2 border-dashed border-neutral-300 rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:border-(--secondary) hover:text-(--secondary)"
                    onClick={() => imageFileRef.current.click()}
                >
                    <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                    {imageFilePreview ?
                        <img src={imageFilePreview} alt="preview" className="w-fit max-h-48" />
                        :
                        <div className="flex flex-col items-center py-8">
                            <IoImageOutline size={40} className="mb-2" />
                            <p className="text-sm">Select an image</p>
                            <p className="text-sm">(JPEG, PNG, WEBP)</p>
                        </div>
                    }

                    {imageFile &&
                        <button className="absolute top-2 right-3 text-white text-xs font-bold bg-red-500 w-5 h-5 flex justify-center items-center rounded-full hover:opacity-70"
                            onClick={e => {
                                e.stopPropagation()
                                setImageFile(null)
                                setImageFileName(null)
                                setImageFilePreview(null)
                            }}
                        >
                            x
                        </button>
                    }
                </div>

                {imageFileName && <p className="mt-1">Selected: {imageFileName}</p>}

                {/* Plant Selection Dropdown */}
                <div className="mt-4">
                    <label htmlFor="plant-select" className="text-sm font-semibold">Select Plant:</label>

                    <div className="flex justify-between items-center gap-3 mt-2">
                        <select
                            id="plant-select"
                            value={selectedPlant}
                            className="flex-1 p-2.5 border border-neutral-300 rounded-lg outline-none transition-all duration-300 ease-out hover:border-(--secondary) focus:border-(--secondary) hover:outline-(--secondary)/70"
                            onChange={handlePlantChange}
                        >
                            {plantOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <button className="px-6 py-2.5 text-sm bg-(--primary) text-white rounded-lg transition-all duration-300 ease-out hover:opacity-70 disabled:opacity-70 disabled:cursor-not-allowed!"
                            disabled={loading || !selectedPlant || !imageFile}
                            onClick={handleSubmit}
                        >
                            {loading ? "Processing..." : "Start Analyzing"}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div>
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
                        <div className="mt-8 pt-4 border-t border-neutral-300">
                            <details>
                                <summary className="text-neutral-600 font-bold cursor-pointer">
                                    Show All Predictions (Original - {prediction.length} predictions)
                                </summary>
                                <ul className="space-y-2 text-sm text-neutral-800 mt-3 ml-8 list-decimal">
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
            </div>

            {/* Chat */}
            <div className="w-full lg:max-w-xl">
                <div className="flex flex-col h-full min-h-60 p-6 bg-(--x-light) rounded-tl-3xl rounded-bl-3xl shadow-lg">
                    <h5 className="text-(--secondary)">Ask About Results</h5>

                    {/* Chat messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 p-3 bg-white my-6 rounded-xl overflow-y-auto shadow"
                    >
                        {conversation.length === 0 ? (
                            <div className="flex items-center max-w-xs mx-auto text-center text-neutral-500 h-full">
                                <p>Analyze an image first, then ask questions about the results.</p>
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
                                        borderLeft: `4px solid ${msg.role === "user" ? "#2196f3" :
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
                    <div className="flex gap-2.5">
                        <input
                            type="text"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendCustomPrompt()}
                            placeholder="Ask about the results..."
                            disabled={!filteredPrediction || chatLoading}
                            className="flex-1 px-3.5! py-2.5! bg-white border border-neutral-300 rounded-full! shadow disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={sendCustomPrompt}
                            disabled={!customPrompt.trim() || !filteredPrediction || chatLoading}
                            className="flex justify-center items-center w-11 h-11 bg-(--primary) text-white rounded-full transition-all duration-300 ease-out hover:opacity-70 disabled:opacity-70 disabled:cursor-not-allowed!"
                        >
                            <IoSend className="text-white" />
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
    );
};

export default AIModel;
