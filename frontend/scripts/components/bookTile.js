export function createBookTile(book) {
  const div = document.createElement("div");
  div.className = "book-tile";
  div.innerHTML = `
    <img src="${
      book.cover_url || "assets/default-image.jpg"
    }" alt="Cover" class="book-cover">
    <h3>${book.title}</h3>
    <p>by ${book.author}</p>
    <p>Subjects: ${book.subject || book.genre}</p>
  `;

  // Make the tile clickable
  div.style.cursor = "pointer";
  div.addEventListener("click", () => {
    // Store selected book in localStorage
    localStorage.setItem("selectedBook", JSON.stringify(book));

    // Force hash to change by clearing it first
    if (window.location.hash === "#book") {
      window.location.hash = ""; // Clear hash
      setTimeout(() => {
        window.location.hash = "#book";
      }, 0);
    } else {
      window.location.hash = "#book";
    }
  });

  return div;
}
