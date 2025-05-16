// --- backend/index.js ---
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appendSubmission } from './utils/sheets.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.send('yLori Quest Backend Running');
});

app.post('/api/submit', async (req, res) => {
  const { name, discordId, wallet, questId } = req.body;

  if (!name || !discordId || !wallet) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    await appendSubmission({ name, discordId, wallet, questId });
    res.json({ success: true });
  } catch (err) {
    console.error('Google Sheet Error:', err);
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));