require('dotenv').config();

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase service role key is missing from .env');
}

const express = require('express');
const app = express();
const searchRoutes = require('./search'); 
//const { supabase } = require("./supabaseClient");
const authRoutes = require('./authRoutes');
console.log('Loading authRoutes...');

const port = process.env.PORT || 3000;
console.log('Supabase URL:', process.env.SUPABASE_URL);


app.use(express.json());


app.get("/", (req, res) => {
  res.status(200).send("Hello registration");
});

app.use('/api/books/search', searchRoutes);
app.use('/auth', authRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

console.log('NODE_EXTRA_CA_CERTS:', process.env.NODE_EXTRA_CA_CERTS);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});


