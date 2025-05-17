import express from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { discordId, discordUsername, walletAddress } = req.body;

    if (!discordId || !discordUsername || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await doc.useAuthClient(serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // Assumes the first sheet is used
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      DiscordID: discordId,
      DiscordUsername: discordUsername,
      WalletAddress: walletAddress,
    });

    res.status(200).json({ message: 'User logged to Google Sheet' });

  } catch (error) {
    console.error('❌ Error connecting to Google Sheet:', error);
    res.status(500).json({ error: 'Failed to log user to Google Sheet' });
  }
});

export default router;
