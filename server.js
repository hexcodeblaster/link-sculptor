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

// Regular file upload endpoints
app.post('/upload', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescription', maxCount: 1 }
]), (req, res) => {
  const { githubLink, linkedinLink } = req.body;
  const resume = req.files['resume'] ? req.files['resume'][0] : null;
  const jobDescription = req.files['jobDescription'][0];

  // Log the data
  const logData = {
    timestamp: new Date().toISOString(),
    githubLink,
    linkedinLink,
    resumePath: resume ? resume.path : 'No resume uploaded',
    jobDescriptionPath: jobDescription.path
  };

  // Write to log file
  fs.appendFileSync(
    path.join('logs', 'uploads.log'),
    JSON.stringify(logData, null, 2) + '\n---\n',
    'utf8'
  );

  res.json({ message: 'Data received and logged successfully!' });
});

// Text chat endpoint
app.post('/chat', (req, res) => {
  const { message } = req.body;

  // Log chat message
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'text',
    message,
  };

  fs.appendFileSync(
    path.join('logs', 'chat.log'),
    JSON.stringify(logData, null, 2) + '\n---\n',
    'utf8'
  );

  res.json({ message: `I received your message: "${message}". This is a demo response.` });
});

// Audio chat endpoint
app.post('/chat/audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file received' });
  }

  // Log the audio file receipt
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'audio',
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size
  };

  fs.appendFileSync(
    path.join('logs', 'chat.log'),
    JSON.stringify(logData, null, 2) + '\n---\n',
    'utf8'
  );

  // Send back a response
  res.json({ message: 'Audio received and processed successfully!' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
