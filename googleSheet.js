import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

async function testSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID);

  console.log('typeof useServiceAccountAuth:', typeof doc.useServiceAccountAuth);

  await doc.useServiceAccountAuth({
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  await sheet.addRow({
    DiscordID: 'test123',
    Timestamp: new Date().toISOString(),
  });

  console.log('✅ Row added');
}

testSheet().catch(console.error);
