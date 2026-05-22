import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Get all notes
export const getAllNotes = async (req, res) => {
  // Read pagination params from query string
  const { page = 1, perPage = 10, tag, search } = req.query;
  const userId = req.user._id;

  // Calculate how many documents should be skipped for the current page
  const skip = (page - 1) * perPage;

  const notesQuery = Note.find({ userId });

  if (search) {
    notesQuery.find({ $text: { $search: search } });
  }

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  // Run count and paginated fetch in parallel; clone() is needed because the same query is reused twice
  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  // Calculate total amount of pages based on all notes and page size
  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

// Get one note by ID
export const getNoteById = async (req, res) => {
  // Get note ID from URL params
  const { noteId } = req.params;
  const userId = req.user._id;

  // Find note by MongoDB _id
  const note = await Note.findOne({
    _id: noteId,
    userId,
  });

  // If note does not exist -> 404 error
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  // Send found note
  res.status(200).json(note);
};

// Delete note by ID
export const deleteNote = async (req, res) => {
  // Get ID from params
  const { noteId } = req.params;
  const userId = req.user._id;

  // Find and delete note
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId,
  });

  // If note not found
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  // Send deleted note
  res.status(200).json(note);
};

// Update note by ID
export const updateNote = async (req, res) => {
  // Get ID from params
  const { noteId } = req.params;
  const userId = req.user._id;

  // Find note and update with req.body data
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId },

    // New data from client
    req.body,

    // Return updated document
    { returnDocument: 'after' },
  );

  // If note does not exist
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  // Send updated note
  res.status(200).json(note);
};

// Create new note
export const createNote = async (req, res) => {
  const userId = req.user._id;

  // Create document using request body
  const note = await Note.create({
    ...req.body,
    userId,
  });

  // 201 = Created
  res.status(201).json(note);
};
