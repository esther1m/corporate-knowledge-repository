const express = require('express');
const https = require('https');
const router = express.Router();

router.get('/', (req, res) => {
  const { title, author, subject } = req.query;

  let url;

  if (subject) {
    // Use Subjects API for subject-specific searches
    url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json`;
  } else {
    // Otherwise build query for Search API
    let query = '';
    if (title) query += `title=${title}&`;
    if (author) query += `author=${author}&`;
    url = `https://openlibrary.org/search.json?${query}`;
  }

  console.log('Requesting:', url);

  https.get(url, (response) => {
    let data = '';

    response.on('data', chunk => data += chunk);

    response.on('end', () => {
      try {
        const result = JSON.parse(data);

        let books;

        if (subject) {
          // Subjects API returns `works`
          books = result.works.slice(0, 10).map(book => ({
            title: book.title,
            author: book.authors?.[0]?.name || 'Unknown',
            subject: book.subject ? book.subject.join(', ') : subject,
            work_id: book.key?.replace('/works/', ''),
            cover_url: book.cover_id
              ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
              : null
          }));
        } else {
          // Search API returns `docs`
          books = result.docs.slice(0, 10).map(book => ({
            title: book.title,
            author: book.author_name?.[0] || 'Unknown',
            subject: book.subject ? book.subject.join(', ') : 'N/A',
            work_id: book.key?.replace('/works/', ''),
            cover_url: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : null
          }));
        }

        res.json({ books });
      } catch (err) {
        console.error('Error parsing response:', err.message);
        res.status(500).json({ error: 'Invalid response from Open Library' });
      }
    });
  }).on('error', (err) => {
    console.error('Error fetching from Open Library:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from Open Library' });
  });
});

module.exports = router;
