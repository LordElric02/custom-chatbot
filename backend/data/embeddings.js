import mongoose from "mongoose";
import embeddingSchema from "../db/embeddingSchema.js"; // Import the schema

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

const getParentIdFromUID = async (uid) => {
  const parentDocument = await Embedding.findOne({ uid });
  return parentDocument ? parentDocument._id : null;
};

// Function to save AI data, now including the uid from faqData
const saveEmbedding = async (faqId, parentId,question, embedding, answer) => {
  await connectDB();
  try {
    const newEmbedding = new Embedding({
      uid: faqId, // Store the uid from faqData
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
export { getParentIdFromUID };
