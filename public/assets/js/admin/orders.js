const API_BASE_URL = "https://suuqcasri-production-839407217d71.herokuapp.com/store/orders/";
const USERS_API_URL = "https://suuqcasri-production-839407217d71.herokuapp.com/auth/users/";
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
const orderTableBody = document.getElementById("orderTableBody");
const searchInput = document.getElementById("searchInput");
const paginationControls = document.getElementById("paginationControls");
const editOrderForm = document.getElementById("editOrderForm");
const deleteOrderConfirm = document.getElementById("deleteOrderConfirm");
const filterByPaymentStatusDropdown = document.getElementById("filterByPaymentStatus");

let currentPage = 1;
let currentSort = "";
let currentSearch = "";
let currentPaymentStatus = "";
let orders = [];
let users = [];
let pageSize = 10;

// Fetch Users (to get first_name, last_name)
const fetchUsers = async () => {
  try {
    const response = await fetchWithAuth(USERS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch users");
    users = await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// Fetch Orders
const fetchOrders = async () => {
  try {
    let url = `${API_BASE_URL}?page=${currentPage}&search=${currentSearch}&ordering=${currentSort}`;
    if (currentPaymentStatus) {
      url += `&payment_status=${currentPaymentStatus}`;
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data = await response.json();

    orders = data.results;
    pageSize = data.results.length || pageSize;

    await fetchUsers();
    mergeOrdersWithUsers();
    renderOrders();
    renderPagination(data);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

// Merge Orders with User Details
const mergeOrdersWithUsers = () => {
  orders.forEach((order) => {
    const user = users.find((user) => user.id === order.customer);
    if (user) {
      order.customer_name = `${user.first_name} ${user.last_name}`;
    } else {
      order.customer_name = "Unknown";
    }
  });
};

// Calculate Total Amount of an Order
const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
};

// Render Orders in Table
const renderOrders = () => {
  orderTableBody.innerHTML = "";
  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="align-middle text-center text-sm">${order.id}</td>
      <td class="align-middle text-center text-sm">${new Date(order.placed_at).toLocaleDateString()}</td>
      <td class="align-middle text-center text-sm">${order.customer_name || "N/A"}</td>
      <td class="align-middle text-center text-sm">
        <button class="btn btn-sm btn-info" onclick="openProductDetailsModal(${order.id})">View Products</button>
      </td>
      <td class="align-middle text-center text-sm">$ ${calculateTotalAmount(order.items)}</td>
      <td class="align-middle text-center text-sm"><span class="badge bg-warning">${order.payment_status}</span></td>
      <td class="align-middle">
        <button class="btn btn-sm btn-primary me-2" onclick="openEditModal(${order.id},'${order.payment_status}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${order.id})">Delete</button>
      </td>
    `;
    orderTableBody.appendChild(row);
  });
};

// Render Pagination
const renderPagination = (data) => {
  paginationControls.innerHTML = "";
  const totalPages = Math.ceil(data.count / pageSize);
  const paginationWrapper = document.createElement("ul");
  paginationWrapper.className = "pagination justify-content-center";

  // Previous Button
  const prevItem = document.createElement("li");
  prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous">&laquo;</a>`;
  prevItem.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchOrders();
    }
  };
  paginationWrapper.appendChild(prevItem);

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.onclick = () => {
      currentPage = i;
      fetchOrders();
    };
    paginationWrapper.appendChild(pageItem);
  }

  // Next Button
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next">&raquo;</a>`;
  nextItem.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchOrders();
    }
  };
  paginationWrapper.appendChild(nextItem);

  paginationControls.appendChild(paginationWrapper);
};

// Extract Payment Statuses and Populate Dropdown
const extractPaymentStatuses = () => {
  const statuses = ["Pending", "Complete", "Failed"];
  renderPaymentStatusDropdown(statuses);
};

const renderPaymentStatusDropdown = (statuses) => {
  filterByPaymentStatusDropdown.innerHTML = '<option value="">All Status</option>';
  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    filterByPaymentStatusDropdown.appendChild(option);
  });
};

// Handle Payment Status Filtering
filterByPaymentStatusDropdown.addEventListener("change", (event) => {
  currentPaymentStatus = event.target.value;
  currentPage = 1;
  fetchOrders();
});

// Search Orders by Date
searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  currentPage = 1;
  fetchOrders();
});

// Open Product Details Modal
const openProductDetailsModal = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
  
    const productDetailsTableBody = document.getElementById("productDetailsTableBody");
    productDetailsTableBody.innerHTML = "";
  
    order.items.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.product.title}</td>
        <td>${item.product.unit_price} USD</td>
        <td>${item.quantity}</td>
      `;
      productDetailsTableBody.appendChild(row);
    });
  
    const modal = new bootstrap.Modal(document.getElementById("productDetailsModal"));
    modal.show();
  };

// Open Edit Modal
const openEditModal = (orderId, paymentStatus) => {
  document.getElementById("editOrderId").value = orderId;
  document.getElementById("editOrderPaymentStatus").value = paymentStatus;
  const modal = new bootstrap.Modal(document.getElementById("editOrderModal"));
  modal.show();
};

// Edit Order
editOrderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const orderId = document.getElementById("editOrderId").value;
  const updatedData = {
    payment_status: document.getElementById("editOrderPaymentStatus").value,
  };

  await fetchWithAuth(`${API_BASE_URL}${orderId}/`, {
    method: "PATCH",
    body: JSON.stringify(updatedData),
  });

  fetchOrders();
  bootstrap.Modal.getInstance(document.getElementById("editOrderModal")).hide();
});

// Delete Order
const openDeleteModal = (id) => {
  deleteOrderConfirm.onclick = async () => {
    await fetchWithAuth(`${API_BASE_URL}${id}/`, { method: "DELETE" });
    fetchOrders();
    bootstrap.Modal.getInstance(document.getElementById("deleteOrderModal")).hide();
  };

  const modal = new bootstrap.Modal(document.getElementById("deleteOrderModal"));
  modal.show();
};

// Initial Fetch
fetchOrders();
extractPaymentStatuses();