// index.js
const express = require('express');
const path = require('path');
const Groq = require('groq-sdk');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq client with API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Main function to get chat completions
async function getGroqChatCompletion(userInput) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Symptoms are ${userInput}. Provide the disease, medicines, precautions, workout, diet in few key words.`,
            },
        ],
        model: "llama3-8b-8192",
    });
}

// Endpoint to handle symptom input
app.post('/api/symptoms', async (req, res) => {
    const userInput = req.body.input;

    try {
        const chatCompletion = await getGroqChatCompletion(userInput);
        const response = chatCompletion.choices[0]?.message?.content || "";

        console.log("Raw response from Groq:", response); // Log the raw response
        const categorizedResponse = parseResponse(response);

        res.json(categorizedResponse);
    } catch (error) {
        console.error("Error in Groq API call:", error);
        res.status(500).send('Error communicating with Groq API');
    }
});


// Function to parse and format the response
function parseResponse(response) {
    const categories = {
        Disease: [],
        Medicines: [],
        Precautions: [],
        Workout: [],
        Diet: []
    };

    // Split response into lines and clean them up
    const lines = response.split('\n').filter(line => line.trim() !== "");

    let currentKey = null;

    // Loop through lines to categorize content
    lines.forEach(line => {
        if (line.startsWith('**')) {
            const [key, value] = line.split(':').map(part => part.replace(/\*\*/g, '').trim());
            if (categories[key]) {
                currentKey = key;
                categories[key] = value.split(',').map(item => item.trim()).filter(item => item); // Remove "*" and split
            }
        } else if (currentKey && line.trim() !== "") {
            categories[currentKey].push(line.replace(/\*/g, '').trim());  // Clean up "*" from entries
        }
    });

    // Convert arrays to strings for displaying in a single table cell
    for (let key in categories) {
        categories[key] = categories[key].join(', ');
    }

    return categories;
}


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
