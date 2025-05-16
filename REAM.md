// --- backend/README.md ---
# yLori Quest Backend

## Setup
1. Create Google Service Account and share the sheet with the service email.
2. Fill `.env` file:
```
PORT=8080
SHEET_ID=your_sheet_id
GOOGLE_CLIENT_EMAIL=from_service_account
GOOGLE_PRIVATE_KEY="multiline private key"
```

## Run locally
```bash
npm install
npm start
```

## Deploy to Render
1. Push to GitHub.
2. Create new Web Service on Render:
   - Runtime: Node.js
   - Start command: `npm start`
   - Add environment variables (same as `.env`)

## Test
```bash
curl -X POST https://your-api.onrender.com/api/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","discordId":"ylori#0001","wallet":"0x123","questId":"quest-001"}'
```
