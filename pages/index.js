import React, { useState, useEffect } from "react";
import ImageUpload from "../components/ImageUpload";
import OCRTable from "../components/OCRTable";
import { ClipLoader } from "react-spinners"; // For the loading spinner

const App = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [jsonFilename, setJsonFilename] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Log imageUrl changes for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("imageUrl:", imageUrl);
    }
  }, [imageUrl]);

  // Handle image upload
  const handleUpload = (image) => {
    setImageUrl(image); // Set the image URL
    setJsonFilename(null); // Reset JSON filename on new upload
  };

  // Handle OCR processing
  const handleProcess = async () => {
    console.log("Image URL:", imageUrl); // Debugging
    if (!imageUrl) return;

    setIsProcessing(true); // Start loading
    try {
      console.log("Sending image to API..."); // Debugging
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse error response
        console.error("API Error:", errorData); // Debugging
        throw new Error(errorData.error || "Ошибка при обработке изображения");
      }

      const data = await response.json();
      console.log("API Response:", data); // Debugging
      setJsonFilename(data.jsonFilename); // Set the JSON filename
    } catch (error) {
      console.error("Ошибка при обработке изображения:", error);
      alert(error.message || "Ошибка при обработке изображения. Пожалуйста, попробуйте снова.");
    } finally {
      setIsProcessing(false); // Stop loading
    }
  };

  return (
    <div className="p-6">
      {/* Centered heading */}
      <h1 className="text-2xl font-bold mb-4 text-center">
        Обработчик изображений OCR
      </h1>

      {/* Image upload component */}
      <ImageUpload onUpload={handleUpload} />

      {/* Process button and loading spinner */}
      {imageUrl && (
        <div className="flex flex-col items-center mt-4">
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            aria-label={isProcessing ? "Обработка изображения" : "Обработать изображение"}
          >
            {isProcessing ? "Обработка..." : "Обработать изображение"}
          </button>

          {/* Loading spinner */}
          {isProcessing && (
            <div className="mt-4">
              <ClipLoader color="#36D7B7" size={35} />
            </div>
          )}
        </div>
      )}

      {/* OCR results table */}
      {jsonFilename && <OCRTable jsonFilename={jsonFilename} />}
    </div>
  );
};

export default App;