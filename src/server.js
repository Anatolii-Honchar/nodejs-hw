import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import 'dotenv/config.js';
import { connectMongoDB } from './db/connectMongoDB.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

/** Logger middleware */
app.use(
  pino({
    transport: {
      target: 'pino-pretty',
    },
  }),
);

/** Routes */

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

/** Error handling middleware (500) */
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: isProd ? 'Internal Server Error' : err.stack,
  });
});

await connectMongoDB();

/** Start server */
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
