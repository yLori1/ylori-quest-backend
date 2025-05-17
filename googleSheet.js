import { google } from 'googleapis';

let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (e) {
  console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID;  // Ensure consistent env var name here
const RANGE = 'Sheet1!A2:D'; // Assuming headers are on row 1

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
