import { google } from 'googleapis';
import fs from 'fs';

// Load credentials from JSON file
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync('./google-credentials.json', 'utf-8')),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Replace with your Google Sheet ID
const SHEET_ID = 'your_google_sheet_id_here'; 
const RANGE = 'Sheet1!A2:D'; // Skip headers (row 1)

export async function appendToSheet(discordUsername, discordId, walletAddress) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), discordUsername, discordId, walletAddress]],
    },
  });

  return response.data;
}
