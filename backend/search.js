const express = require('express');
const https = require('https');
const router = express.Router();

router.get('/', (req, res) => {
  const { title, author, subject } = req.query;

  let query = '';
  if (title) query += `title=${title}&`;
  if (author) query += `author=${author}&`;
  if (subject) query += `subject=${subject}&`;

  const url = `https://openlibrary.org/search.json?${query}`;
  console.log('Requesting:', url);

  https.get(url, (response) => {
    let data = '';

    console.log('Status Code:', response.statusCode);

    console.log('Headers:', response.headers);

    response.on('data', chunk => data += chunk);

    response.on('end', () => {
      try { 
      const result = JSON.parse(data);

      const books = result.docs.slice(0, 10).map(book => ({
        title: book.title,
        author: book.author_name?.[0] || 'Unknown',
        subject: book.subject?. [0] || 'N/A', //pass back the requested subject
        work_id: book.key?.replace('/works/', ''),
        cover_url: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null
      }));

      res.json({ books });
    } catch (err) {
      console.error('Error parsing response:', err.message);
      res.status(500).json({ error: 'Invalid response from Open Library'})
    }
    });
  }).on('error', (err) => {
    console.error('Error fetching from Open Library:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from Open Library' });
  });
});

module.exports = router;
