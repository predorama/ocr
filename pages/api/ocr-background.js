export default async function handler(req, res) {
    // Immediately respond to the client
    res.status(200).json({ message: 'OCR task started' });
  
    // Perform the OCR task in the background
    performOCR(req.body.image);
  }
  
  async function performOCR(image) {
    // Your OCR logic here
    console.log('Starting OCR...');
    // Simulate a long-running task
    await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 seconds
    console.log('OCR completed');
  }