import { createBookTile } from './components/bookTile.js';

async function handleSearchSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("titleInput").value;
  const author = document.getElementById("authorInput").value;
  const subject = document.getElementById("subjectInput").value;
  const queryParams = new URLSearchParams();
  if (title) queryParams.append("title", title.toLowerCase());
  if (author) queryParams.append("author", author.toLowerCase());
  if (subject) queryParams.append("subject", subject.toLowerCase());


  fetch("http://localhost:3000/search?" + queryParams.toString())
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("bookList");
      list.innerHTML = "";
      if (data.books && data.books.length) {
        data.books.forEach((book) => {
          const tile = createBookTile(book);
          list.appendChild(tile);
        });
      } else {
        list.innerHTML = "<li>No books found.</li>";
      }
    });
}

export async function init() {
  const submitButton = document.getElementById("searchForm");
  if (submitButton) {
    submitButton.onsubmit = handleSearchSubmit;
  }
}

