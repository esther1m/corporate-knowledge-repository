import express from 'express';
import {supabase} from './supabaseClient.js';

const router = express.Router();

// GET all reviews
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*');

  if (error) {
    console.error(' Error fetching reviews:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

//POST a new review
router.post('/', async (req, res) => {
    const { content, employee_id } = req.body;

    const { data, error } = await supabase
    .from('reviews')
    .insert([{ content, employee_id, published: true }]);

    if (error) {
        console.error('Error inserting review:', error.message);
        return res.status(500).json({ error: error.message});
    }

    res.status(201).json(data);
});
export default router; 