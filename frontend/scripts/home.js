import { createBookTile } from "./components/bookTile.js";

export async function init() {
  console.log("Home Script loaded!");

  var token = localStorage.getItem("access_token");
  var currentUser = localStorage.getItem("current_user");
  if (token && currentUser) {
    document.getElementById(
      "welcomeUser"
    ).textContent = `Welcome, ${currentUser}!`;

    // Fetch and display recommendations
    // Unfortunately, we've had to do a secondary query to get book covers as they we're not included in the recommendation response
    // This could be optimized in the future by modifying the backend to include cover URLs in the recommendation response
    getFiveStarRecommendations(token);
    getMyRecommendations(token);
  }
}

function getFiveStarRecommendations(token) {
  fetch("http://localhost:3000/api/recommendation", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then(async (data) => {
      // Filter for 5-star books
      const fiveStarBooks = data.data.filter((book) => book.rating === 5);

      // Shuffle the array and take 5 random books
      const shuffled = fiveStarBooks.sort(() => 0.5 - Math.random());
      const randomFive = shuffled.slice(0, 5);

      const listDiv = document.getElementById("fiveStarBooksList");
      if (listDiv) {
        if (randomFive.length === 0) {
          listDiv.innerHTML = "<p>No 5-star books found.</p>";
        } else {
          // For each book, fetch cover id and then render
          for (const book of randomFive) {
            try {
              const res = await fetch(
                `https://openlibrary.org/works/${book.work_id}/editions.json`
              );
              const editionData = await res.json();
              let coverId = null;
              if (
                editionData.entries &&
                editionData.entries.length > 0 &&
                editionData.entries[0].covers &&
                editionData.entries[0].covers.length > 0
              ) {
                coverId = editionData.entries[0].covers[0];
                book.cover_url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
              }
            } catch (e) {}
            listDiv.appendChild(createBookTile(book));
          }
        }
      }

      console.log("5-star books (newest to oldest):", randomFive);
    })
    .catch((err) => {
      console.log("Error fetching recommendations:", err.message);
    });
}

function getMyRecommendations(token) {
  fetch("http://localhost:3000/api/my-recommendation", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then(async (response) => {
      const listDiv = document.getElementById("myRecommendationsBookList");
      if (listDiv) {
        if (response.data.length === 0) {
          listDiv.innerHTML = "<p>You have no recommendations.</p>";
        } else {
          // For each book, fetch cover id and then render
          for (const book of response.data) {
            try {
              const res = await fetch(
                `https://openlibrary.org/works/${book.work_id}/editions.json`
              );
              const editionData = await res.json();
              let coverId = null;
              if (
                editionData.entries &&
                editionData.entries.length > 0 &&
                editionData.entries[0].covers &&
                editionData.entries[0].covers.length > 0
              ) {
                coverId = editionData.entries[0].covers[0];
                book.cover_url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
              }
            } catch (e) {}
            listDiv.appendChild(createBookTile(book));
          }
        }
      }
    })
    .catch((err) => {
      console.log("Error fetching recommendations:", err.message);
    });
}
