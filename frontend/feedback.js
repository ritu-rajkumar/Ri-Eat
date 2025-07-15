document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const submitBtn = document.getElementById("submitBtn");
  const menuItemSelect = document.getElementById("menuItem");
  const darkModeToggle = document.getElementById("darkModeToggle");

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => theme.toggle());
  }
  const originalBtnText = submitBtn.textContent;

  async function populateMenuItems() {
    try {
      // This is a public-facing page, so we can't use the protected admin endpoint.
      // We need a way to get menu items publicly.
      // For now, let's assume a public /api/menu/public endpoint exists.
      // If not, we'll need to create it.
      // Let's also assume the admin token is available for this public page for now.
      const response = await fetch("http://localhost:5000/api/menu/public");

      if (!response.ok) {
        throw new Error("Failed to fetch menu items.");
      }

      const menuItems = await response.json();

      menuItemSelect.innerHTML = ""; // Clear loading text

      // Add a 'General' option first
      const generalOption = document.createElement("option");
      generalOption.value = "General";
      generalOption.textContent = "General Feedback";
      menuItemSelect.appendChild(generalOption);

      // Add menu items from the database
      menuItems.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = `${item.name} - ₹${item.price}`;
        menuItemSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching menu:", error);
      menuItemSelect.innerHTML = `<option value="">Could not load menu</option>`;
      const generalOption = document.createElement("option");
      generalOption.value = "General";
      generalOption.textContent = "General Feedback";
      menuItemSelect.appendChild(generalOption);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      customerId: document.getElementById("customerId").value,
      menuItem: menuItemSelect.value,
      feedbackText: document.getElementById("feedbackText").value,
    };

    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback.");
      }

      form.innerHTML = `
        <div class="text-center p-12 relative">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-t-2xl"></div>
            <div class="mb-6">
                <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Thank You!</h2>
                <p class="text-gray-700 dark:text-gray-300 text-lg mb-8">Your feedback has been submitted successfully. We appreciate your input!</p>
            </div>
            <a href="index.html" class="btn-primary inline-flex items-center gap-2 px-8 py-4">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Home
            </a>
        </div>
      `;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("There was an error submitting your feedback. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  populateMenuItems();
});
