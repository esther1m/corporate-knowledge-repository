const express = require('express');
const router = express.Router();
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./authMiddleware');


// GET all reviews (public)
router.get('/reviews', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
    .from('reviews')
    .select('*');

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'No reviews found' });

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET reviews for a specific work_id (book)
router.get('/reviews/:work_id', authMiddleware, async (req, res) => {
  const { work_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('work_id', work_id);

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'No reviews found for this book' });

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET logged-in user's reviews (protected)
router.get('/my-reviews', authMiddleware, async (req, res) => {
  try {
    // Find employee_id for logged-in user
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('user_id', req.user.id)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee profile not found for this user' });
    }

    const employee_id = employee.employee_id;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('employee_id', employee_id);

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'No reviews found for this employee' });

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new review (protected)
router.post('/reviews', authMiddleware, async (req, res) => {
  const { work_id, rating, comment, author } = req.body;

  try {
    // Find or auto-create employee profile
    let { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('user_id', req.user.id)
      .single();

    if (!employee) {
      //Auto create profile if it does not exist
      const { data: newEmployee, error: createError } = await supabase
        .from('employees')
        .insert([{
          user_id: req.user.id,
          first_name: req.body.first_name || 'FirstName',
          last_name: req.body.last_name || 'LastName',
          position: req.body.position || 'Position',
          department: req.body.department || 'Department'
        }])
        .select()
        .single();

      if (createError) { 
        return res.status(400).json({ error: createError.message });
       }

      employee = newEmployee;
    }

    const employee_id = employee.employee_id;

    // Validate required fields
    if (!work_id || !rating || !comment || !employee_id || !author) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Insert review
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        work_id,
        rating,
        comment,
        employee_id,
        author,
        user_id: req.user.id
      }])
      .select();

    if (error) {
    return res.status(400).json({ error: error.message });}

    res.json({ message: 'Review added!', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE reviews (protected, optional)
router.delete('/reviews', authMiddleware, async (req, res) => {
  try {
    // Find employee_id for logged-in user
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('user_id', req.user.id)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee profile not found for this user' });
    }

    const employee_id = employee.employee_id;

    // Delete reviews belonging to this employee
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('employee_id', employee_id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) { 
    return res.status(404).json({ error: 'No reviews found for this employee' });
    }
    
    res.json({ message: `Reviews for employee ${employee_id} deleted successfully`, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
