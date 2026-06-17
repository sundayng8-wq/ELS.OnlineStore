/**
 * STORE SETUP MODULE
 * Handles seller store registration and creation
 * Flow: Register Account → Login → Create Store → My Store Dashboard
 */

const BANK_NAMES = [
  'Access Bank',
  'Zenith Bank',
  'First Bank',
  'Guaranty Trust Bank',
  'Stanbic IBTC Bank',
  'United Bank for Africa',
  'Sterling Bank',
  'Fidelity Bank',
  'FCMB Bank',
  'Wema Bank',
  'Ecobank',
  'Standard Chartered Bank',
  'Diamond Bank',
  'Heritage Bank',
  'Other'
];

/**
 * Initialize store setup page
 */
function initStoreSetupPage() {
  renderStoreSetupForm();
  loadBankOptions();
}

/**
 * Load bank options into dropdown
 */
function loadBankOptions() {
  const bankSelect = document.getElementById('store-bank-name');
  if (!bankSelect) return;

  bankSelect.innerHTML = '<option value="">Select your bank</option>';
  BANK_NAMES.forEach(bank => {
    const option = document.createElement('option');
    option.value = bank;
    option.textContent = bank;
    bankSelect.appendChild(option);
  });
}

/**
 * Render the store creation form
 */
function renderStoreSetupForm() {
  const container = document.getElementById('page-create-store');
  if (!container) return;

  const html = `
    <div class="min-h-screen" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
      <!-- Header -->
      <div class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button onclick="goTo('home')" class="p-2 hover:bg-gray-100 rounded-lg">
              <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Create Your Store</h1>
              <p class="text-xs text-gray-500">Set up your seller account to start selling</p>
            </div>
          </div>
          <div id="setup-progress" class="text-sm font-medium text-gray-600">Step 1 of 3</div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Left: Form -->
          <div class="space-y-6">
            <form id="store-setup-form" onsubmit="handleStoreSetupSubmit(event)" class="space-y-5">
              <!-- Store Info Section -->
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h2 class="text-lg font-bold mb-4 text-gray-900">Store Information</h2>
                
                <div class="mb-4">
                  <label for="store-name" class="block text-sm font-semibold text-gray-700 mb-2">
                    Store Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="store-name"
                    type="text"
                    required
                    placeholder="e.g., TechHub Store, Fashion House"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    maxlength="100"
                  />
                  <p class="text-xs text-gray-500 mt-1">This will be your public store name (max 100 characters)</p>
                </div>

                <div class="mb-4">
                  <label for="store-description" class="block text-sm font-semibold text-gray-700 mb-2">
                    Store Description
                  </label>
                  <textarea
                    id="store-description"
                    placeholder="Tell customers about your store, what you sell, your mission..."
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none"
                    rows="4"
                    maxlength="500"
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">Describe your store (max 500 characters)</p>
                </div>
              </div>

              <!-- Banking Section -->
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h2 class="text-lg font-bold mb-4 text-gray-900">Payment Information</h2>
                <p class="text-sm text-gray-600 mb-4">
                  <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
                  Your bank details are secured and used only for payment transfers
                </p>

                <div class="mb-4">
                  <label for="store-account-name" class="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Account Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="store-account-name"
                    type="text"
                    required
                    placeholder="Name on your bank account"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  />
                  <p class="text-xs text-gray-500 mt-1">Must match your bank account exactly</p>
                </div>

                <div class="mb-4">
                  <label for="store-account-number" class="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Account Number <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="store-account-number"
                    type="text"
                    required
                    placeholder="10 or 11-digit account number"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    maxlength="12"
                  />
                  <p class="text-xs text-gray-500 mt-1">Enter without spaces or dashes</p>
                </div>

                <div class="mb-4">
                  <label for="store-bank-name" class="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="store-bank-name"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white"
                  >
                    <option value="">Select your bank</option>
                  </select>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                id="btn-store-setup-submit"
                class="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <i data-lucide="check" class="w-5 h-5"></i>
                Create Store
              </button>

              <p class="text-xs text-gray-500 text-center">
                After creating your store, you can add products, manage orders, and track earnings.
              </p>
            </form>
          </div>

          <!-- Right: Info Card -->
          <div class="space-y-6">
            <!-- Benefits -->
            <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
              <h3 class="font-bold text-gray-900 mb-4">What You Get</h3>
              <div class="space-y-3">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center mt-1">
                    <i data-lucide="check" class="w-3 h-3"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Seller Dashboard</p>
                    <p class="text-sm text-gray-600">Manage products, orders, and earnings</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center mt-1">
                    <i data-lucide="check" class="w-3 h-3"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Payment Processing</p>
                    <p class="text-sm text-gray-600">Get paid directly to your bank account</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center mt-1">
                    <i data-lucide="check" class="w-3 h-3"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Customer Analytics</p>
                    <p class="text-sm text-gray-600">Track sales, visitors, and performance</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center mt-1">
                    <i data-lucide="check" class="w-3 h-3"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Secure Checkout</p>
                    <p class="text-sm text-gray-600">Built-in payment processing with Paystack</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Note -->
            <div class="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div class="flex gap-3">
                <i data-lucide="shield-check" class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"></i>
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Secure & Encrypted</p>
                  <p class="text-sm text-gray-600">Your bank details are encrypted and stored securely. We never share your information.</p>
                </div>
              </div>
            </div>

            <!-- Help -->
            <div class="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <p class="font-semibold text-gray-900 mb-3">Need help?</p>
              <p class="text-sm text-gray-600 mb-3">
                Contact our support team at <a href="mailto:support@els.com" class="text-indigo-600 font-semibold hover:underline">support@els.com</a>
              </p>
              <button onclick="alert('FAQ coming soon')" class="text-sm text-indigo-600 font-semibold hover:underline">
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  // Re-initialize lucide icons
  if (window.lucide) lucide.createIcons();
}

/**
 * Handle store setup form submission
 */
async function handleStoreSetupSubmit(event) {
  event.preventDefault();

  const storeName = document.getElementById('store-name')?.value?.trim();
  const description = document.getElementById('store-description')?.value?.trim();
  const accountName = document.getElementById('store-account-name')?.value?.trim();
  const accountNumber = document.getElementById('store-account-number')?.value?.trim();
  const bankName = document.getElementById('store-bank-name')?.value?.trim();
  const submitBtn = document.getElementById('btn-store-setup-submit');

  if (!storeName || !accountName || !accountNumber || !bankName) {
    showToast('Please fill all required fields');
    return;
  }

  // Validate account number (should be numeric and 10-11 digits)
  if (!/^\d{10,11}$/.test(accountNumber)) {
    showToast('Account number must be 10-11 digits');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Creating store...';

    const token = localStorage.getItem('els_token') || '';
    const apiUrl = (window.API_BASE || 'http://localhost:8001/api') + '/stores';

    const payload = {
      store_name: storeName,
      description: description,
      bank_account_name: accountName,
      bank_account_number: accountNumber,
      bank_name: bankName
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create store');
    }

    // Store created successfully
    showToast('Store created successfully! 🎉');

    // Save store info to currentUser
    if (window.currentUser) {
      window.currentUser.store_id = data.store._id;
      window.currentUser.store_name = data.store.store_name;
      localStorage.setItem('els_user', JSON.stringify(window.currentUser));
    }

    // Navigate to My Store dashboard
    setTimeout(() => {
      goTo('my-store');
      if (window.MyStore && typeof window.MyStore.init === 'function') {
        window.MyStore.init();
      }
    }, 1000);

  } catch (error) {
    console.error('Store creation error:', error);
    showToast('Error: ' + (error.message || 'Failed to create store'));
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> Create Store';
    if (window.lucide) lucide.createIcons();
  }
}

/**
 * Check if user has a store, if not show create store page
 */
async function checkAndNavigateStoreFlow() {
  if (!window.currentUser) return;

  try {
    // First check localStorage for quick access
    const hasStore = window.currentUser.store_id || window.currentUser.store_name;
    if (hasStore) {
      // User has store, go to dashboard
      goTo('my-store');
      if (window.MyStore && typeof window.MyStore.init === 'function') {
        window.MyStore.init();
      }
      return;
    }

    // Check with backend if user has store
    const token = localStorage.getItem('els_token');
    if (!token) return;

    const response = await fetch(
      (window.API_BASE || 'http://localhost:8001/api') + '/stores/mine',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      window.currentUser.store_id = data.store._id;
      window.currentUser.store_name = data.store.store_name;
      localStorage.setItem('els_user', JSON.stringify(window.currentUser));
      goTo('my-store');
      if (window.MyStore && typeof window.MyStore.init === 'function') {
        window.MyStore.init();
      }
    } else {
      // No store found, show create store page
      goTo('create-store');
      initStoreSetupPage();
    }
  } catch (error) {
    console.warn('Store check error:', error);
    // Default to create store page on error
    goTo('create-store');
    initStoreSetupPage();
  }
}
