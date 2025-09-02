const express = require('express');
const router = express.Router();

const {supabase} = require('./supabaseClient');

//Post 
router.post('/signup', async (req, res) => {
    console.log('Incoming signup request:', req.body);
    
    const {email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) return res.status(400).json({ error:error.message});

    res.status(200).json({ 
     message: 'Sign up is successful. Please check your email to confirm!'
    });
});

module.exports = router;