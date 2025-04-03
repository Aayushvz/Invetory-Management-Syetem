document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
  
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
  
      // Basic validation
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
  
      if (password.length < 6) {
        alert("Password must be at least 6 characters long!");
        return;
      }
  
      try {
        const response = await fetch("api/auth.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "signup",
            username: username,
            email: email,
            password: password,
          }),
        });
  
        const data = await response.json();
  
        if (data.status === "success") {
          alert("Account created successfully! Please login.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Error creating account");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error creating account");
      }
    });
  });
  