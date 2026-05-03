import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pinoHttp from 'pino-http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Logger middleware
 */
app.use(
  pinoHttp({
    transport: {
      target: 'pino-pretty',
    },
  }),
);

/**
 * Core middleware
 */
app.use(cors());
app.use(express.json());

/**
 * Routes
 */

// GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// GET /test-error (імітація помилки)
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

/**
 * 404 middleware (неіснуючі маршрути)
 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

/**
 * Error handling middleware (500)
 */
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
