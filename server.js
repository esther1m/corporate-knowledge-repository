const express = require('express');
const app = express();
const port = 3000;
 
 
 
app.get('/api/greeting', (req, res) => {
  res.json({
    message: 'Hello from Express!',
    time: new Date().toISOString()
  });
});
 
 
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});