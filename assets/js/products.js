// products.js

const API_BASE_URL =
  "https://suuqcasri-prod-b2dbb1ea4f1e.herokuapp.com/store/products/";
const token = localStorage.getItem("accessToken"); // Retrieve access token

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
const productTableBody = document.getElementById("productTableBody");
const searchInput = document.getElementById("searchInput");
const paginationControls = document.getElementById("paginationControls");
const addCategoryForm = document.getElementById("addProductForm");
const editProductForm = document.getElementById("editProductForm");
const deleteProductConfirm = document.getElementById("deleteProductConfirm");
const filterByCategoryDropdown = document.getElementById("filterByCategory"); // Add this to your HTML
const addcategoryProduct = document.getElementById("addProductCategory"); // Add this to your HTML

let currentPage = 1;
let currentSort = "";
let currentSearch = "";
let products = [];
let pageSize = 10;
let currentCategory = ""; // Track the selected category

// Add global categories cache
let categoriesCache = [];

// Fetch Categories
const fetchCategories = async () => {
  try {
    const response = await fetchWithAuth(
      "https://suuqcasri-prod-b2dbb1ea4f1e.herokuapp.com/store/collections/"
    ); // Replace with your categories endpoint
    if (!response.ok) throw new Error("Failed to fetch categories");
    const categories = await response.json();
    categoriesCache = categories.results;
    renderCategoryDropdown(categories.results);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

// Render Categories in Dropdown
const renderCategoryDropdown = (categories) => {
  // For filter dropdown
  filterByCategoryDropdown.innerHTML =
    '<option value="">All Categories</option>';
  // For add product dropdown
  const addCategoryDropdown = document.getElementById("addCategoryProduct");
  addCategoryDropdown.innerHTML = '<option value="">Select Category</option>';

  categories.forEach((category) => {
    // For filter
    const filterOption = document.createElement("option");
    filterOption.value = category.id;
    filterOption.textContent = category.title;
    filterByCategoryDropdown.appendChild(filterOption);

    // For add form
    const addOption = document.createElement("option");
    addOption.value = category.id;
    addOption.textContent = category.title;
    addCategoryDropdown.appendChild(addOption);
  });
};

filterByCategoryDropdown.addEventListener("change", (event) => {
  currentCategory = event.target.value;
  currentPage = 1; // Reset to first page
  fetchProducts(); // Fetch products with the selected category filter
});

// Fetch Products
const fetchProducts = async () => {
  try {
    let url = `${API_BASE_URL}?page=${currentPage}&search=${currentSearch}&ordering=${currentSort}`;
    if (currentCategory) {
      url += `&collection_id=${currentCategory}`; // Add category filter
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();

    products = data.results;
    pageSize = data.results.length || pageSize; // Dynamically adjust pageSize if backend supports variable page sizes
    renderProducts();
    renderPagination(data); // Pass data for pagination
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Render Products in Table
const renderProducts = () => {
  productTableBody.innerHTML = "";
  products.forEach((product) => {
    const category = categoriesCache.find((c) => c.id === product.collection);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="d-flex px-2 py-1 product-image-container">
            <div>
            <img src="../assets/img/team-2.jpg" class="avatar avatar-sm me-3" alt="user1">
            </div>
             <p class="text-xs font-weight-bold mb-0">${product.title}</p>
        </div>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">$ ${product.unit_price}</p>
      </td>
      <td class="align-middle text-center text-sm">
        <p class="text-xs font-weight-bold mb-0">${product.inventory}</p>
      </td>
      <td class="align-middle text-center text-sm">
        <p class="text-xs font-weight-bold mb-0">${category.title}</p>
      </td>
      <td class="align-middle">
        <button class="btn btn-sm btn-primary me-2" onclick="openEditModal(${product.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${product.id})">Delete</button>
      </td>
    `;
    productTableBody.appendChild(row);
  });
};

// Render Pagination Controls
const renderPagination = (data) => {
  paginationControls.innerHTML = "";

  // Constants
  const totalPages = Math.ceil(data.count / pageSize); // Calculate total pages
  const maxPageLinks = 5; // Maximum number of visible page links

  // Create Bootstrap Pagination Wrapper
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
      fetchProducts();
    };
  }
  paginationWrapper.appendChild(prevItem);

  // Page Number Links
  let startPage = Math.max(1, currentPage - Math.floor(maxPageLinks / 2));
  let endPage = Math.min(totalPages, startPage + maxPageLinks - 1);

  // Adjust startPage if we're close to the last page
  if (endPage - startPage + 1 < maxPageLinks) {
    startPage = Math.max(1, endPage - maxPageLinks + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.onclick = (e) => {
      e.preventDefault();
      currentPage = i;
      fetchProducts();
    };
    paginationWrapper.appendChild(pageItem);
  }

  // Next Button
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextItem.innerHTML = `
    <a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>`;
  if (currentPage < totalPages) {
    nextItem.onclick = (e) => {
      e.preventDefault();
      currentPage++;
      fetchProducts();
    };
  }
  paginationWrapper.appendChild(nextItem);

  // Append Pagination to Controls
  paginationControls.appendChild(paginationWrapper);
};

// Image Preview Handler
document
  .getElementById("addProductImage")
  .addEventListener("change", function (e) {
    const reader = new FileReader();
    const preview = document.getElementById("imagePreview");

    reader.onload = function (e) {
      preview.style.display = "block";
      preview.src = e.target.result;
    };

    if (this.files[0]) {
      reader.readAsDataURL(this.files[0]);
    }
  });

addCategoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Collect form data with proper field names
  const productData = {
    title: document.getElementById("addProductName").value,
    unit_price: parseFloat(document.getElementById("addProductPrice").value),
    inventory: parseInt(document.getElementById("addProductInventory").value),
    slug: document.getElementById("addProductSlug").value,
    collection: parseInt(document.getElementById("addCategoryProduct").value),
  };

  console.log(productData);

  try {
    // 1. Create Product
    const productResponse = await fetchWithAuth(API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(productData),
    });

    if (!productResponse.ok) {
      const errorData = await productResponse.json();
      console.error("Backend validation errors:", errorData);
      throw new Error(`Validation failed: ${JSON.stringify(errorData)}`);
    }

    // 2. Upload Image
    const newProduct = await productResponse.json();
    const imageFormData = new FormData();
    imageFormData.append(
      "image",
      document.getElementById("addProductImage").files[0]
    );

    const imageResponse = await fetch(`${API_BASE_URL}${newProduct.id}/img/`, {
      method: "POST",
      headers: {
        Authorization: `JWT ${token}`,
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) throw new Error("Image upload failed");

    // Success
    fetchProducts();
    addCategoryForm.reset();
    bootstrap.Modal.getInstance(
      document.getElementById("addProductModal")
    ).hide();
  } catch (error) {
    console.error("Full error:", error);
    alert(`Operation failed: ${error.message}`);
  }
});

// Edit Product
const openEditModal = (id) => {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  // Populate category dropdown
  const editCategoryDropdown = document.getElementById("editProductCategory");
  editCategoryDropdown.innerHTML = "";
  categoriesCache.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.title;
    option.selected = category.id === product.collection;
    editCategoryDropdown.appendChild(option);
  });

  document.getElementById("editProductId").value = id;
  document.getElementById("editProductName").value = product.title;
  document.getElementById("editProductPrice").value = product.unit_price;
  document.getElementById("editProductInventory").value = product.inventory;
  document.getElementById("editProductSlug").value = product.slug;

  const modal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  modal.show();
};

editProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("editProductId").value;
  const product = {
    title: document.getElementById("editProductName").value,
    unit_price: document.getElementById("editProductPrice").value,
    inventory: document.getElementById("editProductInventory").value,
    slug: document.getElementById("editProductSlug").value,
    collection: parseInt(document.getElementById("editProductCategory").value),
  };

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Failed to edit product");
    fetchProducts();
    bootstrap.Modal.getInstance(
      document.getElementById("editProductModal")
    ).hide();
  } catch (error) {
    console.error("Error editing product:", error);
  }
});

// Delete Product
const openDeleteModal = (id) => {
  deleteProductConfirm.onclick = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      fetchProducts();
      bootstrap.Modal.getInstance(
        document.getElementById("deleteProductModal")
      ).hide();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const modal = new bootstrap.Modal(
    document.getElementById("deleteProductModal")
  );
  modal.show();
};

// Search Products
searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  currentPage = 1;
  fetchProducts();
});

// Sort Column
const sortColumn = (column) => {
  const headers = document.querySelectorAll("th");
  headers.forEach(
    (header) => (header.innerHTML = header.innerHTML.replace(/ *[▲▼]$/, ""))
  ); // Clear existing icons

  if (currentSort === column) {
    currentSort = `-${column}`;
    event.target.innerHTML += " ▼"; // Descending icon
  } else {
    currentSort = column;
    event.target.innerHTML += " ▲"; // Ascending icon
  }

  fetchProducts();
};

// Initial Fetch
fetchCategories();
fetchProducts();
