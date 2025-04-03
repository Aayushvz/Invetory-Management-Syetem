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

      // In a real application, you would make an AJAX request to a backend server
      // For this demo, we'll use a simple check for the admin user created in the database
      if (username === "admin" && password === "admin123") {
        // Store user information in localStorage (in a real app, you would use a JWT token or session)
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            username: username,
            role: "admin",
            firstName: "Admin",
            lastName: "User",
          })
        );

        // Redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        showError("Invalid username or password");
      }
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
