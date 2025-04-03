<?php
// Include the configuration file
require_once 'config.php';

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

// Get request path to determine operation
$path = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        // Handle GET requests (retrieve data)
        if ($path == 'category' && isset($_GET['id'])) {
            // Get a specific category by ID
            get_category($_GET['id']);
        } else {
            // Get all categories
            get_categories();
        }
        break;
        
    case 'POST':
        // Handle POST requests (create new data)
        create_category();
        break;
        
    case 'PUT':
        // Handle PUT requests (update existing data)
        update_category();
        break;
        
    case 'DELETE':
        // Handle DELETE requests (delete data)
        if (isset($_GET['id'])) {
            delete_category($_GET['id']);
        } else {
            send_response('error', 'Category ID is required for deletion');
        }
        break;
        
    default:
        // Method not allowed
        send_response('error', 'Method not allowed');
}

// Function to get all categories
function get_categories() {
    global $conn;
    
    // Prepare the SQL query
    $sql = "SELECT c.*, COUNT(i.item_id) AS item_count FROM categories c
            LEFT JOIN inventory_items i ON c.category_id = i.category_id
            GROUP BY c.category_id
            ORDER BY c.name ASC";
    
    // Execute the query
    $result = $conn->query($sql);
    
    // Fetch all categories
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    
    // Return the categories
    send_response('success', 'Categories retrieved successfully', $categories);
}

// Function to get a specific category by ID
function get_category($id) {
    global $conn;
    
    // Sanitize and validate the ID
    $id = intval($id);
    
    // Prepare the SQL query
    $stmt = $conn->prepare("SELECT * FROM categories WHERE category_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if category exists
    if ($result->num_rows === 0) {
        send_response('error', 'Category not found');
    }
    
    // Get category data
    $category = $result->fetch_assoc();
    
    // Return the category
    send_response('success', 'Category retrieved successfully', $category);
}

// Function to create a new category
function create_category() {
    global $conn;
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['name'])) {
        send_response('error', 'Category name is required');
    }
    
    // Sanitize and prepare data
    $name = sanitize_input($data['name']);
    $description = isset($data['description']) ? sanitize_input($data['description']) : '';
    
    // Check if category with the same name already exists
    $stmt = $conn->prepare("SELECT category_id FROM categories WHERE name = ?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        send_response('error', 'A category with this name already exists');
    }
    
    // Prepare the SQL query to insert
    $stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $description);
    
    // Execute the query
    if ($stmt->execute()) {
        // Get the ID of the newly created category
        $new_id = $conn->insert_id;
        
        // Return success response
        send_response('success', 'Category created successfully', ['category_id' => $new_id]);
    } else {
        // Return error response
        send_response('error', 'Failed to create category: ' . $conn->error);
    }
}

// Function to update an existing category
function update_category() {
    global $conn;
    
    // Get PUT data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['category_id']) || !isset($data['name'])) {
        send_response('error', 'Category ID and name are required');
    }
    
    // Sanitize and prepare data
    $category_id = intval($data['category_id']);
    $name = sanitize_input($data['name']);
    $description = isset($data['description']) ? sanitize_input($data['description']) : '';
    
    // Check if category with the same name already exists (excluding current category)
    $stmt = $conn->prepare("SELECT category_id FROM categories WHERE name = ? AND category_id != ?");
    $stmt->bind_param("si", $name, $category_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        send_response('error', 'A category with this name already exists');
    }
    
    // Prepare the SQL query to update
    $stmt = $conn->prepare("UPDATE categories SET name = ?, description = ? WHERE category_id = ?");
    $stmt->bind_param("ssi", $name, $description, $category_id);
    
    // Execute the query
    if ($stmt->execute()) {
        // Check if any row was affected
        if ($stmt->affected_rows > 0) {
            // Return success response
            send_response('success', 'Category updated successfully');
        } else {
            // No rows were affected, category might not exist
            send_response('error', 'Category not found or no changes were made');
        }
    } else {
        // Return error response
        send_response('error', 'Failed to update category: ' . $conn->error);
    }
}

// Function to delete a category
function delete_category($id) {
    global $conn;
    
    // Sanitize and validate the ID
    $id = intval($id);
    
    // Check if there are inventory items using this category
    $stmt = $conn->prepare("SELECT COUNT(*) AS item_count FROM inventory_items WHERE category_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['item_count'] > 0) {
        send_response('error', 'Cannot delete category because it is used by inventory items');
    }
    
    // Prepare the SQL query to delete
    $stmt = $conn->prepare("DELETE FROM categories WHERE category_id = ?");
    $stmt->bind_param("i", $id);
    
    // Execute the query
    if ($stmt->execute()) {
        // Check if any row was affected
        if ($stmt->affected_rows > 0) {
            // Return success response
            send_response('success', 'Category deleted successfully');
        } else {
            // No rows were affected, category might not exist
            send_response('error', 'Category not found');
        }
    } else {
        // Return error response
        send_response('error', 'Failed to delete category: ' . $conn->error);
    }
}

// Close the database connection
$conn->close(); 