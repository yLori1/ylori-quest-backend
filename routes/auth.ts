// backend/routes/auth.ts
import express from 'express';
import axios from 'axios';
import qs from 'qs';

const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!; // e.g. http://localhost:5173/discord/callback

router.get('/discord/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify email'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch user info from Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // TODO: create or fetch user in your DB here
    const user = userResponse.data;

    // For demo, just return user info
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user from Discord' });
  }
});

export default router;
