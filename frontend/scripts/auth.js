var mode = "login";

// Event handler functions
function handleToggleMode() {
  mode = mode === "login" ? "signup" : "login";

  const loginForm = document.getElementById("loginForm");
  const signUpForm = document.getElementById("signUpForm");
  const formTitle = document.getElementById("formTitle");
  const toggleBtn = document.getElementById("toggleBtn");

  if (loginForm && signUpForm) {
    loginForm.hidden = mode !== "login";
    signUpForm.hidden = mode !== "signup";

    formTitle.textContent = mode === "login" ? "Login" : "Sign Up";
    toggleBtn.textContent =
      mode === "login" ? "Switch to Sign Up" : "Switch to Login";
  }
}

async function handleLogout() {
  let token = localStorage.getItem("access_token");
  if (token) {
    const res = await fetch(`http://localhost:3000/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    });

    if (res.ok) {
      console.log("Logged out successfully");
      const data = await res.json();
      console.log("Response Data:", data);

      localStorage.removeItem("access_token");
      localStorage.removeItem("current_user");

      document.getElementById("authMessage").textContent = "Logged out!";
      init();
    }
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  const messageDiv = document.getElementById("authMessage");

  const endpoint = mode === "signup" ? "auth/signup" : "auth/login";

  try {
    const res = await fetch(`http://localhost:3000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      messageDiv.textContent =
        "User " +
        (mode === "signup" ? "registered" : "logged in") +
        " successfully!";
      console.log("Response OK");
      const data = await res.json();
      console.log("Response Data:", data);

      if (data.data.session.access_token) {
        console.log("Access Token:", data.data.session.access_token);
        localStorage.setItem("access_token", data.data.session.access_token);

        // Fetch profile data after login to get user name
        if (mode === "login") {
          try {
            const profileRes = await fetch(
              "http://localhost:3000/api/profile",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + data.data.session.access_token,
                },
              }
            );

            // Shouldn't get here as we just logged in
            if (!profileRes.ok) {
              if (profileRes.status === 401) {
                console.error("Session expired. Please log in again.");
              }
              return;
            }

            const profileData = await profileRes.json();
            const currentUser =
              profileData.profile.first_name +
              " " +
              profileData.profile.last_name;
            localStorage.setItem("current_user", currentUser);
            window.location.hash = "#home";
          } catch (err) {
            console.error("Profile fetch error:", err);
            return;
          }
        }
      }
    }
  } catch (err) {
    console.error("Login/Signup error:", err);
    messageDiv.textContent =
      "Error during " + (mode === "signup" ? "registration" : "login");
  }
}

// For some reason, the deleting endpoints delete all reviews or all recommendations, not just for the user,
// so as a workaround for now, I added a "delete all" button we just confirm with the user and call both endpoints
async function handleDeleteData(e) {
  e.preventDefault();

  const isConfirmed = window.confirm(
    "Are you sure you want to delete all your reviews and recommendations? This action cannot be undone."
  );

  if (!isConfirmed) {
    return;
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const recResponse = await fetch("http://localhost:3000/api/recommendation", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const reviewsResponse = await fetch("http://localhost:3000/api/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      // Check both responses - 404 is OK as it means no data exists
      const isSuccess = (response) => response.ok || response.status === 404;

      if (isSuccess(recResponse) && isSuccess(reviewsResponse)) {
        console.log("User data deletion completed");
        alert("Your data has been cleared successfully.");
      } else {
        // Handle other error cases
        const recData = await recResponse.json();
        const reviewsData = await reviewsResponse.json();
        console.error("Delete errors:", { recData, reviewsData });
        alert("There was an error clearing your data. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting user data:", error);
      alert("Failed to clear data. Please try again.");
    }
  }
}

export async function init() {
  mode = "signup";
  handleToggleMode();

  // Attach form submit handlers
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleSignupSubmit);
  }

  const signUpForm = document.getElementById("signUpForm");
  if (signUpForm) {
    signUpForm.addEventListener("submit", handleSignupSubmit);
  }

  // Attach toggle button handler
  const toggleBtn = document.getElementById("toggleBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", handleToggleMode);
  }

  // Attach logout button handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  const deleteDataBtn = document.getElementById("deleteDataBtn");
  if (deleteDataBtn) {
    deleteDataBtn.addEventListener("click", handleDeleteData);
  }

  const formTitle = document.getElementById("formTitle");

  // Show/hide logout button based on auth state
  const token = localStorage.getItem("access_token");
  if (logoutBtn) {
    if (token) {
      formTitle.textContent = "Welcome!";
      logoutBtn.hidden = false;
      loginForm.hidden = true;
      signUpForm.hidden = true;
      toggleBtn.hidden = true;
      deleteDataBtn.hidden = false;
    } else {
      formTitle.textContent = "Login";
      logoutBtn.hidden = true;
      deleteDataBtn.hidden = true;
      handleToggleMode(); // This will show the appropriate form
    }
  }
}
