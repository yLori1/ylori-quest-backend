import express from 'express';
import { supabase } from '../utils/supabaseClient.js';  // adjust path if needed
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, id } = req.body;

  if (!username || !id) {
    return res.status(400).json({ error: 'Missing username or id' });
  }

  try {
    // Check if user is already logged in Supabase table `discord_users`
    const { data: existingUsers, error: fetchError } = await supabase
      .from('discord_users')
      .select('discord_id')
      .eq('discord_id', id)
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(200).json({ message: 'User already logged' });
    }

    // Insert new user record
    const { data, error: insertError } = await supabase
      .from('discord_users')
      .insert([{
        discord_username: username,
        discord_id: id,
        timestamp: new Date().toISOString(),
      }]);

    if (insertError) {
      throw insertError;
    }

    res.status(200).json({ message: 'Discord user logged successfully' });
  } catch (err) {
    console.error('💥 Error writing to Supabase:', err);
    res.status(500).json({
      error: 'Failed to write to Supabase',
      details: err.message || String(err),
    });
  }
});

export default router;
