document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  function checkAuth() {
    const user = localStorage.getItem("user");
    if (!user) {
      // Redirect to login page if not logged in
      window.location.href = "index.html";
    }
    return JSON.parse(user);
  }

  // Set user info in the header and sidebar
  function setUserInfo(user) {
    const headerUserEl = document.getElementById("headerUser");
    const sidebarUserEl = document.getElementById("sidebarUser");

    if (headerUserEl) {
      headerUserEl.textContent = `Welcome, ${user.firstName} ${user.lastName}`;
    }

    if (sidebarUserEl) {
      sidebarUserEl.textContent = `${user.firstName} ${user.lastName}`;
    }
  }

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Clear user data from localStorage
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "index.html";
    });
  }

  // Initialize authentication
  const currentUser = checkAuth();
  if (currentUser) {
    setUserInfo(currentUser);
  }
});
