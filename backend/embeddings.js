import mongoose from "mongoose";
import embeddingSchema from "./db/embeddingSchema.js"; // Import the schema
import "dotenv/config";




// Define the model using the imported schema
const Embedding = mongoose.model("Embedding", embeddingSchema);

// MongoDB connection URI
const MONGODB_URI = "your_mongodb_connection_string"; // Replace with your actual MongoDB URI

async function connectDB() {
  try {
    //console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
    const MONGO_URI="mongodb+srv://patrickglanville:Cz5nZNZSGnnbIFFw@cluster0.ko8ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// Function to save AI data
const saveEmbedding = async (question, embedding, answer, relatedQuestions) => {
  await connectDB();
  try {
    const newEmbedding = new Embedding({
      question,
      embedding,
      answer,
      related_questions: relatedQuestions,
    });
    await newEmbedding.save();
    console.log("Embedding saved successfully");
  } catch (error) {
    console.error("Error saving embedding:", error);
  }
};


export { saveEmbedding };