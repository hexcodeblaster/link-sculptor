
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Ensure logs directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Regular chat endpoint
app.post('/chat', (req, res) => {
  const { message } = req.body;
  res.json({ message: `I received your message: "${message}". This is a demo response.` });
});

// Audio chat endpoint
app.post('/chat/audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file received' });
  }

  // Here you would typically process the audio file and generate a response
  // For demo purposes, we'll just send back a sample audio file
  // In a real application, you would process the audio and generate a response
  
  try {
    // Send back a dummy audio response (you should replace this with actual audio processing)
    const dummyAudioResponse = fs.readFileSync(req.file.path);
    res.json({ 
      message: 'Audio processed successfully',
      audioResponse: dummyAudioResponse
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  } finally {
    // Clean up the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
