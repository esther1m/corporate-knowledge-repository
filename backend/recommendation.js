const express = require('express');
const router = express.Router();
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./authMiddleware'); // import your middleware


// GET all recommendation (public)
router.get('/recommendation', authMiddleware, async (req, res) => {
  try { 
  const { data, error } = await supabase
  .from('recommendations')
  .select('*');

  if (error) return res.status(400).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'No recommendations found' });

  res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get /recommendation - only logged in user sees their own
router.get('/my-recommendation', authMiddleware, async (req, res) => {
  try {
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
      .from('recommendations')
      .select('*')
      .eq('employee_id', employee_id);

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'No recommendations found for this employee' });

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /recommendation (protected)
router.post('/recommendation', authMiddleware, async (req, res) => {
  const { work_id, rating, review, title, genre, author  } = req.body;

  try {
    //Finding or creating emplotee profile linked to the user_id 
    let { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('employee_id')
    .eq('user_id', req.user.id)
    .single();

    if (!employee) {
      //Auto-create profile if it does not exist 
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
          return res.status(400).json({ error: createError.message});
        }

        employee = newEmployee;
    }

    const employee_id = employee.employee_id;

    // Validate required fields
  if (!work_id || !rating || !review || !title || !employee_id || !genre || !author) {
    return res.status(400).json({ error: 'All fields are required.' });

  }

  // Insert recommendation including employee_id
  const { data, error } = await supabase
    .from('recommendations')
    .insert([{ 
      work_id, 
      rating, 
      review, 
      title, 
      genre,
      author,
      employee_id
    }]).select();

  if (error) {
    return res.status(400).json({ error: error.message });}

  res.json({ message: 'Recommendation added!', data });
 } catch (err) {
  console.log(err);
  res.status(500).json({ error: 'Internal server error' });

 }
});

//Delete recommendations by employee_id
router.delete('/recommendation', authMiddleware, async (req, res) => {
  try {
    //Finding employee_id linked to the user_id 
    const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('employee_id')
    .eq('user_id', req.user.id)
    .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee profile not found for this user' });
    }

  const employee_id = employee.employee_id;

  //Deleting recommendations for that employee_id

  const { data, error } = await supabase
    .from('recommendations')
    .delete()
    .eq('employee_id', employee_id)
    .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No recommendations found for this employee' });
    }

    res.json({ message: `Recommendations for employee ${employee_id} deleted successfully`, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;

