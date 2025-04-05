<?php
// Include the configuration and functions files
require_once 'config.php';
require_once 'functions.php';

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

// Get request path to determine operation
$path = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        // Handle GET requests (retrieve data)
        if ($path == 'item' && isset($_GET['id'])) {
            // Get a specific item by ID
            get_item($_GET['id']);
        } else {
            // Get all items (with optional filters)
            get_items();
        }
        break;
        
    case 'POST':
        // Handle POST requests (create new data)
        create_item();
        break;
        
    case 'PUT':
        // Handle PUT requests (update existing data)
        update_item();
        break;
        
    case 'DELETE':
        // Handle DELETE requests (delete data)
        if (isset($_GET['id'])) {
            delete_item($_GET['id']);
        } else {
            send_response('error', 'Item ID is required for deletion');
        }
        break;
        
    default:
        // Method not allowed
        send_response('error', 'Method not allowed');
}

// Function to get all inventory items with optional filters
function get_items() {
    global $conn;
    
    // Get query parameters for filtering
    $search = isset($_GET['search']) ? sanitize_input($_GET['search']) : '';
    $category = isset($_GET['category']) ? intval($_GET['category']) : 0;
    $status = isset($_GET['status']) ? sanitize_input($_GET['status']) : '';
    
    // Build the SQL query with optional filters
    $sql = "SELECT i.*, c.name AS category_name FROM inventory_items i
            LEFT JOIN categories c ON i.category_id = c.category_id
            WHERE 1=1";
    
    // Add search condition if provided
    if (!empty($search)) {
        $search = "%{$search}%";
        $sql .= " AND (i.name LIKE ? OR i.description LIKE ?)";
    }
    
    // Add category filter if provided
    if ($category > 0) {
        $sql .= " AND i.category_id = ?";
    }
    
    // Add status filter if provided
    if (!empty($status)) {
        $sql .= " AND i.status = ?";
    }
    
    // Order by ID
    $sql .= " ORDER BY i.item_id DESC";
    
    // Prepare the statement
    $stmt = $conn->prepare($sql);
    
    // Bind parameters conditionally
    if (!empty($search) && $category > 0 && !empty($status)) {
        $stmt->bind_param("ssis", $search, $search, $category, $status);
    } elseif (!empty($search) && $category > 0) {
        $stmt->bind_param("ssi", $search, $search, $category);
    } elseif (!empty($search) && !empty($status)) {
        $stmt->bind_param("sss", $search, $search, $status);
    } elseif ($category > 0 && !empty($status)) {
        $stmt->bind_param("is", $category, $status);
    } elseif (!empty($search)) {
        $stmt->bind_param("ss", $search, $search);
    } elseif ($category > 0) {
        $stmt->bind_param("i", $category);
    } elseif (!empty($status)) {
        $stmt->bind_param("s", $status);
    }
    
    // Execute the query
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch all items
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    
    // Return the items
    send_response('success', 'Inventory items retrieved successfully', $items);
}

// Function to get a specific inventory item by ID
function get_item($id) {
    global $conn;
    
    // Sanitize and validate the ID
    $id = intval($id);
    
    // Prepare the SQL query
    $stmt = $conn->prepare("SELECT i.*, c.name AS category_name FROM inventory_items i
                           LEFT JOIN categories c ON i.category_id = c.category_id
                           WHERE i.item_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if item exists
    if ($result->num_rows === 0) {
        send_response('error', 'Item not found');
    }
    
    // Get item data
    $item = $result->fetch_assoc();
    
    // Return the item
    send_response('success', 'Item retrieved successfully', $item);
}

// Function to determine status based on quantity and reorder level
function determine_status($quantity, $reorder_level) {
    if ($quantity <= 0) {
        return 'out_of_stock';
    } else if ($quantity <= $reorder_level) {
        return 'low_stock';
    } else {
        return 'available';
    }
}

// Function to create a new inventory item
function create_item() {
    global $conn;
    
    // Get POST data
    $raw_data = file_get_contents('php://input');
    error_log("Received raw data: " . $raw_data);
    
    $data = json_decode($raw_data, true);
    error_log("Decoded data: " . print_r($data, true));
    
    // Validate required fields
    if (!isset($data['name']) || !isset($data['category_id']) || 
        !isset($data['quantity']) || !isset($data['unit_price'])) {
        error_log("Missing required fields");
        send_response('error', 'Required fields are missing');
        return;
    }
    
    // Sanitize and prepare data
    $name = sanitize_input($data['name']);
    $description = isset($data['description']) ? sanitize_input($data['description']) : '';
    $category_id = intval($data['category_id']);
    $quantity = intval($data['quantity']);
    $unit_price = floatval($data['unit_price']);
    $reorder_level = isset($data['reorder_level']) ? intval($data['reorder_level']) : 10;
    $location = isset($data['location']) ? sanitize_input($data['location']) : '';
    
    // Automatically determine status based on quantity and reorder level
    $status = determine_status($quantity, $reorder_level);
    
    $created_by = isset($data['created_by']) ? intval($data['created_by']) : 1; // Default to admin user
    
    error_log("Prepared data for insertion: " . print_r([
        'name' => $name,
        'description' => $description,
        'category_id' => $category_id,
        'quantity' => $quantity,
        'unit_price' => $unit_price,
        'reorder_level' => $reorder_level,
        'location' => $location,
        'status' => $status,
        'created_by' => $created_by
    ], true));
    
    // Prepare the SQL query
    $sql = "INSERT INTO inventory_items (name, description, category_id, quantity, unit_price, reorder_level, location, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    error_log("SQL Query: " . $sql);
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        send_response('error', 'Failed to prepare statement: ' . $conn->error);
        return;
    }
    
    $stmt->bind_param("ssiidissi", $name, $description, $category_id, $quantity, $unit_price, $reorder_level, $location, $status, $created_by);
    
    // Execute the query
    if ($stmt->execute()) {
        // Get the ID of the newly created item
        $new_id = $conn->insert_id;
        error_log("Item created successfully with ID: " . $new_id);
        
        // Return success response
        send_response('success', 'Item created successfully', ['item_id' => $new_id]);
    } else {
        error_log("Execute failed: " . $stmt->error);
        // Return error response
        send_response('error', 'Failed to create item: ' . $stmt->error);
    }
    
    $stmt->close();
}

// Function to update an existing inventory item
function update_item() {
    global $conn;
    
    // Get PUT data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['item_id']) || !isset($data['name']) || !isset($data['category_id']) ||
        !isset($data['quantity']) || !isset($data['unit_price'])) {
        send_response('error', 'Required fields are missing');
    }
    
    // Sanitize and prepare data
    $item_id = intval($data['item_id']);
    $name = sanitize_input($data['name']);
    $description = isset($data['description']) ? sanitize_input($data['description']) : '';
    $category_id = intval($data['category_id']);
    $quantity = intval($data['quantity']);
    $unit_price = floatval($data['unit_price']);
    $reorder_level = isset($data['reorder_level']) ? intval($data['reorder_level']) : 10;
    $location = isset($data['location']) ? sanitize_input($data['location']) : '';
    
    // Automatically determine status based on quantity and reorder level
    $status = determine_status($quantity, $reorder_level);
    
    // Prepare the SQL query
    $stmt = $conn->prepare("UPDATE inventory_items SET 
                           name = ?, description = ?, category_id = ?, quantity = ?, 
                           unit_price = ?, reorder_level = ?, location = ?, status = ?
                           WHERE item_id = ?");
    $stmt->bind_param("ssiidissi", $name, $description, $category_id, $quantity, $unit_price, $reorder_level, $location, $status, $item_id);
    
    // Execute the query
    if ($stmt->execute()) {
        // Check if any row was affected
        if ($stmt->affected_rows > 0) {
            // Return success response
            send_response('success', 'Item updated successfully');
        } else {
            // No rows were affected, item might not exist
            send_response('error', 'Item not found or no changes were made');
        }
    } else {
        // Return error response
        send_response('error', 'Failed to update item: ' . $conn->error);
    }
}

// Function to delete an inventory item
function delete_item($id) {
    global $conn;
    
    // Sanitize and validate the ID
    $id = intval($id);
    
    // Prepare the SQL query
    $stmt = $conn->prepare("DELETE FROM inventory_items WHERE item_id = ?");
    $stmt->bind_param("i", $id);
    
    // Execute the query
    if ($stmt->execute()) {
        // Check if any row was affected
        if ($stmt->affected_rows > 0) {
            // Return success response
            send_response('success', 'Item deleted successfully');
        } else {
            // No rows were affected, item might not exist
            send_response('error', 'Item not found');
        }
    } else {
        // Return error response
        send_response('error', 'Failed to delete item: ' . $conn->error);
    }
}

// Close the database connection
$conn->close(); 