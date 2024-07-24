const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/prompts', async (req, res) => {
    try {
        const { eventType, name, age, coupleNames, weddingDate, babyName, gender } = req.body;

        let occasionDetails = `Occasion: ${eventType}`;
        if (name) occasionDetails += `, Name: ${name}`;
        if (age) occasionDetails += `, Age: ${age}`;
        if (coupleNames) occasionDetails += `, Couple Names: ${coupleNames}`;
        if (weddingDate) occasionDetails += `, Wedding Date: ${weddingDate}`;
        if (babyName) occasionDetails += `, Baby Name: ${babyName}`;
        if (gender) occasionDetails += `, Gender: ${gender}`;

        const prompt = `
            I would like to request your assistance in generating 3 drafts of a greeting card message based on the following parameters:
            ${occasionDetails}.
            Please ensure that each draft is creative, heartfelt, and appropriate for the selected occasion.
            Additionally, please provide only the greeting card messages without any additional comments or sign-offs such as "Good luck," "Here is your message," etc.
            Also, return the response in a parsable JSON format like follow:
            {
                "1": "....",
                "2": "....",
                "3": "...."
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
        });

        const parsableJSONResponse = response.choices[0].message.content.trim();
        const parsedResponse = JSON.parse(parsableJSONResponse);

        res.json(parsedResponse);
    } catch (error) {
        console.error('Error generating greeting from OpenAI:', error);
        res.status(500).json({ error: 'Error generating greeting from OpenAI.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
