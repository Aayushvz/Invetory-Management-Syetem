<?php
session_start();

// Clear session
session_destroy();

// Clear localStorage and redirect
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <script>
        localStorage.removeItem('user');
        window.location.href = 'login.php';
    </script>
</head>
<body>
    <p>Logging out...</p>
</body>
</html> 