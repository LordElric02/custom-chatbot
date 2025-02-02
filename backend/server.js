const PORT = process.env.PORT || 5000;
import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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
  
      // Search for similar question in Pinecone
      const queryResult = await index.query({
        vector: embedding,
        topK: 1, // Get top 1 most similar match
        includeMetadata: true,
      });
  
      if (queryResult.matches.length > 0 && queryResult.matches[0].score > 0.8) {
        return res.json({ answer: queryResult.matches[0].metadata.answer });
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
