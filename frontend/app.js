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
            <div class="text-center">
                <img src="RIEAT_logo.jpg" alt="Avatar" class="w-24 h-24 mx-auto rounded-full mb-4">
                <h2 class="text-2xl font-bold">${name}</h2>
                <p class="text-gray-600 mb-4">${phone}</p>
                <p class="text-5xl font-bold text-orange-500">${totalOrders}</p>
                <p class="text-gray-500 mb-6">Total Orders</p>
            </div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <p class="font-semibold">Progress to Next Surprise</p>
                    <p class="text-gray-600">${ordersLeft} orders left</p>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div class="bg-orange-500 h-4 rounded-full" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <p class="font-bold">Surprises Earned & Unclaimed</p>
                    <p class="text-4xl font-bold">${rewardsAvailable}</p>
                </div>
                ${
                  rewardsAvailable > 0
                    ? `<a href="claim.html?customerId=${currentCustomerId}" id="claimButton" class="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">Claim Reward</a>`
                    : ""
                }
            </div>
            <p class="text-center text-gray-500 mt-4">Keep ordering to unlock amazing surprises!</p>
        `;

    customerDataContainer.innerHTML = customerHTML;
    customerDataContainer.classList.remove("hidden");
  }
});
