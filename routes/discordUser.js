import express from 'express';
import { supabase } from '../utils/supabaseClient.js';
import dotenv from 'dotenv';


dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  const { discordId, walletAddress, questCompleted, discordUsername } = req.body;

  if (!discordId || !walletAddress || questCompleted === undefined) {
    return res.status(400).json({ error: 'Missing fields in request' });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('discord_users')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(500).json({ error: fetchError.message });
    }

    if (existingUser) {
      return res.status(200).json({ message: 'User already exists' });
    }

    // Insert new user data
    const { data, error } = await supabase.from('discord_users').insert([
      {
        discord_id: discordId,
        discord_username: discordUsername || null,
        wallet_address: walletAddress,
        quest_completed: questCompleted,
      },
    ]);

    if (error) throw error;

    res.status(200).json({ message: 'Quest recorded successfully', user: data });
  } catch (err) {
    console.error('Error writing to Supabase:', err);
    res.status(500).json({ error: 'Failed to record quest in Supabase' });
  }
});

export default router;
