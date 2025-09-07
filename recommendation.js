const express = require('express');
const router = express.Router();
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./authMiddleware'); // import your middleware


// GET all reviews (public)
router.get('/recommendation', async (req, res) => {
  const { data, error } = await supabase.from('recommendations').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /recommendation (protected)
router.post('/recommendation', authMiddleware, async (req, res) => {
  const { work_id, rating, review, title, employee_id, genre, author  } = req.body;

  if (!work_id || !rating || !review || !title || !employee_id || !genre || !author) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Insert review including user_id
  const { data, error } = await supabase
    .from('recommendations')
    .insert([{ 
      work_id, 
      rating, 
      review, 
      title, 
      employee_id,
      genre,
      author,
    }]).select();

  if (error) {
    console.log(error)
    return res.status(400).json({ error: error.message });}

  return res.json({ message: 'Recommendation added!', data });
});

module.exports = router;

