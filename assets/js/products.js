// products.js

const API_BASE_URL = 'http://localhost:8000/store/products/';
const token = localStorage.getItem('accessToken'); // Retrieve access token

// Utility: Fetch with Authorization Header
const fetchWithAuth = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
      ...options.headers,
    },
  });
};

// DOM Elements
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const paginationControls = document.getElementById('paginationControls');
const addProductForm = document.getElementById('addProductForm');
const editProductForm = document.getElementById('editProductForm');
const deleteProductConfirm = document.getElementById('deleteProductConfirm');
const categoryDropdown = document.getElementById('categoryDropdown'); // Add this to your HTML


let currentPage = 1;
let currentSort = '';
let currentSearch = '';
let products = [];
let pageSize = 10;
let currentCategory = ''; // Track the selected category


// Fetch Categories
const fetchCategories = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:8000/store/collections/'); // Replace with your categories endpoint
    if (!response.ok) throw new Error('Failed to fetch categories');
    const categories = await response.json();
    renderCategoryDropdown(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Render Categories in Dropdown
const renderCategoryDropdown = (categories) => {
  categoryDropdown.innerHTML = '<option value="">All Categories</option>'; // Default option
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.title;
    categoryDropdown.appendChild(option);
  });
};

categoryDropdown.addEventListener('change', (event) => {
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
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();

    products = data.results;
    pageSize = data.results.length || pageSize; // Dynamically adjust pageSize if backend supports variable page sizes
    renderProducts();
    renderPagination(data); // Pass data for pagination
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Render Products in Table
const renderProducts = () => {
  productTableBody.innerHTML = '';
  products.forEach((product) => {
    const row = document.createElement('tr');
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
        <p class="text-xs font-weight-bold mb-0">${product.collection.title}</p>
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
  paginationControls.innerHTML = '';

  // Constants
  const totalPages = Math.ceil(data.count / pageSize); // Calculate total pages
  const maxPageLinks = 5; // Maximum number of visible page links

  // Create Bootstrap Pagination Wrapper
  const paginationWrapper = document.createElement('ul');
  paginationWrapper.className = 'pagination justify-content-center';

  // Previous Button
  const prevItem = document.createElement('li');
  prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
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
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.onclick = (e) => {
      e.preventDefault();
      currentPage = i;
      fetchProducts();
    };
    paginationWrapper.appendChild(pageItem);
  }

  // Next Button
  const nextItem = document.createElement('li');
  nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
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


// Add Product
addProductForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const product = {
    name: document.getElementById('addProductName').value,
    price: document.getElementById('addProductPrice').value,
    inventory: document.getElementById('addProductInventory').value,
    category: document.getElementById('addProductCategory').value,
  };

  try {
    const response = await fetchWithAuth(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to add product');
    fetchProducts();
    addProductForm.reset();
    bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
  } catch (error) {
    console.error('Error adding product:', error);
  }
});

// Edit Product
const openEditModal = (id) => {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  document.getElementById('editProductId').value = id;
  document.getElementById('editProductName').value = product.title;
  document.getElementById('editProductPrice').value = product.unit_price;
  document.getElementById('editProductInventory').value = product.inventory;
  document.getElementById('editProductCategory').value = product.collection.title;

  const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
  modal.show();
};

editProductForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('editProductId').value;
  const product = {
    name: document.getElementById('editProductName').value,
    price: document.getElementById('editProductPrice').value,
    inventory: document.getElementById('editProductInventory').value,
    category: document.getElementById('editProductCategory').value,
  };

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to edit product');
    fetchProducts();
    bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
  } catch (error) {
    console.error('Error editing product:', error);
  }
});

// Delete Product
const openDeleteModal = (id) => {
  deleteProductConfirm.onclick = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      fetchProducts();
      bootstrap.Modal.getInstance(document.getElementById('deleteProductModal')).hide();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
  modal.show();
};

// Search Products
searchInput.addEventListener('input', (event) => {
  currentSearch = event.target.value;
  currentPage = 1;
  fetchProducts();
});

// Sort Column
const sortColumn = (column) => {
  const headers = document.querySelectorAll('th');
  headers.forEach((header) => header.innerHTML = header.innerHTML.replace(/ *[▲▼]$/, '')); // Clear existing icons

  if (currentSort === column) {
    currentSort = `-${column}`;
    event.target.innerHTML += ' ▼'; // Descending icon
  } else {
    currentSort = column;
    event.target.innerHTML += ' ▲'; // Ascending icon
  }

  fetchProducts();
};

// Initial Fetch
fetchCategories();
fetchProducts();
