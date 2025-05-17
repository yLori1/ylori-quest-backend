import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://quest.ylori.site',
  credentials: true,
}));
app.use(express.json());

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const doc = new GoogleSpreadsheet(SHEET_ID);

async function connectGoogleSheet() {
  try {
    await doc.useServiceAccountAuth({
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    console.log('✅ Connected to Google Sheet:', doc.title);
  } catch (error) {
    console.error('❌ Error connecting to Google Sheet:', error);
    process.exit(1);
  }
}

app.post('/api/log-discord-user', async (req, res) => {
  const { username, id } = req.body;

  if (!username || !id) {
    return res.status(400).json({ error: 'Missing username or id' });
  }

  try {
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
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

    return res.status(200).json({ message: 'Discord user logged successfully' });
  } catch (err) {
    console.error('❌ Error writing to Google Sheet:', err);
    return res.status(500).json({ error: 'Failed to write to Google Sheet' });
  }
});

connectGoogleSheet().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
