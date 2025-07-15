document.addEventListener("DOMContentLoaded", () => {
  const customerIdInput = document.getElementById("customerId");
  const checkButton = document.getElementById("checkButton");
  const customerDataContainer = document.getElementById("customer-data");
  const claimFormContainer = document.getElementById("claim-form-container");
  const darkModeToggle = document.getElementById("darkModeToggle");

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => theme.toggle());
  }
  let currentCustomerId = "";

  checkButton.addEventListener("click", async () => {
    const customerId = customerIdInput.value.trim();
    if (!customerId) {
      alert("Please enter a customer ID.");
      return;
    }

    // Clear previous results
    customerDataContainer.innerHTML = "";
    customerDataContainer.classList.add("hidden");
    claimFormContainer.innerHTML = "";
    claimFormContainer.classList.add("hidden");

    try {
      const response = await fetch(
        `http://localhost:5000/api/loyalty/${customerId}`
      );

      if (response.ok) {
        const data = await response.json();
        currentCustomerId = customerId;
        displayCustomerData(data);
      } else {
        const errorText = await response.text();
        customerDataContainer.innerHTML = `<p class="text-red-500">Error: ${errorText}</p>`;
        customerDataContainer.classList.remove("hidden");
      }
    } catch (error) {
      customerDataContainer.innerHTML = `<p class="text-red-500">Could not connect to the server. Please make sure it's running.</p>`;
      customerDataContainer.classList.remove("hidden");
    }
  });

  function displayCustomerData(data) {
    const { name, phone, totalOrders, targetOrders, rewardsAvailable } = data;
    const ordersLeftRaw = targetOrders - (totalOrders % targetOrders);
    const ordersLeft =
      ordersLeftRaw === targetOrders && totalOrders > 0 ? 0 : ordersLeftRaw;
    let progressPercentage =
      ((totalOrders % targetOrders) / targetOrders) * 100;
    if (progressPercentage === 0 && totalOrders > 0) progressPercentage = 100;

    const customerHTML = `
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 rounded-t-2xl"></div>
            <div class="text-center">
                <div class="relative inline-block mb-4">
                    <img src="RIEAT_logo.jpg" alt="Avatar" class="w-28 h-28 mx-auto rounded-full logo-animated">
                    <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-1">${name}</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-6 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    ${phone}
                </p>
                <div class="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 rounded-2xl p-6 mb-6">
                    <p class="text-6xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">${totalOrders}</p>
                    <p class="text-gray-600 dark:text-gray-300 font-semibold">Total Orders</p>
                </div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <p class="font-semibold text-gray-800 dark:text-white">Progress to Next Surprise</p>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">${ordersLeft} orders left</p>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-6 overflow-hidden">
                    <div class="progress-bar h-6 rounded-full transition-all duration-1000 ease-out" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <div class="reward-badge text-yellow-800 dark:text-yellow-100 flex items-center justify-between relative z-10">
                <div>
                    <p class="font-bold text-lg mb-1">Surprises Earned & Unclaimed</p>
                    <p class="text-5xl font-bold">${rewardsAvailable}</p>
                </div>
                ${
                  rewardsAvailable > 0
                    ? `<a href="claim.html?customerId=${currentCustomerId}" id="claimButton" class="bg-white text-yellow-600 font-bold py-3 px-6 rounded-xl hover:bg-yellow-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                        </svg>
                        Claim Reward
                    </a>`
                    : ""
                }
            </div>
            <div class="text-center mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 rounded-xl">
                <p class="text-gray-600 dark:text-gray-300 font-medium flex items-center justify-center gap-2">
                    <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    Keep ordering to unlock amazing surprises!
                </p>
            </div>
        `;

    customerDataContainer.innerHTML = customerHTML;
    customerDataContainer.classList.remove("hidden");
  }
});
