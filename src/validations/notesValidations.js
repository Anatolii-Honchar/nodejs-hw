import { Segments, Joi } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const validateObjectId = (value, helpers) => {
  if (isValidObjectId(value)) {
    return value;
  }
  return helpers.error('Invalid ID format');
};

export const getAllNotesSchema = {};

export const noteIdSchema = {};

export const createNoteSchema = {};

export const updateNoteSchema = {};
