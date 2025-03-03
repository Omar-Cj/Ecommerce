// categories.js

const API_BASE_URL = "https://suuqcasri-production-839407217d71.herokuapp.com/store/collections/";
const token = localStorage.getItem("accessToken");

// Utility: Fetch with Authorization Header
const fetchWithAuth = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${token}`,
      ...options.headers,
    },
  });
};

// DOM Elements
const categoryTableBody = document.getElementById("categoryTableBody");
const searchInput = document.getElementById("searchInput");
const paginationControls = document.getElementById("paginationControls");
const addCategoryForm = document.getElementById("addCategoryForm");
const editCategoryForm = document.getElementById("editCategoryForm");
// The delete confirmation button uses the same id as in your markup.
const deleteCategoryConfirm = document.getElementById("deleteProductConfirm");

let currentPage = 1;
let currentSort = "";
let currentSearch = "";
let categories = [];
let pageSize = 10;

// Fetch Categories with pagination, search, and sorting
const fetchCategories = async () => {
  try {
    let url = `${API_BASE_URL}?page=${currentPage}&search=${currentSearch}&ordering=${currentSort}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();

    categories = data.results;
    // If backend supports variable page sizes, update pageSize accordingly.
    pageSize = data.results.length || pageSize;
    renderCategories();
    renderPagination(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

// Render categories in the table body
const renderCategories = () => {
  categoryTableBody.innerHTML = "";
  categories.forEach((category) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0">${category.id}</p></td>
      <td class="align-left text-center text-sm"><p class="text-xs font-weight-bold mb-0">${category.title}</p></td> 
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0">${category.products_count}</p></td> 
      <td class="align-middle">
        <button class="btn btn-sm btn-primary me-2" onclick="openEditModal(${category.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${category.id})">Delete</button>
      </td>
    `;
    categoryTableBody.appendChild(row);
  });
};

// Render Pagination Controls
const renderPagination = (data) => {
  paginationControls.innerHTML = "";

  const totalPages = Math.ceil(data.count / pageSize);
  const maxPageLinks = 5;

  // Create a Bootstrap pagination wrapper
  const paginationWrapper = document.createElement("ul");
  paginationWrapper.className = "pagination justify-content-center";

  // Previous Button
  const prevItem = document.createElement("li");
  prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevItem.innerHTML = `
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>`;
  if (currentPage > 1) {
    prevItem.onclick = (e) => {
      e.preventDefault();
      currentPage--;
      fetchCategories();
    };
  }
  paginationWrapper.appendChild(prevItem);

  // Calculate start and end pages
  let startPage = Math.max(1, currentPage - Math.floor(maxPageLinks / 2));
  let endPage = Math.min(totalPages, startPage + maxPageLinks - 1);
  if (endPage - startPage + 1 < maxPageLinks) {
    startPage = Math.max(1, endPage - maxPageLinks + 1);
  }

  // Page Number Links
  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.onclick = (e) => {
      e.preventDefault();
      currentPage = i;
      fetchCategories();
    };
    paginationWrapper.appendChild(pageItem);
  }

  // Next Button
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextItem.innerHTML = `
    <a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>`;
  if (currentPage < totalPages) {
    nextItem.onclick = (e) => {
      e.preventDefault();
      currentPage++;
      fetchCategories();
    };
  }
  paginationWrapper.appendChild(nextItem);

  // Append pagination to controls container
  paginationControls.appendChild(paginationWrapper);
};

// Search Categories
searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  currentPage = 1;
  fetchCategories();
});

// Sort Column
// This function is invoked from the <th> onclick attributes in your markup.
const sortColumn = (column) => {
  // Clear previous sort icons from all header cells
  const headers = document.querySelectorAll("th");
  headers.forEach((header) =>
    (header.innerHTML = header.innerHTML.replace(/ *[▲▼]$/, ""))
  );
  
  // Use the global `event` object to determine which header was clicked.
  if (currentSort === column) {
    currentSort = `-${column}`; // Reverse the sort
    event.target.innerHTML += " ▼"; // Descending icon
  } else {
    currentSort = column;
    event.target.innerHTML += " ▲"; // Ascending icon
  }
  fetchCategories();
};

// Add Category
addCategoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const categoryData = {
    title: document.getElementById("addCategoryName").value,
  };

  try {
    const response = await fetchWithAuth(API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Validation errors:", errorData);
      throw new Error(`Validation failed: ${JSON.stringify(errorData)}`);
    }
    // Refresh categories list after successful addition
    fetchCategories();
    addCategoryForm.reset();
    bootstrap.Modal.getInstance(document.getElementById("addCategoryModal")).hide();
  } catch (error) {
    console.error("Error adding category:", error);
    alert(`Operation failed: ${error.message}`);
  }
});

// Edit Category Modal: Open and populate form
const openEditModal = (id) => {
  const category = categories.find((cat) => cat.id === id);
  if (!category) return;
  document.getElementById("editProductId").value = id;
  document.getElementById("editProductName").value = category.title;

  const modal = new bootstrap.Modal(document.getElementById("editCategoryModal"));
  modal.show();
};

// Edit Category: Submit updated category data
editCategoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("editProductId").value;
  const updatedData = {
    title: document.getElementById("editProductName").value,
  };

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to edit category");
    fetchCategories();
    bootstrap.Modal.getInstance(document.getElementById("editCategoryModal")).hide();
  } catch (error) {
    console.error("Error editing category:", error);
  }
});

// Delete Category: Open delete confirmation modal
const openDeleteModal = (id) => {
  deleteCategoryConfirm.onclick = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      fetchCategories();
      bootstrap.Modal.getInstance(document.getElementById("deleteCategoryModal")).hide();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const modal = new bootstrap.Modal(document.getElementById("deleteCategoryModal"));
  modal.show();
};

// Initial Fetch of categories
fetchCategories();
