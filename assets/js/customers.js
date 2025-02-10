const API_BASE_URL = "http://localhost:8000/store/customers/";
const USERS_API_URL = "http://localhost:8000/auth/users/";
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
const customerTableBody = document.getElementById("customerTableBody");
const searchInput = document.getElementById("searchInput");
const paginationControls = document.getElementById("paginationControls");
const editCustomerForm = document.getElementById("editCustomerForm");
const deleteCustomerConfirm = document.getElementById("deleteCustomerConfirm");
const filterByMembershipDropdown =
  document.getElementById("filterByMembership");

let currentPage = 1;
let currentSort = "";
let currentSearch = "";
let currentMembership = "";
let customers = [];
let users = [];
let pageSize = 10;

// Fetch Users (to get first_name, last_name, email)
const fetchUsers = async () => {
  try {
    const response = await fetchWithAuth(USERS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch users");
    users = await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// Fetch Customers
const fetchCustomers = async () => {
  try {
    let url = `${API_BASE_URL}?page=${currentPage}&search=${currentSearch}&ordering=${currentSort}`;
    if (currentMembership) {
      url += `&membership=${currentMembership}`; // Filter customers by membership
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error("Failed to fetch customers");
    const data = await response.json();

    customers = data.results;
    pageSize = data.results.length || pageSize;

    await fetchUsers(); // Fetch users before rendering customers
    mergeCustomersWithUsers();
    renderCustomers();
    renderPagination(data);
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

// Merge Customers with Users
const mergeCustomersWithUsers = () => {
  customers.forEach((customer) => {
    const user = users.find((user) => user.id === customer.user_id); // Assuming `customer.user_id` links to User model
    if (user) {
      customer.first_name = user.first_name;
      customer.last_name = user.last_name;
      customer.email = user.email;
    }
  });
};

// Render Customers in Table
const renderCustomers = () => {
  customerTableBody.innerHTML = "";
  customers.forEach((customer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0">${
        customer.first_name || "N/A"
      }</p></td>
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0">${
        customer.last_name || "N/A"
      }</p></td>
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0">${
        customer.phone || "N/A"
      }</p></td>
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0">${
        customer.email || "N/A"
      }</p></td>
      <td class="align-middle text-center text-sm"><p class="text-xs font-weight-bold mb-0"><span class="badge text-bg-warning">
        ${
          customer.membership || "N/A"
        }
      </span></p></td>
      <td class="align-middle">
        <button class="btn btn-sm btn-primary me-2" onclick="openEditModal(${
          customer.id
        })">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${
          customer.id
        })">Delete</button>
      </td>
    `;
    customerTableBody.appendChild(row);
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
  prevItem.innerHTML = `
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>`;
  prevItem.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchCustomers();
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
      fetchCustomers();
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
  nextItem.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchCustomers();
    }
  };
  paginationWrapper.appendChild(nextItem);

  paginationControls.appendChild(paginationWrapper);
};

const sortColumn = (column) => {
  // Clear previous sort icons from all header cells
  const headers = document.querySelectorAll("th");
  headers.forEach(
    (header) => (header.innerHTML = header.innerHTML.replace(/ *[▲▼]$/, ""))
  );

  // Use the global `event` object to determine which header was clicked.
  if (currentSort === column) {
    currentSort = `-${column}`; // Reverse the sort
    event.target.innerHTML += " ▼"; // Descending icon
  } else {
    currentSort = column;
    event.target.innerHTML += " ▲"; // Ascending icon
  }
  fetchCustomers();
};

searchInput.addEventListener("input", (event) => {
    currentSearch = event.target.value;
    currentPage = 1;
    fetchCustomers();
  });

// Open Edit Modal
const openEditModal = (id) => {
  const customer = customers.find((c) => c.id === id);
  if (!customer) return;

  document.getElementById("editCustomerId").value = id;
  document.getElementById("editCustomerFirstName").value = customer.first_name;
  document.getElementById("editCustomerLastName").value = customer.last_name;
  document.getElementById("editCustomerPhone").value = customer.phone;
  document.getElementById("editCustomerEmail").value = customer.email;

  const modal = new bootstrap.Modal(
    document.getElementById("editCustomerModal")
  );
  modal.show();
};

const openDeleteModal = (id) => {
  deleteCustomerConfirm.onclick = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to Delete Customer");
      fetchCustomers();
      bootstrap.Modal.getInstance(
        document.getElementById("deleteCustomerModal").hide()
      );
    } catch (error) {
      console.error("Error deleting customer", error);
    }
  };
  const modal = new bootstrap.Modal(
    document.getElementById("deleteCustomerModal")
  );
  modal.show();
};

// Initial Fetch
fetchCustomers();
