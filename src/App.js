import React, { useState } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [cropRecommendation, setCropRecommendation] = useState(null);
  const [idealHumidity, setIdealHumidity] = useState(null);
  const [idealRainfall, setIdealRainfall] = useState(null);
  const [cropHealth, setCropHealth] = useState(null);
  const [pestDetectionMessage, setPestDetectionMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = "http://172.19.90.149:5000"; // Base URL for the API

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch weather data
      const weatherResponse = await axios.get(`${apiUrl}/get-weather?location=${location}`);
      setWeather(weatherResponse.data);

      // Fetch crop recommendation data
      const cropResponse = await axios.get(`${apiUrl}/get-crop-recommendation?location=${location}`);
      setCropRecommendation(cropResponse.data.recommended_crop);
      setIdealHumidity(cropResponse.data.ideal_humidity); // Assuming backend returns ideal humidity
      setIdealRainfall(cropResponse.data.ideal_rainfall); // Assuming backend returns ideal rainfall
      setError(null);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      setWeather(null);
      setCropRecommendation(null);
      setIdealHumidity(null);
      setIdealRainfall(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropHealth = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/crop-health`);
      setCropHealth(response.data.message);
      setError(null);
    } catch (error) {
      setCropHealth("Failed to fetch crop health data. Please try again.");
    }
  };

  const fetchPestDetection = async (image) => {
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(`${apiUrl}/api/pest-disease-detection`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.status === "success") {
        setPestDetectionMessage(`Pest Status: ${response.data.pest_status}`);
      } else {
        setPestDetectionMessage("Error in pest detection.");
      }
      setError(null);
    } catch (error) {
      setPestDetectionMessage("Error fetching pest detection data.");
    }
  };

  const handleImageUpload = (e) => {
    const image = e.target.files[0];
    if (image) {
      fetchPestDetection(image);
    }
  };

  return (
    <div>
      <h1>Crop and Soil Management System</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
        <button type="submit">Get Weather and Recommendation</button>
      </form>

      {loading && <p>Loading...</p>}
      
      {weather && (
        <div>
          <h3>Weather for {weather.location}</h3>
          <p>Temperature: {weather.temperature}</p>
          <p>Description: {weather.description}</p>
        </div>
      )}

      {cropRecommendation && (
        <div>
          <h3>Recommended Crop: {cropRecommendation}</h3>
          {idealHumidity && <p>Ideal Humidity: {idealHumidity}%</p>}
          {idealRainfall && <p>Ideal Rainfall: {idealRainfall} mm/month</p>}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Crop Health Monitoring</h2>
      <button onClick={fetchCropHealth}>Check Crop Health</button>
      {cropHealth && <p>{cropHealth}</p>}

      <h2>Pest Detection</h2>
      <input type="file" onChange={handleImageUpload} />
      {pestDetectionMessage && <p>{pestDetectionMessage}</p>}

      {/* NDVI Analysis Section */}
      <h2>NDVI Analysis</h2>
      <button onClick={() => alert("Feature coming soon!")}>Analyze Crop Health</button>
    </div>
  );
}

export default App;
