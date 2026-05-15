import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';

import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import { errors } from 'celebrate';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Request logging middleware (logs all incoming requests)
app.use(logger);

// Parse incoming JSON requests with size and content-type limits to prevent abuse and ensure correct handling
app.use(
  express.json({
    type: ['application/json', 'application/vnd.api+json'],
    limit: '100kb', // prevent large payload attacks
  }),
);

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Add basic security HTTP headers
app.use(helmet());

// Register application routes for notes API
app.use(notesRoutes);

// Handle requests to unknown routes (404)
app.use(notFoundHandler);

// Celebrate validation error handler (must be before global error handler)
app.use(errors());

// Global error handler (must be last middleware)
app.use(errorHandler);

// Connect to MongoDB before starting the server
await connectMongoDB();

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
