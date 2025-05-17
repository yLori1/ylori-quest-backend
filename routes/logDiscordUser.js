import express from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
if (!SHEET_ID) {
  throw new Error('Missing GOOGLE_SHEET_ID in environment variables');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (e) {
  throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON environment variable. Ensure it is a valid JSON string.');
}

router.post('/', async (req, res) => {
  const { username, id } = req.body;

  if (!username || !id) {
    return res.status(400).json({ error: 'Missing username or id' });
  }

  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);

    await doc.useServiceAccountAuth({
      client_email: serviceAccount.client_email,
      // Replace escaped newlines with actual newlines in the private key
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Fetch all rows to check for duplicates
    const rows = await sheet.getRows();

    const alreadyLogged = rows.some(row => row.DiscordID === id);
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
    console.error('💥 Error writing to Google Sheet:', err);
    res.status(500).json({
      error: 'Failed to write to Google Sheet',
      details: err.message || String(err),
    });
  }
});

export default router;
