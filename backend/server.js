import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import embeddingSchema from "./db/embeddingSchema.js"; // Assuming you have this in a separate file
import { storeEmbeddings } from "./data/seedData.js";

const PORT = process.env.PORT || 5000;
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

app.get("/seedmodel", async (req, res) => {
    await storeEmbeddings();
    res.json({ message: "model seeded" });
});

app.post("/gemini", async (req, res) => {
    try {
        const userMessage = req.body.message;
        const userHistory = req.body.history || [];
        const parentQuestionId = req.body.parentQuestionId ? String(req.body.parentQuestionId) : null;
        console.log(`Parent question ID: ${parentQuestionId}`);

        // Generate embedding for user input
        const embeddingResponse = await openai.embeddings.create({
            input: userMessage,
            model: "text-embedding-ada-002",
        });

        const embedding = embeddingResponse.data[0].embedding;
        console.log("Generated embedding:", embedding);

        // Build the aggregation pipeline
        const aggregationPipeline = [
            {
                $project: {
                    question: 1,
                    answer: 1,
                    uid: 1,
                    parent_question: 1, // Include parent_question in the projection
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
            {
                $match: {
                    score: { $gt: 0.8 },
                    ...(parentQuestionId ? { parent_question: new mongoose.Types.ObjectId(parentQuestionId) } : {})
                }
            },
            { $sort: { score: -1 } },
            { $limit: 1 }
        ];

        console.log("Aggregation Pipeline:", JSON.stringify(aggregationPipeline, null, 2));

        // Search for similar question in MongoDB
        const queryResult = await EmbeddingModel.aggregate(aggregationPipeline);
        console.log("Query Result:", JSON.stringify(queryResult, null, 2));

        if (queryResult.length > 0) {
            return res.json({ answer: queryResult[0].answer, uid: queryResult[0]._id });
        }

        // Check if an embedding with the same question already exists to avoid duplicates
        const existingEmbedding = await EmbeddingModel.findOne({ question: userMessage, _id : parentQuestionId });

        if (existingEmbedding) {
            return res.json({ answer: existingEmbedding.answer, uid: existingEmbedding.uid });
        }

        // If no match, fallback to Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ history: userHistory });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        if (response && typeof response.text === "function") {
            const newEmbedding = new EmbeddingModel({
                uid: new mongoose.Types.ObjectId().toString(),
                question: userMessage,
                embedding: embedding,
                answer: response.text(),
                parent_question: parentQuestionId
            });

            // Save new question and embedding to DB
            await newEmbedding.save();

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
