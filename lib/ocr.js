require('dotenv').config();
const { ocr } = require('llama-ocr');
const fs = require('fs').promises; // Use promises for async file operations
const path = require('path');

// Helper function to parse Markdown table
function parseMarkdownTable(markdown) {
    const lines = markdown.split('\n'); // Split text into lines
    const data = []; // Store table data
    let headers = []; // Store table headers

    let isTable = false; // Flag to detect the start of the table

    lines.forEach((line) => {
        // Skip lines that are not part of the table and separator lines (e.g., "--- | --- | ---")
        if (!isTable) {
            if (line.match(/\|/)) {
                isTable = true; // Start processing the table when a line with '|' is found
            } else {
                return; // Skip lines until the table starts
            }
        }

        if (line.match(/^\s*-+\s*\|\s*-+/)) {
            return; // Skip separator lines
        }

        // Split the line into columns
        const columns = line.split('|').map((col) => col.trim());

        if (headers.length === 0) {
            // The first line is treated as headers
            headers = columns;
        } else if (columns.length === headers.length) {
            // Convert values into a structured object with headers
            const row = {};
            headers.forEach((header, i) => {
                row[header] = columns[i];
            });
            data.push(row);
        }
    });

    return data; // Return parsed data
}

// Function to perform OCR with error handling and retry mechanism
async function runOCRWithRetry(imagePath, retries = 3) {
    const apiKey = process.env.TOGETHER_API_KEY; // Load API key from .env file

    if (!apiKey) {
        console.error('API key is missing. Check your .env file.');
        throw new Error('API key is missing.');
    }

    // Ensure the ocr_results folder exists
    const ocrResultsDir = path.join(process.cwd(), 'public', 'ocr_results');
    await fs.mkdir(ocrResultsDir, { recursive: true });

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Starting OCR attempt ${i + 1} for image: ${imagePath}`);

            // Perform OCR
            const markdown = await ocr({
                filePath: imagePath,
                apiKey: apiKey,
            });

            console.log('Raw OCR Output:', markdown);

            // Parse the OCR result to extract table data
            const tableData = parseMarkdownTable(markdown);
            console.log('Parsed Data:', tableData);

            if (tableData.length === 0) {
                console.log('No table data found.');
                throw new Error('No table data found.');
            }

            // Save results in JSON format
            const jsonFilename = path.basename(imagePath, path.extname(imagePath)) + '.json';
            const jsonFilePath = path.join(ocrResultsDir, jsonFilename);
            await fs.writeFile(jsonFilePath, JSON.stringify(tableData, null, 2));
            console.log(`OCR results saved to ${jsonFilePath}`);

            return jsonFilename; // Return the JSON filename for reference
        } catch (error) {
            console.error(`OCR attempt ${i + 1} failed:`, error);

            if (i === retries - 1) {
                console.error('All OCR attempts failed.');
                throw error; // Throw error on the last attempt
            }
        }
    }
}

// Export the runOCRWithRetry function for use in API routes
module.exports = { runOCRWithRetry };