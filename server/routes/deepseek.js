const express = require('express');
const router = express.Router();
const axios = require('axios');

const MODEL = "deepseek-chat";
const API_KEY = process.env.CHATBOT_API_KEY;
const URL = "https://api.deepseek.com/v1/chat/completions";

router.post("/nlp", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const headers = {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        };

        const payload = {
            model: MODEL,
            messages: [
                { role: "system", content: "You are an AI that interprets the output of a plant disease classification model for the user." },
                { role: "user", content: prompt }
            ],
            temperature: 0
        };

        const apiResponse = await axios.post(URL, payload, { headers });
        res.json(apiResponse.data);

    } catch (err) {
        console.error(`Error while posting to chatbot\n${err}`);
        res.status(500).json({ error: "Chatbot API failed" });
    }
});

module.exports = router;
