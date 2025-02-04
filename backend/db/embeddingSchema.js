import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // Define uid as a string and make it required
  question: { type: String, required: true, unique: true },
  embedding: { type: [Number], required: true }, // Array of numbers (vector embedding)
  answer: { type: String, required: true },
  parent_question: { type: mongoose.Schema.Types.ObjectId, ref: "Embedding", default: null } // Links back to a parent question
});

// Ensure that the schema's uid field is treated as a custom value, instead of MongoDB's default ObjectId.
const Embedding = mongoose.model("Embedding", embeddingSchema);
export default embeddingSchema;
