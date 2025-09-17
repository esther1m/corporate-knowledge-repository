function handleSignupSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;
  const messageDiv = document.getElementById("authMessage");

  const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';

  console.log(`Submitting to ${endpoint}`);

  if (mode === 'login' && email) {
    // Handle signup logic here
    localStorage.setItem('user_email', email);
  }

  // fetch("http://localhost:3000/auth/signup", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     if (data.success) {
  //       messageDiv.textContent = "Signup successful!";
  //     } else {
  //       messageDiv.textContent = data.message || "Signup failed.";
  //     }
  //   })
  //   .catch(() => {
  //     messageDiv.textContent = "Error connecting to server.";
  //   });
}

var form = document.getElementById("signupForm");
if (form) {
  form.addEventListener("submit", handleSignupSubmit);
}

var mode = 'login';

var toggleBtn = document.getElementById('toggleBtn');
if (toggleBtn) {
  toggleBtn.onclick = function() {
    mode = mode === 'login' ? 'signup' : 'login';
    document.getElementById('formTitle').textContent = mode === 'login' ? 'Login' : 'Sign Up';
    document.getElementById('submitBtn').textContent = mode === 'login' ? 'Login' : 'Sign Up';
    document.getElementById('toggleBtn').textContent = mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login';
  }
}


//   if (data.access_token) {
//     console.log("Access Token:", data.access_token);
//     localStorage.setItem("access_token", data.access_token);
//   }
