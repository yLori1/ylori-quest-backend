const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const router = express.Router();

const creds = require('../google-credentials.json'); // your Google service account creds
const SHEET_ID = '1HklMrmjW56gR8OmQH6LuTxKMiA3zVEfbZ4KrX3vMKeM'; // replace with your Google Sheet ID

router.post('/discord-user', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // first sheet
    await sheet.addRow({ Username: username, Timestamp: new Date().toISOString() });

    res.json({ message: 'User logged to Google Sheet' });
  } catch (err) {
    console.error('Google Sheet error:', err);
    res.status(500).json({ error: 'Failed to log to Google Sheet' });
  }
});

module.exports = router;
