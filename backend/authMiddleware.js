const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) { 
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);
    console.log('Supabase getUser result:', data, error);

    if (error || !data?.user) { 
    return res.status(401).json({ error: 'Invalid or expired token' });
    } 
    //Allowing the user_id to be generated from supabase
    req.user = data.user;
    next();
  }
  catch (err) {
    console.error('Middleware error: ', err);
  return res.status (500).json({ error: err.message });
 }
 
};

module.exports = authMiddleware;
