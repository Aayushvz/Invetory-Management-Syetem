<?php
// Include database configuration
require_once 'config.php';

// Test database connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query inventory items
$sql = "SELECT i.*, c.name as category_name 
        FROM inventory_items i 
        LEFT JOIN categories c ON i.category_id = c.category_id";
$result = $conn->query($sql);

// Format output as JSON
$items = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
}

// Output JSON
echo json_encode([
    'status' => 'success',
    'message' => 'Items retrieved',
    'data' => $items
], JSON_PRETTY_PRINT); 