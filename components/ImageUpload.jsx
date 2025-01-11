import React, { useState } from "react";
import PropTypes from "prop-types";

const ImageUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection (browse or drag-and-drop)
  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("FileReader result (base64):", reader.result); // Debugging
        setImage(reader.result); // Set the image preview
        onUpload(reader.result); // Pass the base64 string to the parent component
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  // Handle drag-and-drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    console.log("Dropped file:", file); // Debugging
    handleFile(file);
  };

  // Handle file input change (browse)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file); // Debugging
    handleFile(file);
  };

  return (
    <div className="p-6 border-2 border-gray-300 rounded-lg max-w-md mx-auto">
      {/* Drag-and-drop area and browse button */}
      <div
        className={`p-6 border-2 border-dashed ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        } rounded-lg text-center transition-all duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-gray-600">
            Drag and drop an image or{" "}
            <span className="text-blue-500 hover:text-blue-600">browse</span>
          </p>
        </label>
      </div>

      {/* Image preview below the drag-and-drop area */}
      {image && (
        <div className="mt-4 p-4 border-2 border-gray-300 rounded-lg">
          <div className="flex justify-center">
            <img
              src={image}
              alt="Preview"
              className="rounded-lg shadow-lg"
              style={{ width: "400px", height: "auto" }} // Fixed width of 400px
            />
          </div>
          {/* Clear button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                setImage(null); // Clear the image preview
                onUpload(null); // Notify the parent component
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add PropTypes validation
ImageUpload.propTypes = {
  onUpload: PropTypes.func.isRequired, // onUpload is a required function
};

export default ImageUpload;