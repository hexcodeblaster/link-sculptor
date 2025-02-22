import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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

// WebSocket handling for real-time audio
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('audio-stream', (audioChunk) => {
    // Process the audio chunk
    // For demo, we'll just echo back a response immediately
    const response = `Processing chunk received at ${new Date().toISOString()}`;
    
    // Log the stream chunk
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'audio-stream',
      chunkSize: audioChunk.length
    };

    fs.appendFileSync(
      path.join('logs', 'chat.log'),
      JSON.stringify(logData, null, 2) + '\n---\n',
      'utf8'
    );

    // Send immediate response back to client
    socket.emit('audio-response', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
