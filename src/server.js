import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// middleware для JSON
app.use(express.json());

/**
 * GET /notes
 * повертає всі нотатки (поки mock-відповідь)
 */
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

/**
 * GET /notes/:noteId
 * повертає одну нотатку по ID
 */
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
