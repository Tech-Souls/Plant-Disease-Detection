import React, { useState } from "react";
import axios from "axios";

const AIModel = () => {
  const [imageFile, setImageFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // handle file selection
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // convert image to Base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // strip data:image/... prefix
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    if (!imageFile) return alert("Select an image first!");
    setLoading(true);

    try {
      const base64Image = await getBase64(imageFile);

      const res = await axios.post("http://localhost:8000/predict", {
        image: base64Image,
      });

      setPrediction(res.data);
    } catch (err) {
      console.error("Error sending image:", err);
      alert("Prediction failed, check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Plant Disease Predictor</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {prediction && (
        <div style={{ marginTop: 20 }}>
          <h3>Prediction Results:</h3>
          <ul>
            {prediction.map((p, idx) => (
              <li key={idx}>
                {p.class}: {p.confidence.toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIModel;
