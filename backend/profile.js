const express = require('express');
const router = express.Router();
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./authMiddleware');

// GET current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // "no rows returned" case
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.json({ exists: false });
    }

    res.json({ exists: true, profile: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST or UPDATE profile
router.post('/profile', authMiddleware, async (req, res) => {
  const { first_name, last_name, position, department } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  try {
    // upsert: if profile exists, update it; otherwise insert
    const { data, error } = await supabase
      .from('employees')
      .upsert([{
        user_id: req.user.id,
        first_name,
        last_name,
        position,
        department
      }], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Profile saved successfully', profile: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
