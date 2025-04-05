document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Validate inputs
      if (!username || !password) {
        showError("Please enter both username and password");
        return;
      }

      // Make API call to login endpoint
      fetch("api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            // Store user information in localStorage
            localStorage.setItem("user", JSON.stringify(data.data));

            // Redirect to dashboard
            window.location.href = "dashboard.html";
          } else {
            showError(data.message || "Invalid username or password");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          showError("An error occurred during login. Please try again.");
        });
    });
  }

  function showError(message) {
    loginError.textContent = message;
    loginError.style.display = "block";

    // Clear error after 3 seconds
    setTimeout(() => {
      loginError.textContent = "";
      loginError.style.display = "none";
    }, 3000);
  }

  // Check if user is already logged in
  const currentUser = localStorage.getItem("user");
  if (currentUser) {
    // Redirect to dashboard if already logged in
    window.location.href = "dashboard.html";
  }
});
