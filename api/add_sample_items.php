<?php
require_once 'config.php';

// Sample inventory items
$sample_items = [
    [
        'name' => 'Laptop',
        'description' => 'Dell XPS 13 laptop',
        'category_id' => 1,
        'quantity' => 25,
        'unit_price' => 1200.00,
        'reorder_level' => 5,
        'location' => 'Warehouse A',
        'status' => 'available'
    ],
    [
        'name' => 'Printer Paper',
        'description' => 'A4 size printer paper, 500 sheets',
        'category_id' => 2,
        'quantity' => 100,
        'unit_price' => 5.99,
        'reorder_level' => 20,
        'location' => 'Warehouse B',
        'status' => 'available'
    ],
    [
        'name' => 'Office Chair',
        'description' => 'Ergonomic office chair',
        'category_id' => 3,
        'quantity' => 15,
        'unit_price' => 149.99,
        'reorder_level' => 3,
        'location' => 'Warehouse C',
        'status' => 'available'
    ],
    [
        'name' => 'Pencils',
        'description' => 'HB pencils pack of 12',
        'category_id' => 2,
        'quantity' => 2,
        'unit_price' => 2.99,
        'reorder_level' => 10,
        'location' => 'Warehouse B',
        'status' => 'low_stock'
    ],
    [
        'name' => 'Monitor',
        'description' => '24-inch LCD monitor',
        'category_id' => 1,
        'quantity' => 0,
        'unit_price' => 199.99,
        'reorder_level' => 3,
        'location' => 'Warehouse A',
        'status' => 'out_of_stock'
    ]
];

// Prepare the SQL query
$stmt = $conn->prepare("INSERT INTO inventory_items (name, description, category_id, quantity, unit_price, reorder_level, location, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");

$success_count = 0;
$error_count = 0;

// Insert each item
foreach ($sample_items as $item) {
    $stmt->bind_param("ssiidiss", 
        $item['name'],
        $item['description'],
        $item['category_id'],
        $item['quantity'],
        $item['unit_price'],
        $item['reorder_level'],
        $item['location'],
        $item['status']
    );
    
    if ($stmt->execute()) {
        $success_count++;
        echo "Added item: " . $item['name'] . "\n";
    } else {
        $error_count++;
        echo "Error adding item " . $item['name'] . ": " . $conn->error . "\n";
    }
}

echo "\nSummary:\n";
echo "Successfully added: $success_count items\n";
echo "Failed to add: $error_count items\n";

$stmt->close();
$conn->close(); 