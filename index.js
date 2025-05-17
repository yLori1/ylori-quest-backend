import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { appendToSheet } from './googleSheet.js';
import discordUserRoute from './routes/discordUser.js';

dotenv.config();

const {
  FRONTEND_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
} = process.env;

if (!FRONTEND_URL || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
  console.error('❌ Missing required environment variables in .env');
  process.exit(1);
}

const app = express();

// ✅ Updated CORS setup: allow HTTPS frontend and optionally localhost for dev
app.use(cors({
  origin: ['https://quest.ylori.site', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

// Discord OAuth2 redirect
app.get('/auth/discord', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(redirect);
});

// Discord OAuth2 callback
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

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { username, discriminator, id } = userResponse.data;

    res.redirect(`${FRONTEND_URL}/discord/callback?username=${encodeURIComponent(username)}&discriminator=${discriminator}&id=${id}`);
  } catch (err) {
    console.error('🔴 Discord OAuth error:', err.response?.data || err.message);
    res.status(500).send('Error during Discord OAuth');
  }
});

// Endpoint to append wallet + Discord user info to Google Sheet
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

// Other API routes
app.use('/api', discordUserRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend live at http://localhost:${PORT}`));
