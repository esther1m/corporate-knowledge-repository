require('dotenv').config();

const express = require('express');
const app = express();

const searchRoutes = require('./search'); 
const recommendationRoutes = require ('./recommendation');
const authRoutes = require('./authRoutes');

console.log('Loading authRoutes...');

const port = process.env.PORT || 3000;

app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("Hello registration");
});

//Mount routes 
app.use('/api/search', searchRoutes);
app.use('/auth', authRoutes);
app.use('/api', recommendationRoutes);

//Error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});


