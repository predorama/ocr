import fs from 'fs/promises'; // Use promises for async file operations
import path from 'path';
import { runOCRWithRetry } from '../../lib/ocr'; // Import the OCR function
 
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase the body size limit
    },
  },
};
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { imageUrl } = req.body;
 
  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }
 
  // Validate the base64 image format
  if (!imageUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image format' });
  }
 
  try {
    // Use the `/tmp` directory for temporary files
    const uploadsDir = '/tmp/uploads';
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Uploads directory created at:', uploadsDir); // Debugging
 
    // Save the base64 image to a temporary file
    const imagePath = path.join(uploadsDir, `temp-${Date.now()}.png`);
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    await fs.writeFile(imagePath, Buffer.from(base64Data, 'base64'));
    console.log('Temporary image saved at:', imagePath); // Debugging
 
    // Perform OCR with retry mechanism
    const jsonFilename = await runOCRWithRetry(imagePath);
    console.log('OCR result saved as:', jsonFilename); // Debugging
 
    // Delete the temporary image file
    try {
      await fs.unlink(imagePath);
      console.log('Temporary image deleted:', imagePath); // Debugging
    } catch (error) {
      console.error('Error deleting temporary image:', error);
    }
 
    // Return the JSON filename
    res.status(200).json({ jsonFilename });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process the image', details: error.message });
  }
}
 