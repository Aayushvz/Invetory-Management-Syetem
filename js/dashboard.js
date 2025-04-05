document.addEventListener("DOMContentLoaded", function () {
  let inventoryItems = [];
  let transactions = [];
  let categories = [];

  // Function to fetch inventory items from the API
  async function fetchInventoryItems() {
    try {
      const response = await fetch("api/inventory.php");
      const data = await response.json();
      if (data.status === "success") {
        inventoryItems = data.data;
        updateDashboardStats();
        populateRecentItemsTable();
      } else {
        console.error("Error fetching inventory items:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    const username = user.username;
    const uname = "Welcome! ".concat(username);
    document.getElementById("headerUser").innerText = uname;
  }

  // Function to fetch transactions from the API
  async function fetchTransactions() {
    try {
      const response = await fetch("api/transactions.php");
      const data = await response.json();
      if (data.status === "success") {
        transactions = data.data;
        populateRecentTransactionsTable();
      } else {
        console.error("Error fetching transactions:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Function to fetch categories from the API
  async function fetchCategories() {
    try {
      const response = await fetch("api/categories.php");
      const data = await response.json();
      if (data.status === "success") {
        categories = data.data;
        updateDashboardStats();
      } else {
        console.error("Error fetching categories:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Update dashboard stats
  function updateDashboardStats() {
    // Total Items
    document.getElementById("totalItems").textContent = inventoryItems.length;

    // Low Stock Items
    const lowStockCount = inventoryItems.filter(
      (item) => item.status === "low_stock"
    ).length;
    document.getElementById("lowStockItems").textContent = lowStockCount;

    // Out of Stock Items
    const outOfStockCount = inventoryItems.filter(
      (item) => item.status === "out_of_stock"
    ).length;
    document.getElementById("outOfStockItems").textContent = outOfStockCount;

    // Total Categories
    document.getElementById("totalCategories").textContent = categories.length;
  }

  // Populate recent items table
  function populateRecentItemsTable() {
    const tableBody = document.getElementById("recentItemsTable");
    if (!tableBody) return;

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Add recent items (limit to 5)
    const recentItems = inventoryItems.slice(0, 5);

    recentItems.forEach((item) => {
      const row = document.createElement("tr");

      // Set status class
      let statusClass = "";
      if (item.status === "low_stock") {
        statusClass = "text-warning";
      } else if (item.status === "out_of_stock") {
        statusClass = "text-danger";
      }

      // Format status text
      let statusText = item.status.replace("_", " ");
      statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1);

      row.innerHTML = `
                <td>${item.item_id}</td>
                <td>${item.name}</td>
                <td>${item.category_name}</td>
                <td>${item.quantity}</td>
                <td>₹${parseFloat(item.unit_price).toFixed(2)}</td>
                <td class="${statusClass}">${statusText}</td>
                <td class="table-controls">
                    <a href="javascript:void(0)" class="btn btn-small btn-view view-item" data-id="${
                      item.item_id
                    }">View</a>
                    <a href="javascript:void(0)" class="btn btn-small btn-edit edit-item" data-id="${
                      item.item_id
                    }">Edit</a>
                    <a href="javascript:void(0)" class="btn btn-small btn-delete delete-item" data-id="${
                      item.item_id
                    }">Delete</a>
                </td>
            `;

      tableBody.appendChild(row);
    });

    // Add event listeners for action buttons
    addActionButtonListeners();
  }

  // Add event listeners for action buttons
  function addActionButtonListeners() {
    // View buttons
    const viewButtons = document.querySelectorAll(".view-item");
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = parseInt(this.getAttribute("data-id"));
        viewItem(itemId);
      });
    });

    // Edit buttons
    const editButtons = document.querySelectorAll(".edit-item");
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = parseInt(this.getAttribute("data-id"));
        editItem(itemId);
      });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll(".delete-item");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = parseInt(this.getAttribute("data-id"));
        deleteItem(itemId);
      });
    });
  }

  // View item details
  function viewItem(itemId) {
    const item = inventoryItems.find(
      (item) => parseInt(item.item_id) === itemId
    );
    if (!item) return;

    alert(`
            Item Details:
            
            ID: ${item.item_id}
            Name: ${item.name}
            Description: ${item.description || "N/A"}
            Category: ${item.category_name}
            Quantity: ${item.quantity}
            Unit Price: ₹${parseFloat(item.unit_price).toFixed(2)}
            Reorder Level: ${item.reorder_level}
            Location: ${item.location || "N/A"}
            Status: ${item.status}
        `);
  }

  // Edit item
  function editItem(itemId) {
    // Redirect to inventory page with edit mode
    window.location.href = `inventory.html?edit=${itemId}`;
  }

  // Delete an item
  async function deleteItem(itemId) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`api/inventory.php?id=${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.status === "success") {
        // Refresh the inventory items
        await fetchInventoryItems();
        alert("Item deleted successfully!");
      } else {
        alert(data.message || "Error deleting item");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting item");
    }
  }

  // Populate recent transactions table
  function populateRecentTransactionsTable() {
    const tableBody = document.getElementById("recentTransactionsTable");
    if (!tableBody) return;

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Add recent transactions (limit to 5)
    const recentTransactions = transactions.slice(0, 5);

    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");

      // Format transaction type
      let typeClass = "";
      if (transaction.type === "purchase") {
        typeClass = "text-success";
      } else if (transaction.type === "sale") {
        typeClass = "text-primary";
      } else if (transaction.type === "adjustment") {
        typeClass = "text-warning";
      }

      // Format transaction type text
      let typeText =
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);

      row.innerHTML = `
                <td>${transaction.transaction_id}</td>
                <td>${transaction.item_name}</td>
                <td class="${typeClass}">${typeText}</td>
                <td>${transaction.quantity}</td>
                <td>${formatDate(transaction.transaction_date)}</td>
                <td>${transaction.user_name}</td>
            `;

      tableBody.appendChild(row);
    });
  }

  // Helper function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  // Initialize dashboard by fetching data
  fetchInventoryItems();
  fetchTransactions();
  fetchCategories();

  // Refresh data every 5 minutes
  setInterval(() => {
    fetchInventoryItems();
    fetchTransactions();
    fetchCategories();
  }, 5 * 60 * 1000);
});
