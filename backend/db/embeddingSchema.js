import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Define _id as a string and make it required
  question: { type: String, required: true, unique: true },
  embedding: { type: [Number], required: true }, // Array of numbers (vector embedding)
  answer: { type: String, required: true },
  parent_question: { type: mongoose.Schema.Types.ObjectId, ref: "Embedding", default: null } // Links back to a parent question
});

// Ensure that the schema's _id field is treated as a custom value, instead of MongoDB's default ObjectId.
const Embedding = mongoose.model("Embedding", embeddingSchema);
export default embeddingSchema;
