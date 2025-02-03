import OpenAI from "openai";
import dotenv from "dotenv/config";
import {saveEmbedding} from "./embeddings.js";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const faqData = [
  {
    "question": "What is the best baseball pitcher of all time?",
    "answer": "That would be the great Satchel Paige.",
    "related_questions": [
        {
            "question": "How old was he when he died?",
            "answer": "Satchel Paige died at the age of 92."
        },
        {
          "question": "Excluding the Negro Leagues, what would your answer be?",
          "answer": "That would be Babe Ruth."
      },
        {
          "question": "What was his lifetime record?",
          "answer": "Satchel Paige's lifetime record was 506-102."
        }, 
    ]
  },
  {
    "question": "Who killed Patrice Lumumba?",
    "answer": "The CIA was responsible for his death..",
    "related_questions": [
        {
            "question": "How old was he when he died?",
            "answer": "Patrice was 38 when he passed away.."
        }
    ]
  },
  {
    "question": "Why was Donald Trump so popular with working class Americans.?",
    "answer": "Donald Trump was popular with White working class Americans. They supported him because or their suppor his MAGA ideology.",
    "related_questions": [
        {
            "question": "Did any non-white working class support him?",
            "answer": "Trump was supported by some men in these communities for misogynistic reasons.."
        }
    ]
  },
  {
    "question": "Is Donald Trump a racist?",
    "answer": "Donalt Trump is very racist.  There are decades of evidince supporting this.",
    "related_questions": [
        {
            "question": "Give me a example of him being racist?",
            "answer": "He was fined by the Federal government for not renting his apartments to black people."
        }
    ]
  },
  {
    "question": "What was Reconstruction?",
    "answer": "This was a period of time after the US Civil War when the federal government tried to protect blck people racist white southerners.",
    "related_questions": [
        {
            "question": "Why did it end?",
            "answer": "After the election of 1872, nothern politicans abandoned African Americans in the south because of political expediency"
        }
    ]
  },
  {
    "question": "Is DEI bad for the USA",
    "answer": "DEI is a very good initiatiive.",
    "related_questions": [
        {
            "question": "Why do so many people oppose it?",
            "answer": "People oppose it out of pure hatred for black people."
        }
    ]
  },
  {
    "question": "Is Donald Trump's Tafiff plan good for the country?",
    "answer": "Trump's Tariff plan is very bad for the country.",
    "related_questions": [
        {
            "question": "Why do so many support it?",
            "answer": "This support is out of pure ignorance"
        }
    ]
  },
  {
    "question": "What is Elon Musk's DODGE program?",
    "answer": "It's an brazen attempt by musk to steal money from the US.",
    "related_questions": [
        {
            "question": "Is it constituitional?",
            "answer": "It's 100% unconstituitional."
        }
    ]
  },
  {
    "question": "Did Elon Musk do a Hitler salute an Trump's inauguration?",
    "answer": "Yes, he absolutely did.",
    "related_questions": [
        {
            "question": "Is there actually a Roman salute?",
            "answer": "There is no such thing."
        }
    ]
  },
  {
    "question": "Did Elon Musk enter the US illegally?",
    "answer": "Yes, he overstayed a student visa.",
    "related_questions": [
        {
            "question": "Is this true for his brother also?",
            "answer": "Yes, Elon's brother also entered the country illeg."
        }
    ]
  },
  {
    "question": "Is Meta's decision to end fact-checking on it's platforms a bad thing?",
    "answer": "Yes, it's very bad.  Nothing on that platform can be trusted now.",
    "related_questions": [
        {
            "question": "Why was this decision made?",
            "answer": "The decision was made to appease Donald Trump."
        }
    ]
  },

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
    const metadata = item.answer;
    
    // Pass related_questions as well
    saveEmbedding(verctorId, vectorValues, metadata, item.related_questions);

    console.log(`Prepared: ${item.question}`);
  }
 
  console.log("Batch insert complete!");
}

storeEmbeddings();
