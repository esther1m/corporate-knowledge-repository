require('dotenv').config(); // Load .env variables
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase client using anon key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


// POST /signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

//Trim spaces and clean the input 
const emailClean = req.body.email?.trim();
const passwordClean = req.body.password?.trim();

//Validating the required fields 
  if (!emailClean || !passwordClean) 
    return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase.auth.signUp({ email: emailClean, password: passwordClean });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Signup successful', data });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) 
    return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Login successful', data });
});


//Logout 
router.post('/logout', async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: 'Access token required' });

    // Sign out using Supabase
    const { error } = await supabase.auth.signOut({ token: access_token });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
