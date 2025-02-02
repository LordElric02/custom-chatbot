import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";


const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index("chatbot-knowledge"); // Your Pinecone index name
const indexStats = await index.describeIndexStats();
console.log(`Index stats: ${JSON.stringify(indexStats)}`);

export default index;
