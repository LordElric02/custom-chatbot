import mongoose from "mongoose";
import embeddingSchema from "./db/embeddingSchema.js"; // Import the schema

// Define the model using the imported schema
const Embedding = mongoose.model("Embedding", embeddingSchema);

// MongoDB connection URI

async function connectDB() {
  try {
await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

const dropcollection = async () => {
  await Embedding.collection.drop();

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
export { dropcollection };
