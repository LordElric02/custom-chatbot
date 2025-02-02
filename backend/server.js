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
        const history =  [];
        const message = req.body.message;

        console.log(`History: ${JSON.stringify(history)}`);
        console.log(`Message: ${message}`); 

       

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({ history: history });


        // Await response
        const result = await chat.sendMessage(message);
        const response = result.response;
        
        if (response && typeof response.text === "function") {
            res.send(response.text()); 
        } else {
            console.error("Unexpected response format:", response);
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
