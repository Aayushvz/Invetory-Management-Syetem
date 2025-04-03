<?php
require_once 'config.php';

// Test database connection
echo "Testing database connection...\n";
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Database connection successful!\n\n";

// Test categories table
echo "Checking categories table...\n";
$result = $conn->query("SELECT * FROM categories");
if ($result) {
    echo "Categories found: " . $result->num_rows . "\n";
    while ($row = $result->fetch_assoc()) {
        echo "- " . $row['name'] . " (ID: " . $row['category_id'] . ")\n";
    }
} else {
    echo "Error querying categories: " . $conn->error . "\n";
}
echo "\n";

// Test inventory_items table
echo "Checking inventory_items table...\n";
$result = $conn->query("SELECT * FROM inventory_items");
if ($result) {
    echo "Inventory items found: " . $result->num_rows . "\n";
    while ($row = $result->fetch_assoc()) {
        echo "- " . $row['name'] . " (ID: " . $row['item_id'] . ", Category: " . $row['category_id'] . ")\n";
    }
} else {
    echo "Error querying inventory items: " . $conn->error . "\n";
}

$conn->close(); 