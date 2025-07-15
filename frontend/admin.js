document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const loginError = document.getElementById("loginError");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const dashboardContent = document.getElementById("dashboardContent");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const logoutBtn = document.getElementById("logoutBtn");
  const forgotLink = document.getElementById("forgotLink");

  // Automatically handle password reset if token passed in URL
  async function handleResetToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (!token) return;

    // Ask user for new password
    const newPassword = await prompt("Enter your new password (min 6 characters):");
    if (!newPassword) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        await alert(data.message || "Failed to reset password");
        return;
      }
      await alert(
        "Password reset successful. You can now log in with your new password."
      );
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      await alert("Server error. Please try again later.");
    }
  }

  // Invoke on load
  handleResetToken();

  

  // --- Login Logic (real API) ---
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = adminLoginForm.username.value.trim();
    const password = adminLoginForm.password.value.trim();

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("ri-eat-admin-token", data.token);
        loginSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");
        loginError.classList.add("hidden");
      } else {
        loginError.textContent = "Invalid credentials. Please try again.";
        loginError.classList.remove("hidden");
      }
    } catch (err) {
      loginError.textContent = "Server error. Please try again later.";
      loginError.classList.remove("hidden");
    }
  });

  if (forgotLink) {
    forgotLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const username = await prompt("Enter your admin username:");
      if (!username) return;
      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/forgot-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          await alert(data.message || "Error generating reset token");
          return;
        }
        await alert("A reset token has been sent to your registered email address.");
        const token = await prompt("Enter the reset token you received:");
        if (!token) return;
        const newPassword = await prompt("Enter your new password:");
        if (!newPassword) return;
        const res2 = await fetch(
          "http://localhost:5000/api/admin/reset-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
          }
        );
        const data2 = await res2.json();
        if (!res2.ok) {
          await alert(data2.message || "Failed to reset password");
          return;
        }
        await alert(
          "Password reset successful. You can now log in with your new password."
        );
      } catch (err) {
        await alert("Server error. Please try again later.");
      }
    });
  }

  // --- Sidebar Navigation ---
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sidebarLinks.forEach((l) =>
        l.classList.remove("bg-orange-100", "dark:bg-gray-700")
      );
      link.classList.add("bg-orange-100", "dark:bg-gray-700");
      loadSection(link.dataset.section);
    });
  });

  // --- Menu Management ---
  async function loadMenuSection() {
    dashboardContent.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-orange-500 dark:text-yellow-400">🍔 Menu Management</h2>
                <button id="addMenuItemBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add New Item</button>
            </div>
            <div id="menuTableContainer" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"></div>
            <!-- Modal for Add/Edit -->
            <div id="menuItemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h3 id="modalTitle" class="text-xl font-bold mb-4">Add Menu Item</h3>
                    <form id="menuItemForm">
                        <input type="hidden" id="menuItemId">
                        <div class="mb-4">
                            <label for="itemName" class="block text-sm font-medium mb-1 dark:text-gray-200">Name</label>
                            <input type="text" id="itemName" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required>
                        </div>
                        <div class="mb-4">
                            <label for="itemCategory" class="block text-sm font-medium mb-1 dark:text-gray-200">Category</label>
                            <!-- Input with datalist to allow new categories while suggesting existing ones -->
                            <input list="itemCategoryList" id="itemCategory" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="e.g. Beverages" required />
                            <datalist id="itemCategoryList"></datalist>
                        </div>
                        <div class="mb-6">
                            <label for="itemPrice" class="block text-sm font-medium mb-1 dark:text-gray-200">Price</label>
                            <input type="number" id="itemPrice" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required>
                        </div>
                        <div class="flex justify-end gap-4">
                            <button type="button" id="cancelModalBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                            <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

    await fetchAndDisplayMenu();

    document
      .getElementById("addMenuItemBtn")
      .addEventListener("click", () => openMenuModal());
    document
      .getElementById("cancelModalBtn")
      .addEventListener("click", closeMenuModal);
    document
      .getElementById("menuItemForm")
      .addEventListener("submit", handleMenuFormSubmit);
  }

  async function fetchAndDisplayMenu() {
    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const res = await fetch("http://localhost:5000/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const menuItems = await res.json();

      const tableContainer = document.getElementById("menuTableContainer");
      if (menuItems.length === 0) {
        tableContainer.innerHTML =
          '<p class="text-center text-gray-500 dark:text-gray-400">No menu items found. Add one to get started!</p>';
        // Ensure category suggestions reset when no items
        populateCategoryDatalist([]);
        return;
      }

      tableContainer.innerHTML = `
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b dark:border-gray-600">
                            <th class="p-2">Name</th>
                            <th class="p-2">Category</th>
                            <th class="p-2">Price</th>
                            <th class="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${menuItems
                          .map(
                            (item) => `
                            <tr class="border-b dark:border-gray-700">
                                <td class="p-2">${item.name}</td>
                                <td class="p-2">${item.category}</td>
                                <td class="p-2">₹${item.price}</td>
                                <td class="p-2">
                                    <button class="edit-btn text-blue-500 hover:underline" data-id="${item._id}">Edit</button>
                                    <button class="delete-btn text-red-500 hover:underline ml-2" data-id="${item._id}">Delete</button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            `;

      document.querySelectorAll(".edit-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const itemId = e.target.getAttribute("data-id");
          if (!itemId) {
            console.error("No item ID found on edit button");
            return;
          }
          openMenuModal(itemId);
        })
      );
      document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const itemId = e.target.getAttribute("data-id");
          if (!itemId) {
            console.error("No item ID found on delete button");
            return;
          }
          deleteMenuItem(itemId);
        })
      );

      // Populate category datalist based on fetched items
      const categories = Array.from(
        new Set(menuItems.map((it) => it.category))
      ).sort();
      populateCategoryDatalist(categories);
    } catch (error) {
      console.error("Error fetching menu:", error);
      document.getElementById("menuTableContainer").innerHTML =
        '<p class="text-red-500 text-center">Failed to load menu items.</p>';
      showToast("Failed to load menu items.", "error");
    }
  }

  // Helper to fill the datalist element with category options
  function populateCategoryDatalist(categories) {
    const list = document.getElementById("itemCategoryList");
    if (!list) return;
    list.innerHTML = categories
      .map((c) => `<option value="${c}"></option>`)
      .join("");
  }

  function openMenuModal(itemId = null) {
    const modal = document.getElementById("menuItemModal");
    const form = document.getElementById("menuItemForm");
    form.reset();
    document.getElementById("menuItemId").value = "";

    if (itemId) {
      // Fetch the item data by ID and populate the form
      const token = localStorage.getItem("ri-eat-admin-token");
      fetch(`http://localhost:5000/api/menu/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch menu item");
          return res.json();
        })
        .then((item) => {
          if (!item || !item._id) {
            throw new Error("Invalid menu item data");
          }
          document.getElementById("modalTitle").textContent = "Edit Menu Item";
          document.getElementById("menuItemId").value = item._id;
          document.getElementById("itemName").value = item.name;
          document.getElementById("itemCategory").value = item.category;
          document.getElementById("itemPrice").value = item.price;
        })
        .catch((error) => {
          console.error("Error fetching menu item:", error);
          showToast(
            "Failed to load menu item for editing. Please try again.",
            "error"
          );
          closeMenuModal();
        });
    } else {
      document.getElementById("modalTitle").textContent = "Add Menu Item";
    }
    modal.classList.remove("hidden");
  }

  function closeMenuModal() {
    document.getElementById("menuItemModal").classList.add("hidden");
  }

  async function handleMenuFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("ri-eat-admin-token");
    const itemId = document.getElementById("menuItemId").value;
    const isEditing = !!itemId;

    const body = JSON.stringify({
      name: document.getElementById("itemName").value,
      category: document.getElementById("itemCategory").value,
      price: Number(document.getElementById("itemPrice").value), // Ensure price is a number
    });

    const url = isEditing
      ? `http://localhost:5000/api/menu/${itemId}`
      : "http://localhost:5000/api/menu";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      if (!res.ok) throw new Error("Failed to save item");
      closeMenuModal();
      await fetchAndDisplayMenu();
      showToast(
        isEditing
          ? "Menu item updated successfully."
          : "Menu item added successfully.",
        "success"
      );
    } catch (error) {
      console.error("Error saving item:", error);
      showToast(
        error.message || "Failed to save menu item. Please try again.",
        "error"
      );
    }
  }

  async function deleteMenuItem(itemId) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const res = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchAndDisplayMenu();
      showToast("Menu item deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast("Failed to delete menu item.", "error");
    }
  }

  // =====================
  //  Customer Management
  // =====================

  async function loadCustomerSection() {
    dashboardContent.innerHTML = `
            <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h2 class="text-2xl font-bold text-orange-500 dark:text-yellow-400">👥 Customer Management</h2>
                <div class="flex gap-2 w-full sm:w-auto">
                    <input id="customerSearchInput" type="text" placeholder="Search..." class="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white" />
                    <select id="customerSortSelect" class="p-2 border rounded dark:bg-gray-700 dark:text-white">
                        <option value="">Sort: Default</option>
                        <option value="orders">Most Orders</option>
                        <option value="spend">Highest Spend</option>
                     </select>
                     <button id="addCustomerBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 whitespace-nowrap">Add New Customer</button>
                </div>
            </div>
            <div id="customerTableContainer" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"></div>

            <!-- Modal for Add/Edit Customer -->
            <div id="customerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-40">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                    <h3 id="customerModalTitle" class="text-xl font-bold mb-4">Add Customer</h3>
                    <form id="customerForm" class="space-y-4">
                        <input type="hidden" id="customerMongoId" />

                        <div>
                            <label for="customerIdInput" class="block text-sm font-medium mb-1 dark:text-gray-200">Customer ID</label>
                            <input id="customerIdInput" type="text" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label for="customerNameInput" class="block text-sm font-medium mb-1 dark:text-gray-200">Name</label>
                            <input id="customerNameInput" type="text" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label for="customerPhoneInput" class="block text-sm font-medium mb-1 dark:text-gray-200">Phone</label>
                            <input id="customerPhoneInput" type="text" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label for="customerAddressInput" class="block text-sm font-medium mb-1 dark:text-gray-200">Address</label>
                            <input id="customerAddressInput" type="text" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="targetOrdersInput" class="block text-sm font-medium mb-1 dark:text-gray-200">Target Orders</label>
                                <input id="targetOrdersInput" type="number" min="1" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                            </div>
                            <div>
                                <label for="totalOrdersInput" class="block text-sm font-medium mb-1 dark:text-gray-200">Total Orders</label>
                                <input id="totalOrdersInput" type="number" min="0" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value="0" />
                            </div>
                        </div>

                        <div class="flex justify-end gap-4 pt-2">
                            <button type="button" id="cancelCustomerModalBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                            <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Customer Detail Modal -->
            <div id="customerDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
                <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <h3 class="text-xl font-bold mb-4">Customer Details</h3>
                    <div id="customerDetailContent" class="space-y-4"></div>
                    <div class="flex justify-end mt-4">
                        <button id="closeCustomerDetailBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Close</button>
                    </div>
                </div>
            </div>
            
        `;

    // Initial fetch
    await fetchAndDisplayCustomers();

    // Listeners
    document
      .getElementById("addCustomerBtn")
      .addEventListener("click", () => openCustomerModal());
    document
      .getElementById("cancelCustomerModalBtn")
      .addEventListener("click", closeCustomerModal);
    document
      .getElementById("customerForm")
      .addEventListener("submit", handleCustomerFormSubmit);
    document
      .getElementById("customerSearchInput")
      .addEventListener("input", () => fetchAndDisplayCustomers());
    document
      .getElementById("customerSortSelect")
      .addEventListener("change", () => fetchAndDisplayCustomers());

    document
      .getElementById("closeCustomerDetailBtn")
      .addEventListener("click", () =>
        document.getElementById("customerDetailModal").classList.add("hidden")
      );
  }

  async function fetchAndDisplayCustomers() {
    const token = localStorage.getItem("ri-eat-admin-token");
    const query = document.getElementById("customerSearchInput")?.value.trim();
    const sortVal = document.getElementById("customerSortSelect")?.value;
    let url = "http://localhost:5000/api/customers";
    const params = [];
    if (query) params.push(`q=${encodeURIComponent(query)}`);
    if (sortVal) params.push(`sort=${sortVal}`);
    if (params.length) url += `?${params.join("&")}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const customers = await res.json();

      const containerCheck = document.getElementById("customerTableContainer");
      if (!containerCheck) {
        return;
      }
      if (customers.length === 0) {
        containerCheck.innerHTML =
          '<p class="text-center text-gray-500 dark:text-gray-400">No customers found.</p>';
        return;
      }

      containerCheck.innerHTML = `
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b dark:border-gray-600">
                            <th class="p-2">Customer ID</th>
                            <th class="p-2">Name</th>
                            <th class="p-2">Phone</th>
                            <th class="p-2">Total / Target Orders</th>
                            <th class="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers
                          .map(
                            (c) => `
                            <tr class="border-b dark:border-gray-700">
                                <td class="p-2">${c.customerId}</td>
                                <td class="p-2">${c.name}</td>
                                <td class="p-2">${c.phone}</td>
                                <td class="p-2">${c.totalOrders} / ${c.targetOrders}</td>
                                <td class="p-2">
                                    <button class="cust-view-btn text-green-500 hover:underline mr-2" data-id="${c._id}">View</button>
                                    <button class="cust-edit-btn text-blue-500 hover:underline" data-id="${c._id}">Edit</button>
                                    <button class="cust-del-btn text-red-500 hover:underline ml-2" data-id="${c._id}">Delete</button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>`;

      // Bind row buttons
      containerCheck.querySelectorAll(".cust-edit-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          openCustomerModal(id);
        })
      );
      containerCheck.querySelectorAll(".cust-del-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          deleteCustomer(id);
        })
      );
      containerCheck.querySelectorAll(".cust-view-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          openCustomerDetail(id);
        })
      );
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to load customers", "error");
    }
  }

  function openCustomerModal(id = null) {
    const modal = document.getElementById("customerModal");
    const form = document.getElementById("customerForm");
    form.reset();
    document.getElementById("customerMongoId").value = "";

    if (id) {
      const token = localStorage.getItem("ri-eat-admin-token");
      fetch(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch customer");
          return res.json();
        })
        .then((cust) => {
          document.getElementById("customerModalTitle").textContent =
            "Edit Customer";
          document.getElementById("customerMongoId").value = cust._id;
          document.getElementById("customerIdInput").value = cust.customerId;
          document.getElementById("customerNameInput").value = cust.name;
          document.getElementById("customerPhoneInput").value = cust.phone;
          document.getElementById("customerAddressInput").value = cust.address;
          document.getElementById("targetOrdersInput").value =
            cust.targetOrders;
          document.getElementById("totalOrdersInput").value = cust.totalOrders;
        })
        .catch((err) => {
          console.error(err);
          showToast(err.message || "Failed to load customer", "error");
          return;
        });
    } else {
      document.getElementById("customerModalTitle").textContent =
        "Add Customer";
      document.getElementById("totalOrdersInput").value = 0;
    }

    modal.classList.remove("hidden");
  }

  function closeCustomerModal() {
    document.getElementById("customerModal").classList.add("hidden");
  }

  async function handleCustomerFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("ri-eat-admin-token");

    const mongoId = document.getElementById("customerMongoId").value;
    const isEditing = !!mongoId;

    const body = JSON.stringify({
      customerId: document.getElementById("customerIdInput").value.trim(),
      name: document.getElementById("customerNameInput").value.trim(),
      phone: document.getElementById("customerPhoneInput").value.trim(),
      address: document.getElementById("customerAddressInput").value.trim(),
      targetOrders: Number(document.getElementById("targetOrdersInput").value),
      totalOrders: Number(document.getElementById("totalOrdersInput").value),
    });

    const url = isEditing
      ? `http://localhost:5000/api/customers/${mongoId}`
      : "http://localhost:5000/api/customers";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Phone number already exists");
        }
        throw new Error("Failed to save customer");
      }

      closeCustomerModal();
      await fetchAndDisplayCustomers();
      showToast(
        isEditing
          ? "Customer updated successfully"
          : "Customer added successfully",
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save customer", "error");
    }
  }

  async function deleteCustomer(id) {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      await fetchAndDisplayCustomers();
      showToast("Customer deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete customer", "error");
    }
  }

  async function openCustomerDetail(id) {
    const modal = document.getElementById("customerDetailModal");
    const content = document.getElementById("customerDetailContent");
    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const [custRes, ordersRes, claimsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/customers/${id}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/reward-claims?customer=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!custRes.ok) throw new Error("Failed to fetch customer");
      if (!ordersRes.ok) throw new Error("Failed to fetch orders");
      if (!claimsRes.ok) throw new Error("Failed to fetch claims");
      const cust = await custRes.json();
      const orders = await ordersRes.json();
      const claims = await claimsRes.json();
      const rewardsCount = claims.length;
      const ordersFromClaims = claims.reduce(
        (sum, c) => sum + (c.ordersAtClaim || 0),
        0
      );
      const lifetimeOrders = ordersFromClaims + cust.totalOrders;

      // Build HTML
      let html = `
            <p><strong>ID:</strong> ${cust.customerId}</p>
            <p><strong>Name:</strong> ${cust.name}</p>
            <p><strong>Phone:</strong> ${cust.phone}</p>
            <p><strong>Address:</strong> ${cust.address}</p>
            <p><strong>Total Orders (current cycle):</strong> ${cust.totalOrders}</p>
            <p><strong>Lifetime Orders:</strong> ${lifetimeOrders}</p>
            <p><strong>Rewards Claimed:</strong> ${rewardsCount}</p>
            <h4 class="text-lg font-semibold mt-4">Order History</h4>`;

      if (orders.length === 0) {
        html += '<p class="text-gray-500">No orders found.</p>';
      } else {
        html += `<canvas id="ordersChart" class="w-full h-64 mb-4"></canvas>`;
        html += `<table class="w-full text-left mb-2">
                     <thead>
                       <tr class="border-b dark:border-gray-600">
                         <th class="p-2">Date</th><th class="p-2">Items</th><th class="p-2">Amount (₹)</th>
                       </tr>
                     </thead><tbody>`;
        orders.forEach((o) => {
          const date = new Date(o.createdAt).toLocaleDateString();
          const items = o.items
            .map((it) => `${it.menuItem.name} x${it.quantity}`)
            .join(", ");
          html += `<tr class="border-b dark:border-gray-700"><td class="p-2">${date}</td><td class="p-2">${items}</td><td class="p-2">${o.totalAmount}</td></tr>`;
        });
        html += `</tbody></table>`;
      }

      content.innerHTML = html;

      modal.classList.remove("hidden");

      if (orders.length > 0) {
        await ensureChartJsLoaded();
        const ctx = document.getElementById("ordersChart").getContext("2d");
        const chartData = {
          labels: orders.map((o) => new Date(o.createdAt).toLocaleDateString()),
          datasets: [
            {
              label: "Order Amount",
              data: orders.map((o) => o.totalAmount),
              backgroundColor: "rgba(255,159,64,0.6)",
              borderColor: "rgba(255,99,132,1)",
              fill: false,
            },
          ],
        };
        new Chart(ctx, {
          type: "bar",
          data: chartData,
          options: { plugins: { legend: { display: false } } },
        });
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load details", "error");
    }
  }

  // Dynamically load Chart.js if not present
  function ensureChartJsLoaded() {
    return new Promise((resolve) => {
      if (window.Chart) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }

  // =====================
  //  Orders Management
  // =====================

  async function loadOrdersSection() {
    dashboardContent.innerHTML = `
      <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 class="text-2xl font-bold text-orange-500 dark:text-yellow-400">🧾 Orders</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <input id="orderSearchInput" type="text" placeholder="Search by customer or ID..." class="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white" />
          <button id="addOrderBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 whitespace-nowrap">Add New Order</button>
        </div>
      </div>
      <div id="ordersTableContainer" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"></div>

      <!-- Order Detail Modal -->
      <div id="orderDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Order Details</h3>
          <div id="orderDetailContent" class="space-y-4"></div>
          <div class="flex justify-end mt-4"><button id="closeOrderDetailBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Close</button></div>
        </div>
      </div>

      <!-- Create Order Modal -->
      <div id="orderCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Create Order</h3>
          <form id="orderCreateForm" class="space-y-4">
             <div>
               <label class="block text-sm font-medium mb-1 dark:text-gray-200">Customer</label>
               <select id="orderCustomerSelect" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required></select>
             </div>
             <div id="orderItemsContainer" class="space-y-2"></div>
             <button type="button" id="addOrderItemRow" class="bg-blue-500 text-white px-3 py-1 rounded">Add Item</button>
             <div class="text-right font-semibold">Total: ₹<span id="orderTotalSpan">0</span></div>
             <div class="flex justify-end gap-4 pt-2">
                <button type="button" id="cancelOrderCreateBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
             </div>
          </form>
        </div>
      </div>

    `;

    await fetchAndDisplayOrders();

    document
      .getElementById("orderSearchInput")
      .addEventListener("input", () => fetchAndDisplayOrders());
    document
      .getElementById("closeOrderDetailBtn")
      .addEventListener("click", () =>
        document.getElementById("orderDetailModal").classList.add("hidden")
      );
    document
      .getElementById("addOrderBtn")
      .addEventListener("click", () => openOrderCreateModal());

    document
      .getElementById("cancelOrderCreateBtn")
      .addEventListener("click", () =>
        document.getElementById("orderCreateModal").classList.add("hidden")
      );
    document
      .getElementById("addOrderItemRow")
      .addEventListener("click", addOrderItemRow);
    document
      .getElementById("orderCreateForm")
      .addEventListener("submit", handleOrderCreateSubmit);
  }

  async function fetchAndDisplayOrders() {
    const token = localStorage.getItem("ri-eat-admin-token");
    let url = "http://localhost:5000/api/orders";
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      let orders = await res.json();

      const searchVal = document
        .getElementById("orderSearchInput")
        ?.value.trim()
        .toLowerCase();
      if (searchVal) {
        orders = orders.filter(
          (o) =>
            o._id.toLowerCase().includes(searchVal) ||
            (o.customer?.customerId || "").toLowerCase().includes(searchVal) ||
            (o.customer?.name || "").toLowerCase().includes(searchVal)
        );
      }

      const container = document.getElementById("ordersTableContainer");
      if (orders.length === 0) {
        container.innerHTML =
          '<p class="text-center text-gray-500 dark:text-gray-400">No orders found.</p>';
        return;
      }

      container.innerHTML = `
        <table class="w-full text-left">
          <thead>
            <tr class="border-b dark:border-gray-600">
              <th class="p-2">Date</th>
              <th class="p-2">Order ID</th>
              <th class="p-2">Customer</th>
              <th class="p-2">Amount (₹)</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map((o) => {
                const date = new Date(o.createdAt).toLocaleDateString();
                return `<tr class="border-b dark:border-gray-700">
                <td class="p-2">${date}</td>
                <td class="p-2">${o._id.slice(-6)}</td>
                <td class="p-2">${o.customer?.customerId || ""} - ${
                  o.customer?.name || ""
                }</td>
                <td class="p-2">${o.totalAmount}</td>
                <td class="p-2">
                  <button class="order-view-btn text-green-500 hover:underline mr-2" data-id="${
                    o._id
                  }">View</button>
                  <button class="order-edit-btn text-blue-500 hover:underline mr-2" data-id="${
                    o._id
                  }">Edit</button>
                  <button class="order-del-btn text-red-500 hover:underline" data-id="${
                    o._id
                  }">Delete</button>
                </td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>`;

      container
        .querySelectorAll(".order-view-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            openOrderDetail(e.target.getAttribute("data-id"))
          )
        );
      container
        .querySelectorAll(".order-edit-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            openOrderCreateModal(e.target.getAttribute("data-id"))
          )
        );
      container
        .querySelectorAll(".order-del-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            deleteOrder(e.target.getAttribute("data-id"))
          )
        );
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load orders", "error");
    }
  }

  async function openOrderDetail(id) {
    const modal = document.getElementById("orderDetailModal");
    const content = document.getElementById("orderDetailContent");
    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch order");
      const o = await res.json();
      const date = new Date(o.createdAt).toLocaleString();
      let html = `<p><strong>Order ID:</strong> ${o._id}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Customer:</strong> ${o.customer?.customerId || ""} - ${
        o.customer?.name || ""
      }</p>
        <p><strong>Total Amount:</strong> ₹${o.totalAmount}</p>
        <h4 class="text-lg font-semibold mt-4">Items</h4>
        <table class="w-full text-left mb-2">
          <thead><tr class="border-b dark:border-gray-600"><th class="p-2">Item</th><th class="p-2">Qty</th><th class="p-2">Price</th></tr></thead><tbody>`;
      o.items.forEach((it) => {
        html += `<tr class="border-b dark:border-gray-700"><td class="p-2">${it.menuItem.name}</td><td class="p-2">${it.quantity}</td><td class="p-2">₹${it.menuItem.price}</td></tr>`;
      });
      html += `</tbody></table>`;
      content.innerHTML = html;
      modal.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load order", "error");
    }
  }

  async function deleteOrder(id) {
    if (! await confirm("Delete this order?")) return;
    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete order");
      await fetchAndDisplayOrders();
      showToast("Order deleted", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete order", "error");
    }
  }

  // ---------- Order Creation ----------
  let menuCache = [];
  let customersCache = [];
  let editingOrderId = null;

  async function openOrderCreateModal(id = null) {
    editingOrderId = id;
    const modal = document.getElementById("orderCreateModal");
    await ensureOrderDataLoaded();
    // populate customer select
    const custSel = document.getElementById("orderCustomerSelect");
    custSel.innerHTML = customersCache
      .map(
        (c) => `<option value="${c._id}">${c.customerId} - ${c.name}</option>`
      )
      .join("");
    // reset items
    document.getElementById("orderItemsContainer").innerHTML = "";
    if (id) {
      // fetch order details
      const token = localStorage.getItem("ri-eat-admin-token");
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = await res.json();
      document.getElementById("orderCustomerSelect").value = order.customer._id;
      order.items.forEach((it) => {
        addOrderItemRow();
        const rows = document.querySelectorAll(
          "#orderItemsContainer .menuSelect"
        );
        const qtys = document.querySelectorAll(
          "#orderItemsContainer .qtyInput"
        );
        const idx = rows.length - 1;
        rows[idx].value = it.menuItem._id;
        qtys[idx].value = it.quantity;
      });
    } else {
      addOrderItemRow();
    }
    updateOrderTotal();
    modal.classList.remove("hidden");
  }

  function addOrderItemRow() {
    const container = document.getElementById("orderItemsContainer");
    const idx = container.children.length;
    const row = document.createElement("div");
    row.className = "flex gap-2";
    row.innerHTML = `<select class="menuSelect flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"></select>
       <input type="number" min="1" value="1" class="qtyInput w-20 p-2 border rounded dark:bg-gray-700 dark:text-white" />
       <button type="button" class="removeRow text-red-500">✕</button>`;
    container.appendChild(row);

    // populate select
    const select = row.querySelector(".menuSelect");
    select.innerHTML = menuCache
      .map(
        (m) =>
          `<option value="${m._id}" data-price="${m.price}">${m.name} (₹${m.price})</option>`
      )
      .join("");

    // listeners
    select.addEventListener("change", updateOrderTotal);
    row.querySelector(".qtyInput").addEventListener("input", updateOrderTotal);
    row.querySelector(".removeRow").addEventListener("click", () => {
      row.remove();
      updateOrderTotal();
    });
  }

  function updateOrderTotal() {
    let total = 0;
    document
      .querySelectorAll("#orderItemsContainer .menuSelect")
      .forEach((sel, idx) => {
        const price = Number(sel.options[sel.selectedIndex].dataset.price);
        const qty = Number(
          document.querySelectorAll("#orderItemsContainer .qtyInput")[idx]
            .value || 0
        );
        total += price * qty;
      });
    document.getElementById("orderTotalSpan").textContent = total;
  }

  async function handleOrderCreateSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("ri-eat-admin-token");
    const customerId = document.getElementById("orderCustomerSelect").value;
    const items = [];
    document
      .querySelectorAll("#orderItemsContainer .menuSelect")
      .forEach((sel, idx) => {
        const qty = Number(
          document.querySelectorAll("#orderItemsContainer .qtyInput")[idx]
            .value || 0
        );
        if (qty > 0) items.push({ menuItem: sel.value, quantity: qty });
      });
    if (items.length === 0) {
      showToast("Add at least one item", "warning");
      return;
    }
    try {
      const url = editingOrderId
        ? `http://localhost:5000/api/orders/${editingOrderId}`
        : "http://localhost:5000/api/orders";
      const method = editingOrderId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customer: customerId, items }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      document.getElementById("orderCreateModal").classList.add("hidden");
      showToast(editingOrderId ? "Order updated" : "Order created", "success");
      await fetchAndDisplayOrders();
      await fetchAndDisplayCustomers(); // update customer list totals
      editingOrderId = null;
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to create order", "error");
    }
  }

  async function ensureOrderDataLoaded() {
    const token = localStorage.getItem("ri-eat-admin-token");
    // Always fetch customers to ensure the list is up-to-date
    const custRes = await fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    customersCache = await custRes.json();
    if (menuCache.length === 0) {
      const res = await fetch("http://localhost:5000/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      menuCache = await res.json();
    }
  }

  // =====================
  //  Rewards Management
  // =====================

  async function loadRewardsSection() {
    dashboardContent.innerHTML = `
      <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 class="text-2xl font-bold text-orange-500 dark:text-yellow-400">🎁 Reward Claims</h2>
        <select id="claimStatusFilter" class="p-2 border rounded dark:bg-gray-700 dark:text-white">
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div id="claimsTableContainer" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"></div>

      <!-- Claim Detail Modal -->
      <div id="claimDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Reward Claim Details</h3>
          <div id="claimDetailContent" class="space-y-4"></div>
          <div class="flex justify-end mt-4 gap-4">
            <button id="closeClaimDetailBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Close</button>
            <button id="claimDetailCompleteBtn" class="bg-green-500 text-white px-4 py-2 rounded hidden">Mark Completed</button>
          </div>
        </div>
      </div>`;

    await fetchAndDisplayClaims();
    document
      .getElementById("claimStatusFilter")
      .addEventListener("change", fetchAndDisplayClaims);
    document
      .getElementById("closeClaimDetailBtn")
      .addEventListener("click", () =>
        document.getElementById("claimDetailModal").classList.add("hidden")
      );
  }

  async function fetchAndDisplayClaims() {
    const token = localStorage.getItem("ri-eat-admin-token");
    const status = document.getElementById("claimStatusFilter")?.value;
    let url = "http://localhost:5000/api/reward-claims";
    if (status) url += `?status=${status}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch claims");
      const claims = await res.json();
      const container = document.getElementById("claimsTableContainer");
      if (!container) return;
      if (claims.length === 0) {
        container.innerHTML =
          '<p class="text-center text-gray-500 dark:text-gray-400">No claims.</p>';
        return;
      }
      container.innerHTML = `<table class="w-full text-left"><thead><tr class="border-b dark:border-gray-600"><th class="p-2">Date</th><th class="p-2">Customer</th><th class="p-2">Experience</th><th class="p-2">Status</th><th class="p-2">Actions</th></tr></thead><tbody>
        ${claims
          .map((cl) => {
            const date = new Date(cl.createdAt).toLocaleDateString();
            return `<tr class="border-b dark:border-gray-700"><td class="p-2">${date}</td><td class="p-2">${
              cl.customer?.customerId || ""
            } - ${
              cl.name
            }</td><td class="p-2 truncate max-w-xs">${cl.experience.slice(
              0,
              30
            )}...</td><td class="p-2">${
              cl.status
            }</td><td class="p-2"><button class='claim-view-btn text-blue-500 hover:underline mr-2' data-id='${
              cl._id
            }'>View</button>${
              cl.status === "Pending"
                ? `<button class='claim-complete-btn text-green-500 hover:underline' data-id='${cl._id}'>Mark Completed</button>`
                : ""
            }</td></tr>`;
          })
          .join("")}
      </tbody></table>`;

      container
        .querySelectorAll(".claim-complete-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            completeClaim(e.target.getAttribute("data-id"))
          )
        );
      container
        .querySelectorAll(".claim-view-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            openClaimDetail(e.target.getAttribute("data-id"))
          )
        );
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load claims", "error");
    }
  }

  async function completeClaim(id) {
    const token = localStorage.getItem("ri-eat-admin-token");
    const nextTarget = await prompt(
      "Enter new target orders for customer (leave blank to keep current):"
    );
    try {
      const res = await fetch(
        `http://localhost:5000/api/reward-claims/${id}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nextTargetOrders: nextTarget }),
        }
      );
      if (!res.ok) throw new Error("Failed to update claim");
      showToast("Marked completed", "success");
      await fetchAndDisplayClaims();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed", "error");
    }
  }

  async function openClaimDetail(id) {
    const token = localStorage.getItem("ri-eat-admin-token");
    const modal = document.getElementById("claimDetailModal");
    const content = document.getElementById("claimDetailContent");
    const completeBtn = document.getElementById("claimDetailCompleteBtn");
    try {
      const res = await fetch(`http://localhost:5000/api/reward-claims/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch claim");
      const cl = await res.json();
      const date = new Date(cl.createdAt).toLocaleString();
      content.innerHTML = `<p><strong>Date:</strong> ${date}</p>
        <p><strong>Status:</strong> ${cl.status}</p>
        <p><strong>Customer ID:</strong> ${cl.customer?.customerId || ""}</p>
        <p><strong>Name:</strong> ${cl.name}</p>
        <p><strong>Phone:</strong> ${cl.phone}</p>
        <p><strong>Address:</strong> ${cl.address}</p>
        <p><strong>Orders at Claim:</strong> ${cl.ordersAtClaim}</p>
        <p><strong>Experience:</strong><br/>${cl.experience}</p>`;
      if (cl.status === "Pending") {
        completeBtn.dataset.id = cl._id;
        completeBtn.classList.remove("hidden");
      } else {
        completeBtn.classList.add("hidden");
      }
      modal.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed", "error");
    }
  }

  document
    .getElementById("claimDetailCompleteBtn")
    .addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!id) return;
      await completeClaim(id);
      document.getElementById("claimDetailModal").classList.add("hidden");
    });

  function loadSection(section) {
    if (section === "analytics") loadAnalyticsSection();
    else if (section === "menu") loadMenuSection();
    else if (section === "customers") loadCustomerSection();
    else if (section === "orders") loadOrdersSection();
    else if (section === "rewards") loadRewardsSection();
    else if (section === "settings") loadSettingsSection();
    else if (section === "feedback") loadFeedbackSection();
  }

  async function loadAnalyticsSection() {
    dashboardContent.innerHTML = `<h2 class="text-2xl font-bold mb-4 text-orange-500 dark:text-yellow-400">📊 Analytics Dashboard</h2>
       <div id="summaryCards" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"></div>
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><h3 class="font-semibold mb-2">Revenue & Orders (Last 30 Days)</h3><canvas id="salesChart" class="w-full h-64"></canvas></div>
         <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><h3 class="font-semibold mb-2">Top 10 Items</h3><canvas id="topItemsChart" class="w-full h-64"></canvas></div>
         <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow lg:col-span-2"><h3 class="font-semibold mb-2">Top Customers</h3><table class="w-full text-left" id="topCustomersTable"></table></div>
       </div>`;

    await ensureChartJsLoaded();
    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const [summaryRes, salesRes, itemsRes, custRes] = await Promise.all([
        fetch("http://localhost:5000/api/analytics/summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/analytics/sales-daily", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/analytics/top-items", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/analytics/top-customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const summary = await summaryRes.json();
      const sales = await salesRes.json();
      const topItems = await itemsRes.json();
      const topCust = await custRes.json();

      // Summary cards
      document.getElementById("summaryCards").innerHTML = `
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center"><p class="text-gray-500">Total Customers</p><p class="text-3xl font-bold">${summary.totalCustomers}</p></div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center"><p class="text-gray-500">Total Items Ordered</p><p class="text-3xl font-bold">${summary.totalItems}</p></div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center"><p class="text-gray-500">Total Revenue (₹)</p><p class="text-3xl font-bold">${summary.totalRevenue}</p></div>`;

      // Sales chart
      const salesCtx = document.getElementById("salesChart").getContext("2d");
      new Chart(salesCtx, {
        type: "line",
        data: {
          labels: sales.map((s) => s._id),
          datasets: [
            {
              label: "Revenue",
              data: sales.map((s) => s.revenue),
              backgroundColor: "rgba(54,162,235,0.4)",
              borderColor: "rgba(54,162,235,1)",
              fill: true,
            },
            {
              label: "Orders",
              data: sales.map((s) => s.orders),
              backgroundColor: "rgba(255,99,132,0.4)",
              borderColor: "rgba(255,99,132,1)",
              fill: true,
            },
          ],
        },
        options: { scales: { y: { beginAtZero: true } } },
      });

      // Top items chart
      const itemCtx = document.getElementById("topItemsChart").getContext("2d");
      new Chart(itemCtx, {
        type: "bar",
        data: {
          labels: topItems.map((i) => i.item.name),
          datasets: [
            {
              label: "Qty Sold",
              data: topItems.map((i) => i.qty),
              backgroundColor: "rgba(255,159,64,0.6)",
            },
          ],
        },
        options: { plugins: { legend: { display: false } }, indexAxis: "y" },
      });

      // Top customers table
      document.getElementById(
        "topCustomersTable"
      ).innerHTML = `<thead><tr class="border-b dark:border-gray-600"><th class="p-2">Customer</th><th class="p-2">Orders</th><th class="p-2">Spent (₹)</th></tr></thead><tbody>${topCust
        .map(
          (c) =>
            `<tr class="border-b dark:border-gray-700"><td class="p-2">${c.customer.customerId} - ${c.customer.name}</td><td class="p-2">${c.orders}</td><td class="p-2">${c.spent}</td></tr>`
        )
        .join("")}</tbody>`;
    } catch (err) {
      console.error(err);
      showToast("Failed to load analytics", "error");
    }
  }

  // =====================
  //  Settings
  // =====================
  function loadSettingsSection() {
    dashboardContent.innerHTML = `
      <h2 class="text-2xl font-bold mb-4 text-orange-500 dark:text-yellow-400">⚙️ Settings</h2>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg">
        <h3 class="text-lg font-semibold mb-4">Change Admin Password</h3>
        <form id="changePasswordForm" class="space-y-4">
          <div class="relative">
            <label for="currentPassword" class="block text-sm font-medium mb-1 dark:text-gray-200">Current Password</label>
            <input type="password" id="currentPassword" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white pr-10" required autocomplete="current-password" />
            <button type="button" class="password-toggle-btn absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
          <div class="relative">
            <label for="newPassword" class="block text-sm font-medium mb-1 dark:text-gray-200">New Password</label>
            <input type="password" id="newPassword" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white pr-10" required autocomplete="new-password" />
            <button type="button" class="password-toggle-btn absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
          <div class="relative">
            <label for="confirmNewPassword" class="block text-sm font-medium mb-1 dark:text-gray-200">Confirm New Password</label>
            <input type="password" id="confirmNewPassword" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white pr-10" required autocomplete="new-password" />
            <button type="button" class="password-toggle-btn absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
          <div class="pt-2">
            <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Update Password</button>
          </div>
        </form>
      </div>
    `;

    document
      .getElementById("changePasswordForm")
      .addEventListener("submit", handleChangePasswordSubmit);

    // Add logic for the password toggles
    const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
    const eyeSlashIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>`;

    document.querySelectorAll(".password-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.previousElementSibling;
        if (input.type === "password") {
          input.type = "text";
          btn.innerHTML = eyeSlashIcon;
        } else {
          input.type = "password";
          btn.innerHTML = eyeIcon;
        }
      });
    });
  }

  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("ri-eat-admin-token");
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword =
      document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/settings/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      showToast("Password updated successfully!", "success");
      document.getElementById("changePasswordForm").reset();
    } catch (err) {
      console.error(err);
      showToast(err.message || "An error occurred.", "error");
    }
  }

  // --- Logout ---
  logoutBtn.addEventListener("click", () => {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    adminLoginForm.reset();
    localStorage.removeItem("ri-eat-admin-token");
    sidebarLinks.forEach((l) =>
      l.classList.remove("bg-orange-100", "dark:bg-gray-700")
    );
    loadSection();
  });

  // --- Toast Utility ---
  function showToast(message, type = "info") {
    const containerId = "toast-container";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "fixed top-5 right-5 space-y-2 z-50";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const baseClasses =
      "px-4 py-2 rounded shadow-lg text-white transition-opacity duration-500";
    let colorClasses = "bg-gray-800";
    if (type === "success") colorClasses = "bg-green-500";
    else if (type === "error") colorClasses = "bg-red-500";
    else if (type === "warning") colorClasses = "bg-yellow-500 text-gray-900";

    toast.className = `${baseClasses} ${colorClasses}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Fade out after 3s and remove
    setTimeout(() => {
      toast.classList.add("opacity-0");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  }

  // --- Ensure dark mode applies to dynamic content ---
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains("dark")) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  async function loadFeedbackSection() {
    dashboardContent.innerHTML = `
      <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-orange-500 dark:text-yellow-400">💬 Customer Feedback</h2>
      </div>
      <div id="feedbackContainer" class="space-y-4"></div>
    `;

    const token = localStorage.getItem("ri-eat-admin-token");
    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch feedback");
      const allFeedback = await res.json();

      const container = document.getElementById("feedbackContainer");
      if (allFeedback.length === 0) {
        container.innerHTML =
          '<p class="text-center text-gray-500 dark:text-gray-400">No feedback has been submitted yet.</p>';
        return;
      }

      container.innerHTML = allFeedback
        .map(
          (fb) => `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-lg">${
                fb.name
              } <span class="text-sm text-gray-500 dark:text-gray-400">- ${
            fb.phone
          }</span></p>
              <p class="text-sm text-gray-600 dark:text-gray-300">Customer ID: ${
                fb.customerId || "N/A"
              }</p>
              <p class="text-sm text-orange-600 dark:text-yellow-500 font-bold">Item: ${
                fb.menuItem
              }</p>
            </div>
            <span class="text-xs text-gray-400">${new Date(
              fb.createdAt
            ).toLocaleString()}</span>
          </div>
          <p class="mt-4 text-gray-800 dark:text-gray-200">${
            fb.feedbackText
          }</p>
        </div>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error fetching feedback:", error);
      document.getElementById("feedbackContainer").innerHTML =
        '<p class="text-red-500 text-center">Failed to load feedback.</p>';
      showToast("Failed to load feedback.", "error");
    }
  }

  // --- Initial Load ---
  // Check auth status
  if (localStorage.getItem("ri-eat-admin-token")) {
    dashboardSection.classList.remove("hidden");
    loginSection.classList.add("hidden");
    loadSection("analytics");
  } else {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    adminLoginForm.reset();
    loadSection();
  }
});
