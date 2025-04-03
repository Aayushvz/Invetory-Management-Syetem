document.addEventListener("DOMContentLoaded", function () {
  let inventoryItems = [];

  // Function to fetch inventory items from the API
  async function fetchInventoryItems() {
    try {
      console.log("Fetching inventory items...");
      const response = await fetch("api/inventory.php");
      const data = await response.json();
      console.log("API Response:", data);

      if (data.status === "success") {
        inventoryItems = data.data;
        console.log("Inventory items loaded:", inventoryItems);
        populateInventoryTable();
      } else {
        console.error("Error fetching inventory items:", data.message);
        showNotification("Error loading inventory items", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error loading inventory items", "error");
    }
  }

  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Office Supplies" },
    { id: 3, name: "Furniture" },
  ];

  // Modal elements
  const modal = document.getElementById("itemModal");
  const modalTitle = document.getElementById("modalTitle");
  const itemForm = document.getElementById("itemForm");
  const itemIdInput = document.getElementById("itemId");
  const itemNameInput = document.getElementById("itemName");
  const itemDescriptionInput = document.getElementById("itemDescription");
  const itemCategorySelect = document.getElementById("itemCategory");
  const itemQuantityInput = document.getElementById("itemQuantity");
  const itemPriceInput = document.getElementById("itemPrice");
  const itemReorderLevelInput = document.getElementById("itemReorderLevel");
  const itemLocationInput = document.getElementById("itemLocation");
  const itemStatusSelect = document.getElementById("itemStatus");

  // Buttons
  const addItemBtn = document.getElementById("addItemBtn");
  const saveItemBtn = document.getElementById("saveItemBtn");
  const cancelItemBtn = document.getElementById("cancelItemBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const searchBtn = document.getElementById("searchBtn");

  // Filter elements
  const searchInput = document.getElementById("searchInput");
  const categoryFilterSelect = document.getElementById("categoryFilter");
  const statusFilterSelect = document.getElementById("statusFilter");

  // Populate category options in filters and form
  function populateCategoryOptions() {
    // Filter dropdown
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categoryFilterSelect.appendChild(option);
    });

    // Form dropdown
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      itemCategorySelect.appendChild(option);
    });
  }

  // Populate inventory table
  function populateInventoryTable(items = inventoryItems) {
    console.log("Populating table with items:", items);
    const tableBody = document.getElementById("inventoryTable");
    console.log("Table body element:", tableBody);

    if (!tableBody) {
      console.error("Could not find table body element!");
      return;
    }

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Add items to table
    items.forEach((item) => {
      console.log("Processing item:", item);
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
                <td>${item.reorder_level}</td>
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
      console.log("Added row for item:", item.name);
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

  // Open modal to add a new item
  function openAddItemModal() {
    modalTitle.textContent = "Add Inventory Item";
    itemForm.reset();
    itemIdInput.value = "";
    modal.style.display = "flex";
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
    modalTitle.textContent = "Edit Inventory Item";

    // Find the item by ID
    const item = inventoryItems.find(
      (item) => parseInt(item.item_id) === itemId
    );
    if (!item) return;

    // Populate form with item data
    itemIdInput.value = item.item_id;
    itemNameInput.value = item.name;
    itemDescriptionInput.value = item.description || "";
    itemCategorySelect.value = item.category_id;
    itemQuantityInput.value = item.quantity;
    itemPriceInput.value = parseFloat(item.unit_price).toFixed(2);
    itemReorderLevelInput.value = item.reorder_level;
    itemLocationInput.value = item.location || "";
    itemStatusSelect.value = item.status;

    // Show modal
    modal.style.display = "flex";
  }

  // Save item (add or update)
  async function saveItem() {
    const itemId = itemIdInput.value;
    const name = itemNameInput.value;
    const description = itemDescriptionInput.value;
    const category_id = parseInt(itemCategorySelect.value);
    const quantity = parseInt(itemQuantityInput.value);
    const unit_price = parseFloat(itemPriceInput.value);
    const reorder_level = parseInt(itemReorderLevelInput.value);
    const location = itemLocationInput.value;
    const status = itemStatusSelect.value;

    try {
      let response;
      if (itemId) {
        // Update existing item
        response = await fetch("api/inventory.php", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id: parseInt(itemId),
            name,
            description,
            category_id,
            quantity,
            unit_price,
            reorder_level,
            location,
            status,
          }),
        });
      } else {
        // Add new item
        response = await fetch("api/inventory.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            category_id,
            quantity,
            unit_price,
            reorder_level,
            location,
            status,
          }),
        });
      }

      const data = await response.json();
      if (data.status === "success") {
        // Refresh the inventory items
        await fetchInventoryItems();
        // Close modal
        modal.style.display = "none";
        // Show success message
        showNotification(
          itemId ? "Item updated successfully" : "Item added successfully",
          "success"
        );
      } else {
        showNotification(data.message || "Error saving item", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error saving item", "error");
    }
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
        showNotification("Item deleted successfully", "success");
      } else {
        showNotification(data.message || "Error deleting item", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error deleting item", "error");
    }
  }

  // Close the modal
  function closeModal() {
    modal.style.display = "none";
    itemForm.reset();
  }

  // Search and filter inventory items
  function searchAndFilterItems() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryFilter = categoryFilterSelect.value;
    const statusFilter = statusFilterSelect.value;

    // Filter items based on search and filter criteria
    const filteredItems = inventoryItems.filter((item) => {
      // Search term filter
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm));

      // Category filter
      const matchesCategory =
        !categoryFilter || item.category_id === parseInt(categoryFilter);

      // Status filter
      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Update the table with filtered items
    populateInventoryTable(filteredItems);
  }

  // Event Listeners
  if (addItemBtn) {
    addItemBtn.addEventListener("click", openAddItemModal);
  }

  if (saveItemBtn) {
    saveItemBtn.addEventListener("click", function (e) {
      e.preventDefault();
      saveItem();
    });
  }

  if (cancelItemBtn) {
    cancelItemBtn.addEventListener("click", closeModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", searchAndFilterItems);
  }

  // Allow pressing Enter in search field to trigger search
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchAndFilterItems();
      }
    });
  }

  // Initialize the page
  populateCategoryOptions();
  fetchInventoryItems();
});
