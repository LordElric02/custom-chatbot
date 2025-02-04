import OpenAI from "openai";
import dotenv from "dotenv/config";
import {saveEmbedding} from "./embeddings.js";
import faqData from "./data/ai-model.js";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


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
    const metadata = item.answer;
    const parentId = item.parent_question;
    const faqId = item._id; 
    
    // Pass related_questions as well
    saveEmbedding(faqId,parentId, verctorId,vectorValues, metadata);

    console.log(`Prepared: ${item.question}`);
  }
 
  console.log("Batch insert complete!");
}

storeEmbeddings();
