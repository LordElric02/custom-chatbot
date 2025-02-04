import OpenAI from "openai";
import {saveEmbedding} from "./embeddings.js";
import { dropcollection } from "./embeddings.js";
import faqData from "./data/ai-model.js";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



export const storeEmbeddings = async () => {
  console.log("Preparing embeddings...");
  //first drop the existing collection
  dropcollection();

  for (const item of faqData) {
    const response = await openai.embeddings.create({
      input: item.question,
      model: "text-embedding-ada-002",
    });

    const verctorId = item.question.replace(/\s+/g, "-").toLowerCase();
    const vectorValues = response.data[0].embedding;
    const metadata = item.answer;
    const parentId = item.parent_question;
    const faqId = item.uid; 
    
    // Pass related_questions as well
    saveEmbedding(faqId,parentId, verctorId,vectorValues, metadata);

    console.log(`Prepared: ${item.question}`);
  }
 
  console.log("Batch insert complete!");
};


