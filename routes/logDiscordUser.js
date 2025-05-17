// routes/logDiscordUser.js
import express from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

router.post('/', async (req, res) => {
  const { username, id } = req.body;

  if (!username || !id) {
    return res.status(400).json({ error: 'Missing username or id' });
  }

  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(serviceAccount);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      DiscordUsername: username,
      DiscordID: id,
      Timestamp: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Discord user logged successfully' });
  } catch (err) {
    console.error('Error writing to Google Sheet:', err);
    res.status(500).json({ error: 'Failed to write to Google Sheet' });
  }
});

export default router;
