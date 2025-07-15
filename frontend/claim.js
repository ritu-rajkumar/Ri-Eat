document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reward-form");
  const darkModeToggle = document.getElementById("darkModeToggle");

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => theme.toggle());
  }
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
            <div class="card text-center p-12 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-t-2xl"></div>
                <div class="mb-6">
                    <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Thank You!</h2>
                    <p class="text-gray-700 dark:text-gray-300 text-lg mb-8">Your reward claim has been submitted successfully. We'll process it shortly!</p>
                </div>
                <a href="index.html" class="btn-primary inline-flex items-center gap-2 px-8 py-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Home
                </a>
            </div>
          `;
    } catch (err) {
      alert(err.message);
    }
  });
});
