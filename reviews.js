const express = require('express');
const router = express.Router();
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./authMiddleware');

// GET all reviews (public)
router.get('/reviews', async (req, res) => {
  const { data, error } = await supabase.from('reviews').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST a new review (protected)
router.post('/reviews', authMiddleware, async (req, res) => {
  const { work_id, rating, comment, employee_id, author } = req.body;

  if (!work_id || !rating || !comment || !employee_id || !author) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Get the logged-in user's Supabase ID
  const userId = req.user.id;

  // Insert review including user_id
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      work_id,
      rating,
      comment,
      employee_id,
      author,
      user_id: userId
    }]).select();

  if (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });}

    return res.json({ message: 'Review added!', data });
});

module.exports = router;
