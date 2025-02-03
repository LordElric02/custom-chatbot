import { stringify } from "ajv";
import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
  question: String,
  embedding: Array,
  answer: String,
  related_questions: [
    {
      question: String,
      answer: String,
    },
  ],
});


export default embeddingSchema; // Export only the schema
