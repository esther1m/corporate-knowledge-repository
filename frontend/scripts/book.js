function getAgeString(dateString) {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  }
}

function getStarRating(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

let selectedBook = null;

export async function init() {
  const book = JSON.parse(localStorage.getItem("selectedBook"));
  if (book) {
    selectedBook = book;
    console.log("Book Script loaded!", book);

    const titleElem = document.getElementById("bookTitle");
    const authorElem = document.getElementById("bookAuthor");
    const coverElem = document.getElementById("bookCover");
    if (titleElem) titleElem.textContent = book.title;
    if (authorElem) authorElem.textContent = `by ${book.author}`;
    if (coverElem) {
      coverElem.src = book.cover_url || "assets/default-image.jpg";
      coverElem.alt = `Cover of ${book.title}`;
    }

    const container = document.getElementById("reviews");
    if (container) {
      container.innerHTML = ""; // Clear previous content

      console.log("Fetching reviews for book:", book.work_id);

      // Fetch reviews for this book
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:3000/api/reviews/${selectedBook.work_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      const reviewsData = await res.json();

      // Create reviews list
      const reviewsDiv = document.createElement("div");
      if (reviewsData.data && reviewsData.data.length > 0) {
        const ul = document.createElement("ul");
        reviewsData.data.forEach((review) => {
          const li = document.createElement("li");
          li.className = "review-item";
          li.innerHTML = `
    <div class="review-header">
      <div>
        <div class="stars-display">${getStarRating(review.rating)}</div>
      </div>
      <div class="review-meta">
        <em>Posted ${getAgeString(review.created_at)}</em>
      </div>
    </div>
    <div class="review-comment">${review.comment}</div>
  `;
          ul.appendChild(li);
        });

        reviewsDiv.appendChild(ul);
      } else {
        reviewsDiv.innerHTML +=
          "<p>No reviews found for this book - be the first to add one!</p>";
      }
      container.appendChild(reviewsDiv);
    } else {
      console.log("No reviews container found.");
    }
  }

  const btn = document.getElementById("addReviewBtn");
  const formSection = document.getElementById("reviewFormSection");
  const cancelBtn = document.getElementById("cancelReview");
  const form = document.getElementById("reviewForm");

  if (btn) {
    btn.onclick = () => {
      formSection.classList.remove("hidden");
      btn.classList.add("hidden");
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      formSection.classList.add("hidden");
      btn.classList.remove("hidden");
      form.reset();
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const rating = document.querySelector(
        'input[name="rating"]:checked'
      ).value;
      const comment = document.getElementById("comment").value;
      const isRecommended = document.getElementById("recommended").checked; // Get checkbox state
      const token = localStorage.getItem("access_token");

      const reviewBody = {
        work_id: selectedBook.work_id,
        rating: parseInt(rating),
        comment: comment,
        author: selectedBook.author || "Unknown Author",
      };

      console.log(
        "Submitting review:",
        reviewBody,
        "Recommended:",
        isRecommended
      );

      try {
        const response = await fetch("http://localhost:3000/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(reviewBody),
        });

        if (response.ok) {
          formSection.classList.add("hidden");
          btn.classList.remove("hidden");
          form.reset();
          // Refresh reviews
          init();
        } else {
          alert("Failed to submit review");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        alert("Error submitting review");
      }

      // If checkbox is checked, also submit recommendation
      if (isRecommended) {

        // Not sure why we need all these duplicated fields, but backend seems to expect them
        const recommendationBody = {
          work_id: selectedBook.work_id,
          rating: parseInt(rating),
          review: comment,
          title: selectedBook.title || "Unknown Title",
          genre: selectedBook.subject || selectedBook.genre || "Unknown Genre",
          author: selectedBook.author || "Unknown Author",
        };

        try {
          const recResponse = await fetch(
            "http://localhost:3000/api/recommendation",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify(recommendationBody),
            }
          );
          if (recResponse.ok) {
            console.log("Recommendation added successfully");
          } else {
            console.error("Failed to add recommendation");
          }
        } catch (error) {
          console.error("Error submitting recommendation:", error);
        }
      }
    };
  }
} // end of init function
