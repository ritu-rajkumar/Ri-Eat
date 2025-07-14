document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reward-form");
  const claimContainer = document.getElementById("claimContainer");
  const params = new URLSearchParams(window.location.search);
  const customerId = params.get("customerId");

  if (!customerId) {
    claimContainer.innerHTML = `<p class="text-red-500 text-center">No customer ID provided. Please go back and try again.</p>`;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const claimData = Object.fromEntries(formData.entries());
    claimData.customerId = customerId;

    try {
      const res = await fetch("http://localhost:5000/api/loyalty/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit claim");
      }
      // Show the thank you message
      claimContainer.innerHTML = `
            <div class="text-center p-8 bg-white rounded-2xl shadow-lg">
                <h2 class="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
                <p class="text-gray-700 mb-6">Your reward claim has been submitted successfully.</p>
                <a href="index.html" class="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">Back to Home</a>
            </div>
          `;
    } catch (err) {
      alert(err.message);
    }
  });
});
