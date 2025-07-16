let authToken = "";
let currentSection = "analytics";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("adminLoginForm");
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const dashboardContent = document.getElementById("dashboardContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const forgotLink = document.getElementById("forgotLink");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const darkModeToggleMobile = document.getElementById("darkModeToggleMobile");
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const sidebar = document.getElementById("sidebar");
  const sidebarMobileOverlay = document.getElementById("sidebarMobileOverlay");

  // Theme toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => theme.toggle());
  }
  if (darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener("click", () => theme.toggle());
  }

  // Mobile sidebar functionality
  if (hamburgerMenu && sidebar && sidebarMobileOverlay) {
    hamburgerMenu.addEventListener("click", () => {
      sidebar.classList.add("show");
      sidebarMobileOverlay.classList.add("show");
      document.body.style.overflow = "hidden";
    });

    sidebarMobileOverlay.addEventListener("click", () => {
      sidebar.classList.remove("show");
      sidebarMobileOverlay.classList.remove("show");
      document.body.style.overflow = "";
    });

    // Close sidebar when clicking on a link (mobile)
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("show");
          sidebarMobileOverlay.classList.remove("show");
          document.body.style.overflow = "";
        }
      });
    });
  }

  // Check for existing token
  const savedToken = localStorage.getItem("ri-eat-admin-token");
  if (savedToken) {
    authToken = savedToken;
    showDashboard();
  }

  // Check for reset token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("resetToken");
  if (resetToken) {
    showResetPasswordForm(resetToken);
  }

  // Login form handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        authToken = data.token;
        localStorage.setItem("ri-eat-admin-token", authToken);
        showDashboard();
      } else {
        document.getElementById("loginError").classList.remove("hidden");
      }
    } catch (error) {
      popup.error("Connection error. Please check if the server is running.");
    }
  });

  // Forgot password handler
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = await popup.prompt("Enter your username:", (value) => value, "admin");
    
    if (username) {
      try {
        const response = await fetch("http://localhost:5000/api/admin/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          popup.success("Reset instructions sent to your email!");
        } else {
          const error = await response.json();
          popup.error(error.message || "Failed to send reset email");
        }
      } catch (error) {
        popup.error("Connection error. Please try again.");
      }
    }
  });

  // Logout handler
  logoutBtn.addEventListener("click", () => {
    popup.confirm("Are you sure you want to logout?", () => {
      localStorage.removeItem("ri-eat-admin-token");
      authToken = "";
      showLogin();
    });
  });

  // Sidebar navigation
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("sidebar-link")) {
      const section = e.target.dataset.section;
      if (section) {
        setActiveSection(section);
        loadSection(section);
      }
    }
  });

  function showLogin() {
    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }

  function showDashboard() {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    loadSection(currentSection);
  }

  function setActiveSection(section) {
    currentSection = section;
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.classList.remove("active");
    });
    document.querySelector(`[data-section="${section}"]`).classList.add("active");
  }

  async function loadSection(section) {
    const content = dashboardContent;
    content.innerHTML = '<div class="flex justify-center items-center h-64"><div class="loading-spinner"></div>Loading...</div>';

    try {
      switch (section) {
        case "analytics":
          await loadAnalytics(content);
          break;
        case "menu":
          await loadMenu(content);
          break;
        case "customers":
          await loadCustomers(content);
          break;
        case "orders":
          await loadOrders(content);
          break;
        case "rewards":
          await loadRewards(content);
          break;
        case "feedback":
          await loadFeedback(content);
          break;
        case "settings":
          await loadSettings(content);
          break;
        default:
          content.innerHTML = '<div class="card p-8 text-center">Section not found</div>';
      }
    } catch (error) {
      content.innerHTML = `<div class="card p-8 text-center text-red-500">Error loading section: ${error.message}</div>`;
    }
  }

  async function loadAnalytics(content) {
    const [summaryRes, topItemsRes, salesRes, topCustomersRes] = await Promise.all([
      fetch("http://localhost:5000/api/analytics/summary", {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      fetch("http://localhost:5000/api/analytics/top-items", {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      fetch("http://localhost:5000/api/analytics/sales-daily?days=7", {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      fetch("http://localhost:5000/api/analytics/top-customers?limit=5", {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    ]);

    const summary = await summaryRes.json();
    const topItems = await topItemsRes.json();
    const sales = await salesRes.json();
    const topCustomers = await topCustomersRes.json();

    content.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Analytics Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-300">Overview of your restaurant's performance</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="data-card">
          <div class="data-header">
            <div>
              <h3 class="data-title">Total Customers</h3>
              <p class="data-subtitle">Registered users</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
          <div class="data-value highlight">${summary.totalCustomers}</div>
        </div>

        <div class="data-card">
          <div class="data-header">
            <div>
              <h3 class="data-title">Items Sold</h3>
              <p class="data-subtitle">Total quantity</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
          <div class="data-value highlight">${summary.totalItems}</div>
        </div>

        <div class="data-card">
          <div class="data-header">
            <div>
              <h3 class="data-title">Total Revenue</h3>
              <p class="data-subtitle">All time earnings</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
          </div>
          <div class="data-value highlight">₹${summary.totalRevenue}</div>
        </div>
      </div>

      <!-- Top Items -->
      <div class="data-card mb-8">
        <div class="data-header">
          <div>
            <h3 class="data-title">Top Selling Items</h3>
            <p class="data-subtitle">Most popular menu items</p>
          </div>
        </div>
        <div class="space-y-4">
          ${topItems.map((item, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center font-bold text-orange-500">
                  ${index + 1}
                </div>
                <div>
                  <div class="font-semibold">${item.item?.name || 'Unknown Item'}</div>
                  <div class="text-sm text-gray-500">₹${item.item?.price || 0}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-lg">${item.qty}</div>
                <div class="text-sm text-gray-500">sold</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Top Customers -->
      <div class="data-card">
        <div class="data-header">
          <div>
            <h3 class="data-title">Top Customers</h3>
            <p class="data-subtitle">Highest spending customers</p>
          </div>
        </div>
        <div class="space-y-4">
          ${topCustomers.map((customer, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center font-bold text-purple-500">
                  ${index + 1}
                </div>
                <div>
                  <div class="font-semibold">${customer.customer?.name || 'Unknown Customer'}</div>
                  <div class="text-sm text-gray-500">${customer.customer?.phone || ''}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-lg">₹${customer.spent}</div>
                <div class="text-sm text-gray-500">${customer.orders} orders</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function loadMenu(content) {
    const response = await fetch("http://localhost:5000/api/menu", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const menuItems = await response.json();

    content.innerHTML = `
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Menu Management</h1>
          <p class="text-gray-600 dark:text-gray-300">Manage your restaurant menu items</p>
        </div>
        <button onclick="showAddMenuItemModal()" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Item
        </button>
      </div>

      <div class="table-enhanced">
        <table class="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${menuItems.map(item => `
              <tr>
                <td class="font-semibold">${item.name}</td>
                <td>
                  <span class="status-badge" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                    ${item.category}
                  </span>
                </td>
                <td class="font-bold">₹${item.price}</td>
                <td>
                  <div class="flex gap-2">
                    <button onclick="editMenuItem('${item._id}')" class="btn-secondary text-sm px-3 py-1">
                      Edit
                    </button>
                    <button onclick="deleteMenuItem('${item._id}')" class="btn-danger text-sm px-3 py-1">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadCustomers(content) {
    const response = await fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const customers = await response.json();

    content.innerHTML = `
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Customer Management</h1>
          <p class="text-gray-600 dark:text-gray-300">Manage customer accounts and loyalty</p>
        </div>
        <button onclick="showAddCustomerModal()" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Customer
        </button>
      </div>

      <div class="grid gap-6">
        ${customers.map(customer => `
          <div class="data-card">
            <div class="data-header">
              <div>
                <h3 class="data-title">${customer.name}</h3>
                <p class="data-subtitle">ID: ${customer.customerId}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="status-badge ${customer.rewardsAvailable > 0 ? 'status-completed' : 'status-pending'}">
                  ${customer.rewardsAvailable} Rewards
                </span>
              </div>
            </div>
            
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Phone</div>
                <div class="data-value">${customer.phone}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Total Orders</div>
                <div class="data-value highlight">${customer.totalOrders}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Target Orders</div>
                <div class="data-value">${customer.targetOrders}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Progress</div>
                <div class="data-value">${Math.round((customer.totalOrders % customer.targetOrders) / customer.targetOrders * 100)}%</div>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="data-label mb-2">Address</div>
              <div class="data-value">${customer.address}</div>
            </div>
            
            <div class="data-actions">
              <button onclick="viewCustomerDetails('${customer._id}')" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
              <button onclick="editCustomer('${customer._id}')" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="deleteCustomer('${customer._id}')" class="btn-danger">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function loadOrders(content) {
    const response = await fetch("http://localhost:5000/api/orders", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const orders = await response.json();

    content.innerHTML = `
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Orders Management</h1>
          <p class="text-gray-600 dark:text-gray-300">View and manage customer orders</p>
        </div>
        <button onclick="showAddOrderModal()" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Order
        </button>
      </div>

      <div class="grid gap-6">
        ${orders.map(order => `
          <div class="data-card">
            <div class="data-header">
              <div>
                <h3 class="data-title">Order #${order._id.slice(-6)}</h3>
                <p class="data-subtitle">${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div class="text-right">
                <div class="data-value highlight">₹${order.totalAmount}</div>
                <div class="data-subtitle">${order.items.length} items</div>
              </div>
            </div>
            
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Customer</div>
                <div class="data-value">${order.customer?.name || 'Unknown'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Customer ID</div>
                <div class="data-value">${order.customer?.customerId || 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Order Date</div>
                <div class="data-value">${new Date(order.createdAt).toLocaleString()}</div>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="data-label mb-2">Items Ordered</div>
              <div class="space-y-2">
                ${order.items.map(item => `
                  <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div class="font-semibold">${item.menuItem?.name || 'Unknown Item'}</div>
                      <div class="text-sm text-gray-500">₹${item.menuItem?.price || 0} each</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold">×${item.quantity}</div>
                      <div class="text-sm text-gray-500">₹${(item.menuItem?.price || 0) * item.quantity}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="data-actions">
              <button onclick="viewOrderDetails('${order._id}')" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
              <button onclick="editOrder('${order._id}')" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="deleteOrder('${order._id}')" class="btn-danger">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function loadRewards(content) {
    const response = await fetch("http://localhost:5000/api/reward-claims", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const claims = await response.json();

    content.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Reward Claims</h1>
        <p class="text-gray-600 dark:text-gray-300">Manage customer reward claims</p>
      </div>

      <div class="grid gap-6">
        ${claims.map(claim => `
          <div class="data-card">
            <div class="data-header">
              <div>
                <h3 class="data-title">${claim.name}</h3>
                <p class="data-subtitle">Claim #${claim._id.slice(-6)}</p>
              </div>
              <div>
                <span class="status-badge ${claim.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                  ${claim.status}
                </span>
              </div>
            </div>
            
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Phone</div>
                <div class="data-value">${claim.phone}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Customer</div>
                <div class="data-value">${claim.customer?.name || 'Unknown'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Orders at Claim</div>
                <div class="data-value highlight">${claim.ordersAtClaim}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Claim Date</div>
                <div class="data-value">${new Date(claim.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="data-label mb-2">Address</div>
              <div class="data-value">${claim.address}</div>
            </div>
            
            ${claim.experience ? `
              <div class="mb-4">
                <div class="data-label mb-2">Experience</div>
                <div class="data-value">${claim.experience}</div>
              </div>
            ` : ''}
            
            <div class="data-actions">
              ${claim.status === 'Pending' ? `
                <button onclick="completeClaim('${claim._id}')" class="btn-primary">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Mark Complete
                </button>
              ` : ''}
              <button onclick="viewClaimDetails('${claim._id}')" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function loadFeedback(content) {
    const response = await fetch("http://localhost:5000/api/feedback", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const feedback = await response.json();

    content.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Customer Feedback</h1>
        <p class="text-gray-600 dark:text-gray-300">View customer feedback and reviews</p>
      </div>

      <div class="grid gap-6">
        ${feedback.map(item => `
          <div class="data-card">
            <div class="data-header">
              <div>
                <h3 class="data-title">${item.name}</h3>
                <p class="data-subtitle">${new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span class="status-badge" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                  ${item.menuItem}
                </span>
              </div>
            </div>
            
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Phone</div>
                <div class="data-value">${item.phone}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Customer ID</div>
                <div class="data-value">${item.customerId || 'Not provided'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Menu Item</div>
                <div class="data-value">${item.menuItem}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Date</div>
                <div class="data-value">${new Date(item.createdAt).toLocaleString()}</div>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="data-label mb-2">Feedback</div>
              <div class="data-value p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">${item.feedbackText}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function loadSettings(content) {
    content.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Settings</h1>
        <p class="text-gray-600 dark:text-gray-300">Manage your account settings</p>
      </div>

      <div class="data-card">
        <div class="data-header">
          <div>
            <h3 class="data-title">Change Password</h3>
            <p class="data-subtitle">Update your admin password</p>
          </div>
        </div>
        
        <form id="changePasswordForm" class="space-y-6">
          <div class="form-group">
            <label for="currentPassword" class="form-label">Current Password</label>
            <input type="password" id="currentPassword" class="input-enhanced" required>
          </div>
          
          <div class="form-group">
            <label for="newPassword" class="form-label">New Password</label>
            <input type="password" id="newPassword" class="input-enhanced" required>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <input type="password" id="confirmPassword" class="input-enhanced" required>
          </div>
          
          <button type="submit" class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Update Password
          </button>
        </form>
      </div>
    `;

    // Add change password form handler
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      if (data.newPassword !== data.confirmPassword) {
        popup.error('New passwords do not match');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/settings/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
          })
        });

        if (response.ok) {
          popup.success('Password updated successfully');
          e.target.reset();
        } else {
          const error = await response.json();
          popup.error(error.message || 'Failed to update password');
        }
      } catch (error) {
        popup.error('Connection error. Please try again.');
      }
    });
  }

  function showResetPasswordForm(token) {
    loginSection.innerHTML = `
      <form id="resetPasswordForm" class="card p-10 w-full max-w-md relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 rounded-t-2xl"></div>
        <h2 class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Reset Password
        </h2>
        <div class="form-group">
          <label for="newPassword" class="form-label">New Password</label>
          <input type="password" id="newPassword" name="newPassword" class="input-enhanced" placeholder="Enter new password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" class="input-enhanced" placeholder="Confirm new password" required />
        </div>
        <button type="submit" class="btn-primary w-full py-4 text-lg">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Reset Password
          </button>
        </button>
        <p class="text-center mt-4">
          <a href="admin.html" class="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors">
            Back to Login
          </a>
        </p>
      </form>
    `;

    document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      if (data.newPassword !== data.confirmPassword) {
        popup.error('Passwords do not match');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            newPassword: data.newPassword
          })
        });

        if (response.ok) {
          popup.success('Password reset successfully! You can now login.');
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 2000);
        } else {
          const error = await response.json();
          popup.error(error.message || 'Failed to reset password');
        }
      } catch (error) {
        popup.error('Connection error. Please try again.');
      }
    });
  }

  // Modal functions for CRUD operations
  window.showAddMenuItemModal = async () => {
    const modalHtml = `
      <div class="modal-overlay" id="menuItemModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Add Menu Item</h3>
            <button class="modal-close" onclick="closeModal('menuItemModal')">&times;</button>
          </div>
          <form id="menuItemForm">
            <div class="form-group">
              <label for="itemName" class="form-label">Item Name</label>
              <input type="text" id="itemName" name="name" class="input-enhanced" required>
            </div>
            <div class="form-group">
              <label for="itemCategory" class="form-label">Category</label>
              <input type="text" id="itemCategory" name="category" class="input-enhanced" required>
            </div>
            <div class="form-group">
              <label for="itemPrice" class="form-label">Price (₹)</label>
              <input type="number" id="itemPrice" name="price" class="input-enhanced" required min="0" step="0.01">
            </div>
            <div class="flex gap-4 mt-6">
              <button type="submit" class="btn-primary flex-1">Add Item</button>
              <button type="button" onclick="closeModal('menuItemModal')" class="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('menuItemForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
        const response = await fetch('http://localhost:5000/api/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          popup.success('Menu item added successfully');
          closeModal('menuItemModal');
          loadSection('menu');
        } else {
          const error = await response.json();
          popup.error(error.message || 'Failed to add menu item');
        }
      } catch (error) {
        popup.error('Connection error');
      }
    });
  };

  window.editMenuItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const item = await response.json();
      
      const modalHtml = `
        <div class="modal-overlay" id="editMenuItemModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Edit Menu Item</h3>
              <button class="modal-close" onclick="closeModal('editMenuItemModal')">&times;</button>
            </div>
            <form id="editMenuItemForm">
              <div class="form-group">
                <label for="editItemName" class="form-label">Item Name</label>
                <input type="text" id="editItemName" name="name" class="input-enhanced" value="${item.name}" required>
              </div>
              <div class="form-group">
                <label for="editItemCategory" class="form-label">Category</label>
                <input type="text" id="editItemCategory" name="category" class="input-enhanced" value="${item.category}" required>
              </div>
              <div class="form-group">
                <label for="editItemPrice" class="form-label">Price (₹)</label>
                <input type="number" id="editItemPrice" name="price" class="input-enhanced" value="${item.price}" required min="0" step="0.01">
              </div>
              <div class="flex gap-4 mt-6">
                <button type="submit" class="btn-primary flex-1">Update Item</button>
                <button type="button" onclick="closeModal('editMenuItemModal')" class="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      document.getElementById('editMenuItemForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
          const updateResponse = await fetch(`http://localhost:5000/api/menu/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
          });
          
          if (updateResponse.ok) {
            popup.success('Menu item updated successfully');
            closeModal('editMenuItemModal');
            loadSection('menu');
          } else {
            const error = await updateResponse.json();
            popup.error(error.message || 'Failed to update menu item');
          }
        } catch (error) {
          popup.error('Connection error');
        }
      });
    } catch (error) {
      popup.error('Failed to load menu item details');
    }
  };

  window.deleteMenuItem = (id) => {
    popup.confirm('Are you sure you want to delete this menu item?', async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.ok) {
          popup.success('Menu item deleted successfully');
          loadSection('menu');
        } else {
          popup.error('Failed to delete menu item');
        }
      } catch (error) {
        popup.error('Connection error');
      }
    });
  };

  window.showAddCustomerModal = () => {
    const modalHtml = `
      <div class="modal-overlay" id="customerModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Add Customer</h3>
            <button class="modal-close" onclick="closeModal('customerModal')">&times;</button>
          </div>
          <form id="customerForm">
            <div class="form-group">
              <label for="customerId" class="form-label">Customer ID</label>
              <input type="text" id="customerId" name="customerId" class="input-enhanced" required>
            </div>
            <div class="form-group">
              <label for="customerName" class="form-label">Name</label>
              <input type="text" id="customerName" name="name" class="input-enhanced" required>
            </div>
            <div class="form-group">
              <label for="customerPhone" class="form-label">Phone</label>
              <input type="text" id="customerPhone" name="phone" class="input-enhanced" required>
            </div>
            <div class="form-group">
              <label for="customerAddress" class="form-label">Address</label>
              <textarea id="customerAddress" name="address" class="input-enhanced" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label for="targetOrders" class="form-label">Target Orders</label>
              <input type="number" id="targetOrders" name="targetOrders" class="input-enhanced" required min="1">
            </div>
            <div class="flex gap-4 mt-6">
              <button type="submit" class="btn-primary flex-1">Add Customer</button>
              <button type="button" onclick="closeModal('customerModal')" class="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('customerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
        const response = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          popup.success('Customer added successfully');
          closeModal('customerModal');
          loadSection('customers');
        } else {
          const error = await response.json();
          popup.error(error.message || 'Failed to add customer');
        }
      } catch (error) {
        popup.error('Connection error');
      }
    });
  };

  window.viewCustomerDetails = async (id) => {
    try {
      const [customerRes, ordersRes] = await Promise.all([
        fetch(`http://localhost:5000/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch(`http://localhost:5000/api/customers/${id}/orders`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);
      
      const customer = await customerRes.json();
      const orders = await ordersRes.json();
      
      const modalHtml = `
        <div class="modal-overlay" id="customerDetailsModal">
          <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
              <h3 class="modal-title">Customer Details - ${customer.name}</h3>
              <button class="modal-close" onclick="closeModal('customerDetailsModal')">&times;</button>
            </div>
            <div class="space-y-6">
              <div class="data-grid">
                <div class="data-item">
                  <div class="data-label">Customer ID</div>
                  <div class="data-value">${customer.customerId}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Phone</div>
                  <div class="data-value">${customer.phone}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Total Orders</div>
                  <div class="data-value highlight">${customer.totalOrders}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Target Orders</div>
                  <div class="data-value">${customer.targetOrders}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Rewards Available</div>
                  <div class="data-value highlight">${customer.rewardsAvailable}</div>
                </div>
              </div>
              
              <div>
                <div class="data-label mb-2">Address</div>
                <div class="data-value p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">${customer.address}</div>
              </div>
              
              <div>
                <div class="data-label mb-4">Recent Orders (${orders.length})</div>
                <div class="space-y-3 max-h-64 overflow-y-auto">
                  ${orders.map(order => `
                    <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div class="flex justify-between items-start mb-2">
                        <div class="font-semibold">Order #${order._id.slice(-6)}</div>
                        <div class="font-bold text-orange-500">₹${order.totalAmount}</div>
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        ${new Date(order.createdAt).toLocaleString()}
                      </div>
                      <div class="text-sm">
                        ${order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Unknown'}`).join(', ')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="mt-6">
              <button onclick="closeModal('customerDetailsModal')" class="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (error) {
      popup.error('Failed to load customer details');
    }
  };

  window.editCustomer = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const customer = await response.json();
      
      const modalHtml = `
        <div class="modal-overlay" id="editCustomerModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Edit Customer</h3>
              <button class="modal-close" onclick="closeModal('editCustomerModal')">&times;</button>
            </div>
            <form id="editCustomerForm">
              <div class="form-group">
                <label for="editCustomerId" class="form-label">Customer ID</label>
                <input type="text" id="editCustomerId" name="customerId" class="input-enhanced" value="${customer.customerId}" required>
              </div>
              <div class="form-group">
                <label for="editCustomerName" class="form-label">Name</label>
                <input type="text" id="editCustomerName" name="name" class="input-enhanced" value="${customer.name}" required>
              </div>
              <div class="form-group">
                <label for="editCustomerPhone" class="form-label">Phone</label>
                <input type="text" id="editCustomerPhone" name="phone" class="input-enhanced" value="${customer.phone}" required>
              </div>
              <div class="form-group">
                <label for="editCustomerAddress" class="form-label">Address</label>
                <textarea id="editCustomerAddress" name="address" class="input-enhanced" rows="3" required>${customer.address}</textarea>
              </div>
              <div class="form-group">
                <label for="editTargetOrders" class="form-label">Target Orders</label>
                <input type="number" id="editTargetOrders" name="targetOrders" class="input-enhanced" value="${customer.targetOrders}" required min="1">
              </div>
              <div class="flex gap-4 mt-6">
                <button type="submit" class="btn-primary flex-1">Update Customer</button>
                <button type="button" onclick="closeModal('editCustomerModal')" class="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      document.getElementById('editCustomerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
          const updateResponse = await fetch(`http://localhost:5000/api/customers/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
          });
          
          if (updateResponse.ok) {
            popup.success('Customer updated successfully');
            closeModal('editCustomerModal');
            loadSection('customers');
          } else {
            const error = await updateResponse.json();
            popup.error(error.message || 'Failed to update customer');
          }
        } catch (error) {
          popup.error('Connection error');
        }
      });
    } catch (error) {
      popup.error('Failed to load customer details');
    }
  };

  window.deleteCustomer = (id) => {
    popup.confirm('Are you sure you want to delete this customer? This will also delete all their orders.', async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.ok) {
          popup.success('Customer deleted successfully');
          loadSection('customers');
        } else {
          popup.error('Failed to delete customer');
        }
      } catch (error) {
        popup.error('Connection error');
      }
    });
  };

  window.showAddOrderModal = async () => {
    try {
      const [customersRes, menuRes] = await Promise.all([
        fetch('http://localhost:5000/api/customers', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('http://localhost:5000/api/menu', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);
      
      const customers = await customersRes.json();
      const menuItems = await menuRes.json();
      
      const modalHtml = `
        <div class="modal-overlay" id="orderModal">
          <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
              <h3 class="modal-title">Add Order</h3>
              <button class="modal-close" onclick="closeModal('orderModal')">&times;</button>
            </div>
            <form id="orderForm">
              <div class="form-group">
                <label for="orderCustomer" class="form-label">Customer</label>
                <select id="orderCustomer" name="customer" class="input-enhanced" required>
                  <option value="">Select Customer</option>
                  ${customers.map(customer => `
                    <option value="${customer._id}">${customer.name} (${customer.customerId})</option>
                  `).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Order Items</label>
                <div id="orderItems">
                  <div class="order-item flex gap-2 mb-2">
                    <select name="menuItem" class="input-enhanced flex-1" required>
                      <option value="">Select Item</option>
                      ${menuItems.map(item => `
                        <option value="${item._id}" data-price="${item.price}">${item.name} - ₹${item.price}</option>
                      `).join('')}
                    </select>
                    <input type="number" name="quantity" class="input-enhanced w-20" placeholder="Qty" min="1" required>
                    <button type="button" onclick="removeOrderItem(this)" class="btn-danger px-3">×</button>
                  </div>
                </div>
                <button type="button" onclick="addOrderItem()" class="btn-secondary text-sm mt-2">Add Item</button>
              </div>
              
              <div class="flex gap-4 mt-6">
                <button type="submit" class="btn-primary flex-1">Create Order</button>
                <button type="button" onclick="closeModal('orderModal')" class="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const customer = formData.get('customer');
        const menuItems = formData.getAll('menuItem');
        const quantities = formData.getAll('quantity');
        
        const items = menuItems.map((menuItem, index) => ({
          menuItem,
          quantity: parseInt(quantities[index])
        })).filter(item => item.menuItem && item.quantity > 0);
        
        if (items.length === 0) {
          popup.error('Please add at least one item to the order');
          return;
        }
        
        try {
          const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ customer, items })
          });
          
          if (response.ok) {
            popup.success('Order created successfully');
            closeModal('orderModal');
            loadSection('orders');
          } else {
            const error = await response.json();
            popup.error(error.message || 'Failed to create order');
          }
        } catch (error) {
          popup.error('Connection error');
        }
      });
    } catch (error) {
      popup.error('Failed to load data for order creation');
    }
  };

  window.addOrderItem = () => {
    const container = document.getElementById('orderItems');
    const menuSelect = container.querySelector('select[name="menuItem"]');
    const newItem = container.querySelector('.order-item').cloneNode(true);
    
    // Reset values
    newItem.querySelector('select').value = '';
    newItem.querySelector('input').value = '';
    
    container.appendChild(newItem);
  };

  window.removeOrderItem = (button) => {
    const container = document.getElementById('orderItems');
    if (container.children.length > 1) {
      button.closest('.order-item').remove();
    }
  };

  window.viewOrderDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const order = await response.json();
      
      const modalHtml = `
        <div class="modal-overlay" id="orderDetailsModal">
          <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
              <h3 class="modal-title">Order Details - #${order._id.slice(-6)}</h3>
              <button class="modal-close" onclick="closeModal('orderDetailsModal')">&times;</button>
            </div>
            <div class="space-y-6">
              <div class="data-grid">
                <div class="data-item">
                  <div class="data-label">Customer</div>
                  <div class="data-value">${order.customer?.name || 'Unknown'}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Customer ID</div>
                  <div class="data-value">${order.customer?.customerId || 'N/A'}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Order Date</div>
                  <div class="data-value">${new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Total Amount</div>
                  <div class="data-value highlight">₹${order.totalAmount}</div>
                </div>
              </div>
              
              <div>
                <div class="data-label mb-4">Items Ordered</div>
                <div class="space-y-3">
                  ${order.items.map(item => `
                    <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div class="font-semibold">${item.menuItem?.name || 'Unknown Item'}</div>
                        <div class="text-sm text-gray-500">₹${item.menuItem?.price || 0} each</div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold">×${item.quantity}</div>
                        <div class="text-sm text-gray-500">₹${(item.menuItem?.price || 0) * item.quantity}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="mt-6">
              <button onclick="closeModal('orderDetailsModal')" class="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (error) {
      popup.error('Failed to load order details');
    }
  };

  window.editOrder = async (id) => {
    popup.info('Order editing functionality would require complex logic to handle inventory and customer rewards. This is typically handled through order cancellation and new order creation.');
  };

  window.deleteOrder = (id) => {
    popup.confirm('Are you sure you want to delete this order? This will affect customer loyalty points.', async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.ok) {
          popup.success('Order deleted successfully');
          loadSection('orders');
        } else {
          popup.error('Failed to delete order');
        }
      } catch (error) {
        popup.error('Connection error');
      }
    });
  };

  window.completeClaim = (id) => {
    popup.confirm('Mark this reward claim as completed?', async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reward-claims/${id}/complete`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (response.ok) {
          popup.success('Reward claim marked as completed');
          loadSection('rewards');
        } else {
          popup.error('Failed to complete claim');
        }
      } catch (error) {
        popup.error('Connection error');
      }
    });
  };

  window.viewClaimDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reward-claims/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const claim = await response.json();
      
      const modalHtml = `
        <div class="modal-overlay" id="claimDetailsModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Reward Claim Details - ${claim.name}</h3>
              <button class="modal-close" onclick="closeModal('claimDetailsModal')">&times;</button>
            </div>
            <div class="space-y-6">
              <div class="data-grid">
                <div class="data-item">
                  <div class="data-label">Status</div>
                  <div class="data-value">
                    <span class="status-badge ${claim.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                      ${claim.status}
                    </span>
                  </div>
                </div>
                <div class="data-item">
                  <div class="data-label">Phone</div>
                  <div class="data-value">${claim.phone}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Customer</div>
                  <div class="data-value">${claim.customer?.name || 'Unknown'}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Orders at Claim</div>
                  <div class="data-value highlight">${claim.ordersAtClaim}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Claim Date</div>
                  <div class="data-value">${new Date(claim.createdAt).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <div class="data-label mb-2">Address</div>
                <div class="data-value p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">${claim.address}</div>
              </div>
              
              ${claim.experience ? `
                <div>
                  <div class="data-label mb-2">Customer Experience</div>
                  <div class="data-value p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">${claim.experience}</div>
                </div>
              ` : ''}
            </div>
            <div class="mt-6 flex gap-4">
              ${claim.status === 'Pending' ? `
                <button onclick="completeClaim('${claim._id}'); closeModal('claimDetailsModal');" class="btn-primary flex-1">
                  Mark Complete
                </button>
              ` : ''}
              <button onclick="closeModal('claimDetailsModal')" class="btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (error) {
      popup.error('Failed to load claim details');
    }
  };

  window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  };

  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.remove();
    }
  });
});