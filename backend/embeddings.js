import mongoose from "mongoose";
import embeddingSchema from "./db/embeddingSchema.js"; // Import the schema
import "dotenv/config";

// Define the model using the imported schema
const Embedding = mongoose.model("Embedding", embeddingSchema);

// MongoDB connection URI
const MONGODB_URI = "mongodb+srv://patrickglanville:Cz5nZNZSGnnbIFFw@cluster0.ko8ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// Function to save AI data, now including the _id from faqData
const saveEmbedding = async (faqId, parentId,question, embedding, answer) => {
  await connectDB();
  try {
    const newEmbedding = new Embedding({
      _id: faqId, // Store the _id from faqData
      question,
      embedding,
      answer,
      parent_question: parentId
    });
    await newEmbedding.save();
    console.log("Embedding saved successfully");
  } catch (error) {
    console.error("Error saving embedding:", error);
  }
};

export { saveEmbedding };
