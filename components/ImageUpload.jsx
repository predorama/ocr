import React, { useState } from "react";
import PropTypes from "prop-types";

const ImageUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Обработка выбора файла (через выбор или перетаскивание)
  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Результат FileReader (base64):", reader.result); // Отладка
        setImage(reader.result); // Установка превью изображения
        onUpload(reader.result); // Передача строки base64 в родительский компонент
      };
      reader.readAsDataURL(file);
    } else {
      alert("Пожалуйста, загрузите корректный файл изображения.");
    }
  };

  // Обработка событий перетаскивания
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
    console.log("Перетащенный файл:", file); // Отладка
    handleFile(file);
  };

  // Обработка изменения файла через выбор (браузер)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Выбранный файл:", file); // Отладка
    handleFile(file);
  };

  return (
    <div className="p-6 border-2 border-gray-300 rounded-lg max-w-md mx-auto">
      {/* Область для перетаскивания и кнопка выбора файла */}
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
            Перетащите изображение или{" "}
            <span className="text-blue-500 hover:text-blue-600">выберите файл</span>
          </p>
        </label>
      </div>

      {/* Превью изображения под областью перетаскивания */}
      {image && (
        <div className="mt-4 p-4 border-2 border-gray-300 rounded-lg">
          <div className="flex justify-center">
            <img
              src={image}
              alt="Preview"
              className="rounded-lg shadow-lg"
              style={{ width: "400px", height: "auto" }} // Фиксированная ширина 400px
            />
          </div>
          {/* Кнопка очистки */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                setImage(null); // Очистка превью изображения
                onUpload(null); // Уведомление родительского компонента
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Очистить изображение
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Добавление проверки PropTypes
ImageUpload.propTypes = {
  onUpload: PropTypes.func.isRequired, // onUpload - обязательная функция
};

export default ImageUpload;