import { google } from 'googleapis';

// Parse service account JSON from environment variable
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = process.env.SHEET_ID; // Make sure this is set in env variables
const RANGE = 'Sheet1!A2:D'; // Skip headers

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
