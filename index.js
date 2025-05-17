// server.js or index.js (your Express backend)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.get('/auth/discord', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(redirect);
});

app.get('/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    // Exchange code for token
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      scope: 'identify email',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenRes.data.access_token;

    // Use token to get user info
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userRes.data;

    // Send user info or generate your own session/jwt here
    res.json({ user });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error during Discord OAuth');
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));