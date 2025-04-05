<?php
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
    send_response('success', 'Login successful', [
        'user_id' => 1,
        'username' => 'admin',
        'email' => 'admin@example.com',
        'first_name' => 'Admin',
        'last_name' => 'User',
        'role' => 'admin'
    ]);
}

try {
    // Check for regular user in database
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Remove password from user data before sending
        unset($user['password']);
        send_response('success', 'Login successful', $user);
    } else {
        send_response('error', 'Invalid username or password');
    }
} catch (PDOException $e) {
    send_response('error', 'Database error: ' . $e->getMessage());
}
?> 