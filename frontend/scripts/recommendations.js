export async function init() {
  console.log("Recommendations Script loaded!");

  var token = localStorage.getItem("access_token");
  var currentUser = localStorage.getItem("current_user");
  if (token && currentUser) {
    getAllRecommendations(token);
  }
}

function filterRecommendations(recommendations) {
  const starFilter = parseInt(document.getElementById("starFilter").value);
  const genreFilter = document
    .getElementById("genreFilter")
    .value.toLowerCase()
    .trim();

  return recommendations.filter((rec) => {
    // Filter for star rating
    const matchesStars = starFilter === 0 || rec.rating === starFilter;

    // Check if genre text is included in the book's genre
    const matchesGenre =
      genreFilter === "" || rec.genre.toLowerCase().includes(genreFilter);

    return matchesStars && matchesGenre;
  });
}

function setupFilters(recommendations) {
  const form = document.getElementById("filterForm");
  const inputs = form.querySelectorAll("input, select");
  const clearBtn = document.getElementById("clearFilters");

  // Prevent form submission and thus page reload
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // Clear filter button
  clearBtn.addEventListener("click", () => {
    document.getElementById("starFilter").value = "0";
    document.getElementById("genreFilter").value = "";
    renderRecommendations(recommendations);
  });

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      const filtered = filterRecommendations(recommendations);
      renderRecommendations(filtered);
    });

    // Add input event for text field to enable real-time filtering
    if (input.type === "text") {
      input.addEventListener("input", () => {
        const filtered = filterRecommendations(recommendations);
        renderRecommendations(filtered);
      });
    }
  });
}

function renderRecommendations(recommendations) {
  const listDiv = document.getElementById("bookList");
  if (listDiv) {
    listDiv.innerHTML = "";
    if (recommendations.length === 0) {
      listDiv.innerHTML = "<p>No recommendations match your filters.</p>";
    } else {
      recommendations.forEach((recommendation) => {
        listDiv.appendChild(createRecommendationCard(recommendation));
      });
    }
  }
}

function getAllRecommendations(token) {
  fetch("http://localhost:3000/api/recommendation", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then(async (response) => {
      if (response.data) {
        setupFilters(response.data);
        renderRecommendations(response.data);
      }
    })
    .catch((err) => {
      console.log("Error fetching recommendations:", err.message);
    });
}

function createRecommendationCard(recommendation) {
  const card = document.createElement("div");
  card.className = "recommendation-card";

  const stars =
    "★".repeat(recommendation.rating) + "☆".repeat(5 - recommendation.rating);

  card.innerHTML = `
        <div class="recommendation-header">
            <div class="recommendation-info">
                <h3 class="recommendation-title">${recommendation.title}</h3>
                <div class="recommendation-meta">by ${recommendation.author}</div>
            </div>
            <div class="recommendation-stars">${stars}</div>
        </div>
        <div class="recommendation-review">${recommendation.review}</div>
        <div class="recommendation-genre">${recommendation.genre}</div>
    `;

  // Add click handler to navigate to book page
  card.addEventListener("click", async () => {
    // Get the cover image for the clicked book.
    try {
      const res = await fetch(
        `https://openlibrary.org/works/${recommendation.work_id}/editions.json`
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
        recommendation.cover_url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
      }
    } catch (e) {}

    // Store selected book in localStorage - so book.js can load it
    localStorage.setItem("selectedBook", JSON.stringify(recommendation));

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
  return card;
}
