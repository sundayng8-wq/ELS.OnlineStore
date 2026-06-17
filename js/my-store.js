/**
 * MY STORE MODULE
 * Seller dashboard for managing store, products, orders, and earnings
 */

const MyStore = {
  currentTab: 'products',
  storeData: null,
  storeProducts: [],
  storeOrders: [],
  storeEarnings: 0,

  async init() {
    await this.loadStoreData();
    this.render();
    this.attachEventListeners();
  },

  async loadStoreData() {
    try {
      const token = localStorage.getItem('els_token');
      if (!token) return;

      // Fetch seller's store data
      const storeRes = await fetch(
        (window.API_BASE || 'http://localhost:8001/api') + '/stores/mine',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        this.storeData = storeData.store;
      }

      // Fetch seller's products
      const productsRes = await fetch(
        (window.API_BASE || 'http://localhost:8001/api') + '/products/seller/mine',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        this.storeProducts = productsData.products || [];
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    }
  },

  render() {
    const container = document.getElementById('page-my-store');
    if (!container) return;

    const html = `
      <div class="min-h-screen" style="background-color: #f8f9fa;">
        <!-- Header -->
        <div class="bg-white shadow-sm sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button onclick="goTo('home')" class="p-2 hover:bg-gray-100 rounded-lg">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">${this.storeData?.store_name || 'My Store'}</h1>
                <p class="text-sm text-gray-500">Seller Dashboard</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button onclick="MyStore.openStoreSettings()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center gap-2">
                <i data-lucide="settings" class="w-4 h-4"></i>
                Settings
              </button>
              <button onclick="goTo('home')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2">
                <i data-lucide="home" class="w-4 h-4"></i>
                Go to Shop
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 py-8">
          <!-- Stats Cards -->
          <div class="grid md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <p class="text-gray-600 text-sm font-semibold mb-2">Total Products</p>
              <p class="text-3xl font-bold text-indigo-600">${this.storeProducts.length}</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <p class="text-gray-600 text-sm font-semibold mb-2">Store Views</p>
              <p class="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <p class="text-gray-600 text-sm font-semibold mb-2">Total Sales</p>
              <p class="text-3xl font-bold text-green-600">₦0</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <p class="text-gray-600 text-sm font-semibold mb-2">Pending Orders</p>
              <p class="text-3xl font-bold text-orange-600">0</p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white rounded-lg shadow-sm mb-6">
            <div class="flex border-b border-gray-200 overflow-x-auto">
              ${['products', 'orders', 'earnings', 'settings'].map(tab => `
                <button
                  onclick="MyStore.switchTab('${tab}')"
                  class="px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                    this.currentTab === tab 
                      ? 'text-indigo-600 border-indigo-600' 
                      : 'text-gray-600 border-transparent hover:border-gray-300'
                  }"
                >
                  ${tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              `).join('')}
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              ${this.renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  renderTabContent() {
    switch (this.currentTab) {
      case 'products':
        return this.renderProductsTab();
      case 'orders':
        return this.renderOrdersTab();
      case 'earnings':
        return this.renderEarningsTab();
      case 'settings':
        return this.renderSettingsTab();
      default:
        return '';
    }
  },

  renderProductsTab() {
    if (this.storeProducts.length === 0) {
      return `
        <div class="text-center py-12">
          <i data-lucide="package" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
          <p class="text-gray-600 text-lg mb-4">No products yet</p>
          <button onclick="goTo('open-store')" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
            Add Your First Product
          </button>
        </div>
      `;
    }

    return `
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold">Your Products</h3>
        <button onclick="goTo('open-store')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i>
          Add Product
        </button>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        ${this.storeProducts.map(product => `
          <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
            <div class="bg-gray-100 h-40 relative overflow-hidden">
              ${product.image_data ? 
                `<img src="${product.image_data}" alt="${product.name}" class="w-full h-full object-cover">` :
                `<div class="w-full h-full flex items-center justify-center"><i data-lucide="image" class="w-8 h-8 text-gray-400"></i></div>`
              }
            </div>
            <div class="p-4">
              <p class="font-semibold text-gray-900 truncate">${product.name}</p>
              <p class="text-sm text-gray-600 text-center font-bold mt-2">₦${(product.price || 0).toLocaleString()}</p>
              <p class="text-xs text-gray-500 mt-1">${product.category || 'Uncategorized'}</p>
              <div class="flex gap-2 mt-4">
                <button onclick="MyStore.editProduct('${product._id || product.name}')" class="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold">
                  Edit
                </button>
                <button onclick="MyStore.deleteProduct('${product._id || product.name}')" class="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold">
                  Delete
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderOrdersTab() {
    return `
      <div class="text-center py-12">
        <i data-lucide="shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
        <p class="text-gray-600 text-lg">No orders yet</p>
        <p class="text-gray-500 text-sm mt-2">Orders will appear here once customers purchase from your store</p>
      </div>
    `;
  },

  renderEarningsTab() {
    return `
      <div class="space-y-6">
        <!-- Earnings Summary -->
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <p class="text-green-700 text-sm font-semibold mb-2">Total Earnings</p>
            <p class="text-3xl font-bold text-green-900">₦0.00</p>
            <p class="text-xs text-green-700 mt-2">From all completed orders</p>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p class="text-blue-700 text-sm font-semibold mb-2">Pending Amount</p>
            <p class="text-3xl font-bold text-blue-900">₦0.00</p>
            <p class="text-xs text-blue-700 mt-2">From orders in progress</p>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <p class="text-orange-700 text-sm font-semibold mb-2">Available Payout</p>
            <p class="text-3xl font-bold text-orange-900">₦0.00</p>
            <p class="text-xs text-orange-700 mt-2">Ready to withdraw</p>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-4">Payment Method</h3>
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm font-semibold text-gray-900">${this.storeData?.bank_name || 'Bank Account'}</p>
            <p class="text-sm text-gray-600 mt-1">${this.storeData?.bank_account_name || 'Account'}</p>
            <p class="text-xs text-gray-500 mt-1">Account ending in ${this.storeData?.bank_account_number?.slice(-4) || '****'}</p>
            <button onclick="MyStore.editPaymentMethod()" class="text-sm text-indigo-600 font-semibold hover:underline mt-3">
              Change payment method
            </button>
          </div>
        </div>

        <!-- Withdrawal History -->
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-4">Recent Payouts</h3>
          <div class="text-center py-8">
            <p class="text-gray-600">No payouts yet</p>
          </div>
        </div>
      </div>
    `;
  },

  renderSettingsTab() {
    return `
      <div class="max-w-2xl space-y-6">
        <!-- Store Name -->
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-4">Store Name</h3>
          <p class="text-gray-900 font-semibold">${this.storeData?.store_name || 'N/A'}</p>
          <button onclick="MyStore.editStoreName()" class="text-sm text-indigo-600 font-semibold hover:underline mt-2">
            Change store name
          </button>
        </div>

        <!-- Store Description -->
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-4">Store Description</h3>
          <p class="text-gray-700">${this.storeData?.description || 'No description yet'}</p>
          <button onclick="MyStore.editDescription()" class="text-sm text-indigo-600 font-semibold hover:underline mt-2">
            Edit description
          </button>
        </div>

        <!-- Store Logo -->
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-4">Store Logo</h3>
          <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            ${this.storeData?.logo_url ? 
              `<img src="${this.storeData.logo_url}" alt="Store logo" class="w-full h-full object-cover rounded-lg">` :
              `<i data-lucide="image" class="w-8 h-8 text-gray-400"></i>`
            }
          </div>
          <button onclick="MyStore.uploadLogo()" class="text-sm text-indigo-600 font-semibold hover:underline">
            Upload logo
          </button>
        </div>

        <!-- Store Policies -->
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-4">Store Policies</h3>
          <div class="space-y-3">
            <button onclick="showToast('Coming soon')" class="w-full text-left p-3 hover:bg-white rounded border border-gray-300 font-semibold text-gray-700">
              🚚 Shipping Policy
            </button>
            <button onclick="showToast('Coming soon')" class="w-full text-left p-3 hover:bg-white rounded border border-gray-300 font-semibold text-gray-700">
              ↩️ Return Policy
            </button>
            <button onclick="showToast('Coming soon')" class="w-full text-left p-3 hover:bg-white rounded border border-gray-300 font-semibold text-gray-700">
              ⚖️ Terms & Conditions
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 class="font-bold text-red-900 mb-4">Danger Zone</h3>
          <button onclick="MyStore.deleteStore()" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
            Delete Store
          </button>
          <p class="text-xs text-red-700 mt-2">This action cannot be undone. All store data will be permanently deleted.</p>
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  editProduct(productId) {
    showToast('Edit product feature coming soon');
  },

  async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    showToast('Product deleted');
  },

  editPaymentMethod() {
    showToast('Edit payment method feature coming soon');
  },

  editStoreName() {
    const newName = prompt('Enter new store name:', this.storeData?.store_name);
    if (newName && newName.trim()) {
      showToast('Store name updated (save feature coming soon)');
    }
  },

  editDescription() {
    const newDesc = prompt('Enter new store description:', this.storeData?.description);
    if (newDesc !== null) {
      showToast('Description updated (save feature coming soon)');
    }
  },

  uploadLogo() {
    showToast('Logo upload feature coming soon');
  },

  openStoreSettings() {
    this.switchTab('settings');
  },

  deleteStore() {
    if (!confirm('Are you absolutely sure you want to delete your entire store? This cannot be undone.')) return;
    showToast('Store deletion feature coming soon');
  }
};

// Initialize MyStore module
window.MyStore = MyStore;
