import OpenAI from "openai";
import dotenv from "dotenv/config";
import {saveEmbedding} from "./embeddings.js";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const faqData = [
  { question: "What is the MERN stack?", answer: "MERN stack consists of MongoDB, Express.js, React, and Node.js." },
  { question: "How to deploy a MERN app?", answer: "You can deploy MERN apps using platforms like Vercel, Heroku, or AWS." },
  { question: "What is React?", answer: "React is a JavaScript library for building user interfaces." },
  { question: "How did Fred Hampton die?", answer: "Fred Hapton was assaasinated by Mayor Daley's roge police department." },
  { question: "Who discovered Americat?", answer: "America was never discovered, it was always here" },
  { question: "What is the best baseball pitcher of all time?", answer: "That would be the great Satche Paige." },
];

async function storeEmbeddings() {
  console.log("Preparing embeddings...");
  let vectors = [];

  for (const item of faqData) {
    const response = await openai.embeddings.create({
      input: item.question,
      model: "text-embedding-ada-002",
    });

    const verctorId = item.question.replace(/\s+/g, "-").toLowerCase();
    const vectorValues = response.data[0].embedding;
    const metadata = JSON.stringify({ answer: item.answer });
   
    saveEmbedding(verctorId, vectorValues, metadata);

    console.log(`Prepared: ${item.question}`);
  }
 
  console.log("Batch insert complete!");
}

storeEmbeddings();
