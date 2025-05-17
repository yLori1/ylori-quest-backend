import express from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (e) {
  console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
  process.exit(1);
}

console.log('Using Google Sheet ID:', SHEET_ID);
console.log('Service account email:', serviceAccount?.client_email);

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

    // Prevent duplicate entries
    const existingRows = await sheet.getRows();
    const alreadyLogged = existingRows.some(row => row.DiscordID === id);
    if (alreadyLogged) {
      return res.status(200).json({ message: 'User already logged' });
    }

    await sheet.addRow({
      DiscordUsername: username,
      DiscordID: id,
      Timestamp: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Discord user logged successfully' });
  } catch (err) {
    console.error('Error writing to Google Sheet:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to write to Google Sheet' });
  }
});

export default router;
