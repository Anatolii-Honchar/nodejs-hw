import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Get all notes
export const getAllNotes = async (req, res) => {
  // Find all documents in MongoDB
  const notes = await Note.find();

  // Send response with notes
  res.status(200).json(notes);
};

// Get one note by ID
export const getNoteById = async (req, res) => {
  // Get note ID from URL params
  const { noteId } = req.params;

  // Find note by MongoDB _id
  const note = await Note.findById(noteId);

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

  // Find and delete note
  const note = await Note.findOneAndDelete({
    _id: noteId,
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

  // Find note and update with req.body data
  const note = await Note.findOneAndUpdate(
    { _id: noteId },

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
  // Create document using request body
  const note = await Note.create(req.body);

  // 201 = Created
  res.status(201).json(note);
};
