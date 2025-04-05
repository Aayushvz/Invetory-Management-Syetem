<?php
session_start();

// Check if user is logged in via session
if (!isset($_SESSION['user'])) {
    // If not in session, check localStorage via JavaScript
    echo '<script>
        const userData = localStorage.getItem("user");
        if (!userData) {
            window.location.href = "login.php";
        } else {
            const user = JSON.parse(userData);
            if (!user.first_name || !user.last_name) {
                window.location.href = "login.php";
            }
        }
    </script>';
    exit;
}

$user = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Inventory Management System</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>Welcome, <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></h1>
            <div class="user-info">
                <span class="role"><?php echo htmlspecialchars($user['role']); ?></span>
                <a href="logout.php" class="logout-btn">Logout</a>
            </div>
        </header>
        <!-- Add your dashboard content here -->
    </div>

    <script>
        // Sync localStorage with session data
        const sessionUser = <?php echo json_encode($user); ?>;
        localStorage.setItem('user', JSON.stringify(sessionUser));
    </script>
</body>
</html> 