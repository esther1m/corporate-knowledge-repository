console.log("Main Script loaded!");

window.addEventListener("hashchange", () => {
  const page = window.location.hash.slice(1) || "home";
  loadPage(`pages/${page}.html`);
  updateActiveNavLink();
});

// Inject navbar 
fetch("components/navbar.html")
  .then((response) => response.text())
  .then((html) => {
    document.getElementById("navbar").innerHTML = html;

    document.getElementById("navbar").addEventListener("click", function (e) {
      // Check if an anchor tag was clicked
      if (e.target.tagName === "A") {
        e.preventDefault();
        const page = e.target.getAttribute("href");
        loadPage(`pages/${page}`);

        // Remove 'active' from all links, then add to the clicked one
        document
          .querySelectorAll("#navbar a")
          .forEach((link) => link.classList.remove("active"));
        e.target.classList.add("active");
      }
    });

    // Call updateActiveNavLink after navbar is injected
    updateActiveNavLink();
  });

let currentPage = null;

function loadPage(page) {
  if (currentPage === page) return;
  currentPage = page;

  // Check auth first - if not auth page and no token, redirect to auth
  const token = localStorage.getItem("access_token");
  if (page !== "pages/auth.html" && !token) {
    console.log("No token found, redirecting to auth");
    currentPage = "pages/auth.html";
    loadPage("pages/auth.html");
    return;
  }

  fetch(page)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("content").innerHTML = html;

      if (page === "pages/home.html") {
        import("/frontend/scripts/home.js").then((module) => {
          module.init();
        });
      }
      
      if (page === "pages/book.html") {
        import("/frontend/scripts/book.js").then((module) => {
          module.init();
        });
      }

      if (page === "pages/recommendations.html") {
        import("/frontend/scripts/recommendations.js").then((module) => {
          module.init();
        });
      }
      
      
      if (page === "pages/search.html") {
        import("/frontend/scripts/search.js").then((module) => {
          module.init();
        });
      }

      if (page === "pages/auth.html") {
        import("/frontend/scripts/auth.js").then((module) => {
          module.init();
        });
      }
    });
}

async function checkAuthAndInitialize() {
  var token = localStorage.getItem("access_token");
  if (token) {
    try {
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("current_user");
          console.log("Session expired. Please log in again.");
          loadPage("pages/auth.html");
        }
        return;
      }

      const data = await res.json();
      const currentUser =
        data.profile.first_name + " " + data.profile.last_name;
      localStorage.setItem("current_user", currentUser);
      console.log("Current user:", currentUser);

      // Load home page only on initial auth
      loadPage("pages/home.html");
    } catch (err) {
      console.log("Error:", err.message);
    }
  } else {
    loadPage("pages/auth.html");
    console.log("No access token found, user not logged in.");
  }
}

function updateActiveNavLink() {
  // Get current page from hash or default to 'home'
  const currentPage = window.location.hash.slice(1) || 'home';
  const navLinks = document.querySelectorAll('.navbar a');
  
  navLinks.forEach(link => {
      link.classList.remove('active');
      // Get href without .html and potential path prefix
      const href = link.getAttribute('href').split('.')[0];
      if (href === currentPage) {
          link.classList.add('active');
      }
  });
}

// Call once on initial load
updateActiveNavLink();

// Call the auth check only once when the script loads
checkAuthAndInitialize();
