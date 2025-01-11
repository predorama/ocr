import fs from 'fs/promises';
import path from 'path';
import { runOCRWithRetry } from '../../lib/ocr';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase the limit to 10MB
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

  if (!imageUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image format' });
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const imagePath = path.join(uploadsDir, `temp-${Date.now()}.png`);
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    await fs.writeFile(imagePath, Buffer.from(base64Data, 'base64'));

    const jsonFilename = await runOCRWithRetry(imagePath);

    // Clean up the temporary file
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting temporary image:', error);
    }

    res.status(200).json({ jsonFilename });
  } catch (error) {
    console.error('Error processing image:', error);

    // Return a JSON error response
    if (error.message.includes('Body exceeded')) {
      return res.status(413).json({ error: 'Payload too large', details: error.message });
    }

    res.status(500).json({ error: 'Failed to process the image', details: error.message });
  }
}