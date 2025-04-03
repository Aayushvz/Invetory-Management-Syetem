document.addEventListener("DOMContentLoaded", function () {
  // Sample data for demo purposes
  // In a real application, this would come from a database through API calls
  let categories = [
    {
      category_id: 1,
      name: "Electronics",
      description: "Electronic items and gadgets",
      item_count: 2,
    },
    {
      category_id: 2,
      name: "Office Supplies",
      description: "Office stationery and supplies",
      item_count: 2,
    },
    {
      category_id: 3,
      name: "Furniture",
      description: "Office and home furniture",
      item_count: 1,
    },
  ];

  // Modal elements
  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const categoryForm = document.getElementById("categoryForm");
  const categoryIdInput = document.getElementById("categoryId");
  const categoryNameInput = document.getElementById("categoryName");
  const categoryDescriptionInput = document.getElementById(
    "categoryDescription"
  );

  // Buttons
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const saveCategoryBtn = document.getElementById("saveCategoryBtn");
  const cancelCategoryBtn = document.getElementById("cancelCategoryBtn");
  const closeModalBtn = document.getElementById("closeModal");

  // Populate categories table
  function populateCategoriesTable() {
    const tableBody = document.getElementById("categoriesTable");
    if (!tableBody) return;

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Add categories to table
    categories.forEach((category) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${category.category_id}</td>
                <td>${category.name}</td>
                <td>${category.description || "N/A"}</td>
                <td>${category.item_count}</td>
                <td class="table-controls">
                    <a href="javascript:void(0)" class="btn btn-small btn-edit edit-category" data-id="${
                      category.category_id
                    }">Edit</a>
                    <a href="javascript:void(0)" class="btn btn-small btn-delete delete-category" data-id="${
                      category.category_id
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
    // Edit buttons
    const editButtons = document.querySelectorAll(".edit-category");
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const categoryId = parseInt(this.getAttribute("data-id"));
        editCategory(categoryId);
      });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll(".delete-category");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const categoryId = parseInt(this.getAttribute("data-id"));
        deleteCategory(categoryId);
      });
    });
  }

  // Open modal to add a new category
  function openAddCategoryModal() {
    modalTitle.textContent = "Add Category";
    categoryForm.reset();
    categoryIdInput.value = "";
    modal.style.display = "flex";
  }

  // Open modal to edit an existing category
  function editCategory(categoryId) {
    modalTitle.textContent = "Edit Category";

    // Find the category by ID
    const category = categories.find((cat) => cat.category_id === categoryId);
    if (!category) return;

    // Populate form with category data
    categoryIdInput.value = category.category_id;
    categoryNameInput.value = category.name;
    categoryDescriptionInput.value = category.description || "";

    // Show modal
    modal.style.display = "flex";
  }

  // Delete a category
  function deleteCategory(categoryId) {
    // Check if the category has items
    const category = categories.find((cat) => cat.category_id === categoryId);
    if (category && category.item_count > 0) {
      alert(
        "Cannot delete this category because it contains inventory items. Please remove or reassign the items first."
      );
      return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
      // In a real app, you would make an API call to delete from the database
      // For the demo, we'll update our local array
      categories = categories.filter((cat) => cat.category_id !== categoryId);

      // Update the table
      populateCategoriesTable();

      // Show success message
      alert("Category deleted successfully!");
    }
  }

  // Save category (add new or update existing)
  function saveCategory() {
    // Get form values
    const categoryId = categoryIdInput.value
      ? parseInt(categoryIdInput.value)
      : null;
    const name = categoryNameInput.value;
    const description = categoryDescriptionInput.value;

    if (categoryId) {
      // Update existing category
      const categoryIndex = categories.findIndex(
        (cat) => cat.category_id === categoryId
      );
      if (categoryIndex !== -1) {
        // Keep the item_count when updating
        const itemCount = categories[categoryIndex].item_count;

        categories[categoryIndex] = {
          ...categories[categoryIndex],
          name,
          description,
          item_count: itemCount,
        };
      }
    } else {
      // Add new category
      const newId =
        categories.length > 0
          ? Math.max(...categories.map((cat) => cat.category_id)) + 1
          : 1;
      categories.push({
        category_id: newId,
        name,
        description,
        item_count: 0,
      });
    }

    // Update the table
    populateCategoriesTable();

    // Close the modal
    closeModal();

    // Show success message
    alert(`Category ${categoryId ? "updated" : "added"} successfully!`);
  }

  // Close the modal
  function closeModal() {
    modal.style.display = "none";
    categoryForm.reset();
  }

  // Event Listeners
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", openAddCategoryModal);
  }

  if (saveCategoryBtn) {
    saveCategoryBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Validate the form
      if (!categoryNameInput.value.trim()) {
        alert("Category name is required");
        return;
      }

      saveCategory();
    });
  }

  if (cancelCategoryBtn) {
    cancelCategoryBtn.addEventListener("click", closeModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  // Initialize the page
  populateCategoriesTable();
});
