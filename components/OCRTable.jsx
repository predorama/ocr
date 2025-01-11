import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";

const OCRTable = ({ jsonFilename }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("jsonFilename:", jsonFilename); // Log the jsonFilename
    if (jsonFilename) {
      fetchOCRResults(jsonFilename);
    }
  }, [jsonFilename]);

  const fetchOCRResults = async (filename) => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      console.log("Fetching OCR results for file:", filename); // Debugging

      // Fetch the JSON file directly from the public/ocr_results directory
      const response = await fetch(`/ocr_results/${filename}`); // Correct path to the JSON file
      console.log("Response status:", response.status); // Debugging

      const responseText = await response.text(); // Get the raw response text
      console.log("Response text:", responseText); // Debugging

      if (!response.ok) {
        throw new Error("Ошибка при получении данных");
      }

      const jsonData = JSON.parse(responseText); // Parse successful response
      console.log("Parsed JSON data:", jsonData); // Debugging

      if (jsonData.length === 0) {
        alert("Данные не найдены.");
        return;
      }

      const headers = Object.keys(jsonData[0]);
      setHeaders(headers);
      setData(jsonData);
    } catch (error) {
      console.error("Ошибка при получении результатов OCR:", error);
      setError(error.message || "Не удалось загрузить данные. Пожалуйста, попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellChange = (rowIndex, field, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][field] = value;
    setData(updatedData);
  };

  const saveChanges = async () => {
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: jsonFilename,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении изменений");
      }

      alert("Изменения успешно сохранены!");
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error);
      alert("Ошибка при сохранении изменений. Пожалуйста, попробуйте снова.");
    }
  };

  const resetChanges = () => {
    fetchOCRResults(jsonFilename); // Reload the original data
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ocr_results_${jsonFilename}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-8">
        <ClipLoader color="#36D7B7" size={35} />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  if (data.length === 0) {
    return <p className="text-center text-gray-600">Данные отсутствуют.</p>;
  }

  return (
    <div className="mt-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <p className="text-center text-xl text-gray-600 mt-8 mb-4">
          Таблица редактируема. Вы можете изменить текст.
        </p>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Сохранить изменения"
          >
            Сохранить изменения
          </button>
          <button
            onClick={resetChanges}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            aria-label="Сбросить изменения"
          >
            Сбросить изменения
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, index) => (
                <th key={index} className="p-2 border border-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-2 border border-gray-300"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleCellChange(rowIndex, header, e.target.textContent)
                    }
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            aria-label="Скачать JSON"
          >
            Скачать JSON
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
OCRTable.propTypes = {
  jsonFilename: PropTypes.string.isRequired, // jsonFilename is required
};

// Default props (optional)
OCRTable.defaultProps = {
  jsonFilename: "default.json", // Default filename (if needed)
};

export default OCRTable;