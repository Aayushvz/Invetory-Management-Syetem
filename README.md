# Inventory Management System

A web-based inventory management application built with HTML, CSS, JavaScript, and MySQL.

## Features

- **User Authentication and Authorization**: Secure login system with role-based access control
- **Dashboard**: Overview of inventory statistics and recent activities
- **Inventory Management**: Add, edit, delete, and track inventory items
- **Category Management**: Organize inventory items into categories
- **Search and Filter**: Find items quickly using search and filter options
- **Low Stock Alerts**: Get notified when items are running low
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP
- **Database**: MySQL

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/Inventory-Management-System.git
   ```

2. Set up the database:

   - Create a MySQL database
   - Import the `database.sql` file to create the required tables and sample data

3. Configure the database connection:

   - Open `api/config.php` and update the database credentials if needed:
     ```php
     $db_host = 'localhost';
     $db_user = 'root';
     $db_password = '';
     $db_name = 'inventory_management';
     ```

4. Deploy the application:
   - Place the files in your web server's document root (e.g., htdocs for XAMPP)
   - Access the application through your web browser: `http://localhost/inventory-management-system`

## Usage

1. Login with the default admin credentials:

   - Username: `admin`
   - Password: `admin123`

2. Navigate through the sidebar to access different sections:
   - Dashboard: Overview of inventory statistics
   - Inventory: Manage inventory items
   - Categories: Manage product categories
   - Transactions: View and manage inventory transactions
   - Reports: View inventory reports

## Project Structure

```
inventory-management-system/
├── api/                  # Backend PHP APIs
│   ├── config.php        # Database configuration
│   ├── login.php         # Authentication API
│   ├── inventory.php     # Inventory items API
│   └── categories.php    # Categories API
├── css/                  # Stylesheets
│   └── style.css         # Main stylesheet
├── js/                   # JavaScript files
│   ├── auth.js           # Authentication script
│   ├── dashboard.js      # Dashboard script
│   ├── inventory.js      # Inventory management script
│   ├── categories.js     # Categories management script
│   └── login.js          # Login script
├── img/                  # Images and icons
├── index.html            # Login page
├── dashboard.html        # Dashboard page
├── inventory.html        # Inventory management page
├── categories.html       # Categories management page
├── database.sql          # Database schema and sample data
└── README.md             # Project documentation
```

## Security Considerations

- The demo uses simple authentication for demonstration purposes
- In a production environment, implement proper password hashing, HTTPS, and other security measures
- Add input validation and sanitization to prevent SQL injection and XSS attacks

## Future Enhancements

- Advanced reporting and analytics
- Barcode/QR code scanning
- Email notifications for low stock
- Export data to CSV/Excel
- Multi-language support
