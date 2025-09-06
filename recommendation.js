const express = require('express');
const router = express.Router();
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./authMiddleware'); // import your middleware

// POST /recommendation (protected)
router.post('/recommendation', authMiddleware, async (req, res) => {
  const { work_id, rating, review, title, employee_id, department } = req.body;

  if (!work_id || !rating || !review || !title || !employee_id || !department) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  // const { data: user, error: userError } = await supabase.auth.getUser();
  // if (userError) {
  //   console.log(userError)
  //   return res.status(400).json({ error: userError.message });
  // }
 
  const { data, error } = await supabase
    .from('recommendations')
    .insert([{ 
      work_id, 
      rating, 
      review, 
      title, 
      employee_id,
      department,
    }]).select();

  if (error) {
    console.log(error)
    return res.status(400).json({ error: error.message });}

  return res.json({ message: 'Recommendation added!', data });
});

module.exports = router;

