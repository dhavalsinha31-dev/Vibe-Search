import { GoogleGenAI } from '@google/genai';
import moviesData from '../data/movies.json';

// Initialize the Gemini client using the environment variable
// We will set this securely via Vite's import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export async function searchMoviesWithGemini(userQuery) {
    if (!ai) {
        throw new Error("Gemini API key is missing. Please configure it in your .env file.");
    }

    const prompt = `
You are an expert movie recommendation engine for a premium streaming app.
Your task is to match the user's natural language mood/vibe query perfectly against our database of movies.

USER QUERY: "${userQuery}"

AVAILABLE MOVIES DATABASE:
${JSON.stringify(moviesData, null, 2)}

INSTRUCTIONS:
1. Examine the user's query carefully to understand the tone, genre, vibe, and constraints (e.g. "safe for kids", "not scary").
2. Find the top 1 to 3 best matching movies from the PROVIDED DATABASE ONLY. Do not invent or hallucinate movies that are not in the database.
3. For each match, write a 1-sentence explanation of why it fits the query exactly.
4. If no movies match the query safely or the query is inappropriate, return an empty array.
5. YOU MUST RESPOND IN PURE JSON FORMAT ONLY. Do not wrap it in markdown block quotes (e.g. \`\`\`json). Just output the raw JSON.

EXPECTED JSON SCHEMA:
{
  "matches": [
    {
      "id": Number,
      "explanation": "String"
    }
  ]
}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Keep it deterministic
                responseMimeType: "application/json", // Force JSON output
            }
        });

        const responseText = response.text;
        const data = JSON.parse(responseText);

        return data.matches || [];
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to process the request with AI.");
    }
}
