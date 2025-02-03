const PORT = process.env.PORT || 5000;
import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import embeddingSchema from "./db/embeddingSchema.js"; // Assuming you have this in a separate file

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const EmbeddingModel = mongoose.model("Embedding", embeddingSchema);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.post("/gemini", async (req, res) => {
    try {
        const userMessage = req.body.message;
        const userHistory = req.body.history || [];

        // Generate embedding for user input
        const embeddingResponse = await openai.embeddings.create({
            input: userMessage,
            model: "text-embedding-ada-002",
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Search for similar question in MongoDB
      
        const queryResult = await EmbeddingModel.aggregate([
          {
              $project: {
                  question: 1,
                  answer: 1,
                  score: {
                      $let: {
                          vars: {
                              inputVector: embedding,
                              storedVector: "$embedding"
                          },
                          in: {
                              $reduce: {
                                  input: { $zip: { inputs: ["$$inputVector", "$$storedVector"] } },
                                  initialValue: 0,
                                  in: {
                                      $add: [
                                          "$$value",
                                          {
                                              $multiply: [
                                                  { $arrayElemAt: ["$$this", 0] },
                                                  { $arrayElemAt: ["$$this", 1] }
                                              ]
                                          }
                                      ]
                                  }
                              }
                          }
                      }
                  }
              }
          },
          { $match: { score: { $gt: 0.9 } } },
          { $sort: { score: -1 } },
          { $limit: 1 }
      ]);
      
        if (queryResult.length > 0) {
            return res.json({ answer: queryResult[0].answer });
        }

        // If no match, fallback to Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ history: userHistory });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        if (response && typeof response.text === "function") {
            res.json({ answer: response.text() });
        } else {
            res.status(500).json({ error: "Unexpected response format" });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// Function to store embeddings (if needed)
async function storeEmbeddings() {
    // Your existing implementation
}
