// Inject navbar first
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
  });

let currentPage = null;

function loadPage(page) {
  if (currentPage === page) return; // Prevent reload if already on page
  currentPage = page;
  fetch(page)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("content").innerHTML = html;
    });

  if (page === "pages/auth.html") {
    // Remove any existing auth.js script
    const oldScript = document.getElementById("authScript");
    if (oldScript) oldScript.remove();

    // Dynamically load auth.js when auth.html is loaded
    const script = document.createElement("script");
    script.src = "scripts/auth.js";
    script.id = "authScript";
    document.body.appendChild(script);
    script.onload = () => console.log("auth.js loaded");
  }

  if (page === "pages/home.html") {
    // Remove any existing auth.js script
    const oldScript = document.getElementById("homeScript");
    if (oldScript) oldScript.remove();

    // Dynamically load auth.js when auth.html is loaded
    const script = document.createElement("script");
    script.src = "scripts/home.js";
    script.id = "homeScript";
    document.body.appendChild(script);
    script.onload = () => console.log("home.js loaded");
  }

   if (page === "pages/search.html") {
    // Remove any existing auth.js script
    const oldScript = document.getElementById("searchScript");
    if (oldScript) oldScript.remove();

    // Dynamically load auth.js when auth.html is loaded
    const script = document.createElement("script");
    script.src = "scripts/search.js";
    script.id = "searchScript";
    document.body.appendChild(script);
    script.onload = () => console.log("search.js loaded");
  }
}

// Load home.html on initial page load
loadPage("pages/home.html");
