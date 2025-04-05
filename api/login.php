<?php
session_start();
require_once 'functions.php';
require_once '../config/database.php';

// Set headers to allow cross-origin requests (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

// Only allow POST requests for login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response('error', 'Invalid request method');
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['username']) || !isset($data['password'])) {
    send_response('error', 'Username and password are required');
}

$username = sanitize_input($data['username']);
$password = $data['password'];

// Check for hardcoded admin user first
if ($username === 'admin' && $password === 'admin123') {
    $adminUser = [
        'user_id' => 1,
        'username' => 'admin',
        'email' => 'admin@example.com',
        'first_name' => 'Admin',
        'last_name' => 'User',
        'role' => 'admin'
    ];
    $_SESSION['user'] = $adminUser;
    send_response('success', 'Login successful', $adminUser);
}

try {
    // Check for regular user in database
    $stmt = $conn->prepare("SELECT user_id, username, email, first_name, last_name, role FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Get the password hash separately
        $stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $passwordData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (password_verify($password, $passwordData['password'])) {
            $_SESSION['user'] = $user;
            send_response('success', 'Login successful', $user);
        } else {
            send_response('error', 'Invalid username or password');
        }
    } else {
        send_response('error', 'Invalid username or password');
    }
} catch (PDOException $e) {
    send_response('error', 'Database error: ' . $e->getMessage());
}
?> 