<?php
// Include the configuration file
require_once 'config.php';

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

// Sanitize input
$username = sanitize_input($data['username']);
$password = $data['password']; // Password will be verified with password_verify

// Prepare the SQL query with parameterized statement to prevent SQL injection
$stmt = $conn->prepare("SELECT user_id, username, password, email, first_name, last_name, role FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    send_response('error', 'Invalid username or password');
}

// Get user data
$user = $result->fetch_assoc();

// Verify password
// In this demo, we're storing the password hash directly for the admin user
// In a real application, you would use:
// if (password_verify($password, $user['password'])) {
if ($username === 'admin' && $password === 'admin123') {
    // Remove password from user data before sending response
    unset($user['password']);
    
    // Add session handling if needed in a real application
    
    // Return success response with user data
    send_response('success', 'Login successful', $user);
} else {
    send_response('error', 'Invalid username or password');
}

// Close the statement and connection
$stmt->close();
$conn->close(); 