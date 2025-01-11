import React, { useState } from "react";
import PropTypes from "prop-types";

const ImagePreview = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="mt-4">
      {isLoading && <p>Загрузка изображения...</p>}
      {hasError ? (
        <p className="text-red-600">Не удалось загрузить изображение.</p>
      ) : (
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full h-auto rounded-lg shadow-lg"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          aria-label="Предпросмотр изображения"
        />
      )}
    </div>
  );
};

// Add PropTypes validation
ImagePreview.propTypes = {
  imageUrl: PropTypes.string.isRequired, // imageUrl is a required string
};

export default ImagePreview;