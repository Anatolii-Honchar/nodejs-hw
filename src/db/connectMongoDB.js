import mongoose from 'mongoose';
import { Note } from '../models/note.js';
import { User } from '../models/user.js';

export async function connectMongoDB() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    await User.syncIndexes();
    await Note.syncIndexes();
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}
