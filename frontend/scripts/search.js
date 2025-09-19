console.log("Search Script loaded!");

var submitButton = document.getElementById("searchForm");

if (submitButton) {
  submitButton.onsubmit = function (e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const subject = document.getElementById("subject").value;
    const queryParams = new URLSearchParams();
    if (title) queryParams.append("title", title);
    if (author) queryParams.append("author", author);
    if (subject) queryParams.append("subject", subject);

    console.log("Searching for:", queryParams.toString());

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
  };
}

function createBookTile(book) {
  const div = document.createElement("div");
  div.className = "book-tile";
  div.innerHTML = `
    <img src="${
      book.cover_url || "default-cover.jpg"
    }" alt="Cover" class="book-cover">
    <h3>${book.title}</h3>
    <p>by ${book.author}</p>
  `;
  return div;
}
