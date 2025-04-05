<?php
// Function to send JSON response
function send_response($status, $message, $data = null) {
    $response = [
        'status' => $status,
        'message' => $message,
        'data' => $data
    ];
    
    // Clear any previous output if output buffering is active
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    // Set JSON header
    header('Content-Type: application/json');
    
    // Send response
    echo json_encode($response);
    exit;
}

// Function to sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
} 