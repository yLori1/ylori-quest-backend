import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { appendToSheet } from './googlesheet.js';

dotenv.config();

const {
  FRONTEND_URL = 'https://your-frontend-url.com', // Replace with your live frontend URL
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI = 'https://your-backend-url.com/auth/discord/callback', // Replace with your live backend URL
} = process.env;

// Check required env variables
if (!FRONTEND_URL || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
  console.error('❌ Missing one or more required environment variables in .env');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json()); // JSON body parser middleware

// Step 1: Redirect to Discord OAuth2
app.get('/auth/discord', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(redirect);
});

// Step 2: Discord OAuth2 callback
app.get('/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
      scope: 'identify email',
    });

    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { username, discriminator, id } = userResponse.data;

    // Redirect with user info as query params
    res.redirect(`${FRONTEND_URL}/discord/callback?username=${encodeURIComponent(username)}&discriminator=${discriminator}&id=${id}`);
  } catch (err) {
    console.error('🔴 Discord OAuth error:', err.response?.data || err.message);
    res.status(500).send('Error during Discord OAuth');
  }
});

// POST endpoint to submit wallet data to Google Sheets
app.post('/submit-wallet', async (req, res) => {
  const { discordUsername, discordId, walletAddress } = req.body;

  if (!discordUsername || !discordId || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await appendToSheet(discordUsername, discordId, walletAddress);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error appending to sheet:', error);
    res.status(500).json({ error: 'Failed to append data to Google Sheet' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend live at http://localhost:${PORT}`));
