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
                    <a href="inventory-view.html?id=${
                      item.item_id
                    }" class="btn btn-small btn-view">View</a>
                    <a href="inventory-edit.html?id=${
                      item.item_id
                    }" class="btn btn-small btn-edit">Edit</a>
                    <a href="javascript:void(0)" class="btn btn-small btn-delete" data-id="${
                      item.item_id
                    }">Delete</a>
                </td>
            `;

      tableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        const itemId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this item?")) {
          try {
            const response = await fetch(`api/inventory.php?id=${itemId}`, {
              method: "DELETE",
            });
            const data = await response.json();
            if (data.status === "success") {
              await fetchInventoryItems(); // Refresh the data
              alert("Item deleted successfully!");
            } else {
              alert(data.message || "Error deleting item");
            }
          } catch (error) {
            console.error("Error:", error);
            alert("Error deleting item");
          }
        }
      });
    });
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
