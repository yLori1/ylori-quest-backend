import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
if (!SHEET_ID) {
  throw new Error('❌ Missing GOOGLE_SHEET_ID in environment variables');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (err) {
  throw new Error('❌ Invalid GOOGLE_SERVICE_ACCOUNT_JSON. Ensure it is a valid JSON string.');
}

async function testSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID);

  console.log('🛠️ typeof useServiceAccountAuth:', typeof doc.useServiceAccountAuth);

  if (typeof doc.useServiceAccountAuth !== 'function') {
    throw new Error('❌ useServiceAccountAuth is not a function. Check google-spreadsheet version.');
  }

  await doc.useServiceAccountAuth({
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  console.log(`📄 Loaded sheet: ${sheet.title}`);

  await sheet.addRow({
    DiscordID: 'test123',
    Timestamp: new Date().toISOString(),
  });

  console.log('✅ Row added successfully!');
}

testSheet().catch((err) => {
  console.error('💥 Error occurred:', err.message || err);
});
