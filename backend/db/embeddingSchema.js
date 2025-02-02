import { stringify } from "ajv";
import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
  question: String,
  embedding: [Number], // Store as an array of numbers
  answer: String,
});

export default embeddingSchema; // Export only the schema
