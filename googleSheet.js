import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
if (!SHEET_ID) {
  throw new Error('❌ Missing GOOGLE_SHEET_ID in environment variables');
}

const raw = await fs.readFile('./service-account.json', 'utf-8');
const serviceAccount = JSON.parse(raw);

async function testSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
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
