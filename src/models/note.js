import { model, Schema } from 'mongoose';
import { TAGS } from '../constants/tags.js';

// Define schema for a note document
const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true, // title is mandatory
      trim: true, // remove whitespace from start and end
    },
    content: {
      type: String,
      default: '', // default empty content
      trim: true, // clean extra spaces
    },
    tag: {
      type: String,
      enum: TAGS,
      default: 'Todo', // default category if none provided
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  },
);

noteSchema.index({
  tag: 1,
  userId: 1,
});

// Create and export Note model
export const Note = model('Note', noteSchema);
