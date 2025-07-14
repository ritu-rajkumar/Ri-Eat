document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const menuItemSelect = document.getElementById("menuItem");
  const submitBtn = document.getElementById("submitBtn");
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
        <div class="text-center p-8">
            <h2 class="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
            <p class="text-gray-700">Your feedback has been submitted successfully.</p>
             <a href="index.html" class="inline-block mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">Back to Home</a>
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
