<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($data['action']) && $data['action'] === 'signup') {
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $fname = $data['fname'] ?? '';
        $lname = $data['lname'] ?? '';
        $role = $data['role'] ?? '';

        // Validate input
        if (empty($username) || empty($email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
            exit;
        }

        try {
            // Check if username or email already exists
            $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'error', 'message' => 'Username or email already exists']);
                exit;
            }
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Insert new user
            $stmt = $conn->prepare("INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$username, $email, $password, $fname, $lname, $role]);

            echo json_encode(['status' => 'success', 'message' => 'Account created successfully']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?> 