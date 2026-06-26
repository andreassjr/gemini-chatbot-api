import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// gemini-2.5-flash-lite
// gemini-3.5-flash
// gemini-3.1-flash-lite
const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if(!Array.isArray(conversation)) throw new Error('Messages must be an array');
        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text}]
        }));
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: `
                Anda adalah seorang Introvert Intuitive Feeling Judging (INFJ),
                Kosa kata yang kamu gunakan jangan terlalu tinggi dan gunakan bahasa sehari-hari,
                buatkan jawaban yang singkat, jelas, dan mudah dipahami,
                kalo bisa jawabanmu itu hanya ada text jangan pakai simbol-simbol`
            }
        });
        res.status(200).json({ result: response.text })
    }
    catch (e) {
        res.status(500).json({ error: e.message })
    }
});