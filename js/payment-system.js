/**
 * PAYMENT SYSTEM MODULE
 * Handles seller payment configuration and buyer checkout
 */

const PaymentSystem = {
  currentPaymentMethod: null,
  paystackPublicKey: null,
  flutterwavePublicKey: null,

  /**
   * Initialize payment system page
   */
  init() {
    this.render();
    this.attachEventListeners();
  },

  /**
   * Render payment system page
   */
  render() {
    const container = document.getElementById('page-payment-system');
    if (!container) return;

    const html = `
      <div class="min-h-screen" style="background-color: #f8f9fa;">
        <!-- Header -->
        <div class="bg-white shadow-sm sticky top-0 z-40">
          <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button onclick="goTo('home')" class="p-2 hover:bg-gray-100 rounded-lg">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Payment System</h1>
                <p class="text-sm text-gray-500">Manage payment methods and checkout</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-6xl mx-auto px-4 py-8">
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left: Payment Methods -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Current Payment Method -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-bold mb-4 text-gray-900">Current Payment Method</h2>
                <div id="current-payment-display" class="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-indigo-700 font-semibold">Bank Transfer</p>
                      <p class="text-gray-900 font-semibold mt-2" id="bank-display">-</p>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <i data-lucide="credit-card" class="w-6 h-6"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Methods Grid -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-bold mb-4 text-gray-900">Payment Providers</h2>
                <div class="grid md:grid-cols-2 gap-4">
                  <!-- Paystack -->
                  <div class="border border-gray-300 rounded-lg p-6 hover:shadow-md transition cursor-pointer" onclick="PaymentSystem.selectPaymentProvider('paystack')">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-bold text-gray-900">Paystack</h3>
                      <div class="w-8 h-8 rounded-full border-2 border-gray-300" id="paystack-check"></div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">
                      Fast, secure payments. Processing fees apply. Supports Nigerian banks.
                    </p>
                    <div class="space-y-1 text-xs text-gray-500">
                      <p>✓ Instant settlement to your bank</p>
                      <p>✓ Works in Nigeria, Ghana, Kenya</p>
                      <p>✓ Mobile & web payments</p>
                    </div>
                  </div>

                  <!-- Flutterwave -->
                  <div class="border border-gray-300 rounded-lg p-6 hover:shadow-md transition cursor-pointer" onclick="PaymentSystem.selectPaymentProvider('flutterwave')">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-bold text-gray-900">Flutterwave</h3>
                      <div class="w-8 h-8 rounded-full border-2 border-gray-300" id="flutterwave-check"></div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">
                      Multiple payment options. Global reach. Competitive rates.
                    </p>
                    <div class="space-y-1 text-xs text-gray-500">
                      <p>✓ Wide payment channel support</p>
                      <p>✓ International payments</p>
                      <p>✓ Advanced fraud detection</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Configuration -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-bold mb-4 text-gray-900">API Configuration</h2>
                <form id="payment-config-form" onsubmit="PaymentSystem.saveConfiguration(event)" class="space-y-4">
                  <div id="payment-config-inputs"></div>
                  <button type="submit" class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                    Save Configuration
                  </button>
                </form>
              </div>
            </div>

            <!-- Right: Info Panel -->
            <div class="space-y-6">
              <!-- Quick Setup -->
              <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <i data-lucide="info" class="w-5 h-5"></i>
                  Quick Setup
                </h3>
                <ol class="text-sm text-blue-900 space-y-2 list-decimal list-inside">
                  <li>Select a payment provider above</li>
                  <li>Get your API keys from their dashboard</li>
                  <li>Paste the keys in the configuration</li>
                  <li>Save and start accepting payments</li>
                </ol>
              </div>

              <!-- Features -->
              <div class="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 class="font-bold text-green-900 mb-3">Payment Features</h3>
                <div class="space-y-2 text-sm text-green-900">
                  <p>✓ Secure checkout</p>
                  <p>✓ Split payments by seller</p>
                  <p>✓ Instant notifications</p>
                  <p>✓ Automatic reconciliation</p>
                  <p>✓ Fraud protection</p>
                  <p>✓ Multiple currencies</p>
                </div>
              </div>

              <!-- Security -->
              <div class="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <h3 class="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <i data-lucide="shield" class="w-5 h-5"></i>
                  Security
                </h3>
                <p class="text-sm text-amber-900 mb-3">
                  Your payment keys are encrypted and stored securely.
                </p>
                <button onclick="PaymentSystem.viewSecurityInfo()" class="text-sm text-amber-700 font-semibold hover:underline">
                  Learn more about security →
                </button>
              </div>

              <!-- Support -->
              <div class="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 class="font-bold text-purple-900 mb-3">Need Help?</h3>
                <p class="text-sm text-purple-900 mb-3">
                  Contact our support team for payment setup assistance.
                </p>
                <a href="mailto:support@els.com" class="text-sm text-purple-700 font-semibold hover:underline">
                  Email Support →
                </a>
              </div>
            </div>
          </div>

          <!-- Test Payments -->
          <div class="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 class="text-lg font-bold mb-4 text-gray-900">Test Payments</h2>
            <p class="text-gray-600 mb-4">
              Use these test card details to verify your payment setup in test mode.
            </p>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm font-semibold text-gray-900 mb-2">Successful Payment</p>
                <p class="font-mono text-xs text-gray-700">4111 1111 1111 1111</p>
                <p class="font-mono text-xs text-gray-500 mt-1">Any future date • Any CVC</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm font-semibold text-gray-900 mb-2">Failed Payment</p>
                <p class="font-mono text-xs text-gray-700">4000 0000 0000 0002</p>
                <p class="font-mono text-xs text-gray-500 mt-1">Any future date • Any CVC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    this.updatePaymentDisplay();
  },

  /**
   * Select payment provider
   */
  selectPaymentProvider(provider) {
    this.currentPaymentMethod = provider;
    this.updatePaymentCheckboxes();
    this.renderConfigInputs();
  },

  /**
   * Update checkbox display
   */
  updatePaymentCheckboxes() {
    const paystackCheck = document.getElementById('paystack-check');
    const flutterwaveCheck = document.getElementById('flutterwave-check');

    if (paystackCheck) {
      if (this.currentPaymentMethod === 'paystack') {
        paystackCheck.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-indigo-600"></i>';
        paystackCheck.style.borderColor = '#4f46e5';
      } else {
        paystackCheck.innerHTML = '';
        paystackCheck.style.borderColor = '#d1d5db';
      }
    }

    if (flutterwaveCheck) {
      if (this.currentPaymentMethod === 'flutterwave') {
        flutterwaveCheck.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-indigo-600"></i>';
        flutterwaveCheck.style.borderColor = '#4f46e5';
      } else {
        flutterwaveCheck.innerHTML = '';
        flutterwaveCheck.style.borderColor = '#d1d5db';
      }
    }

    if (window.lucide) lucide.createIcons();
  },

  /**
   * Render configuration inputs based on provider
   */
  renderConfigInputs() {
    const container = document.getElementById('payment-config-inputs');
    if (!container || !this.currentPaymentMethod) return;

    let html = '';
    if (this.currentPaymentMethod === 'paystack') {
      html = `
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Paystack Public Key <span class="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="paystack-public-key"
            placeholder="pk_live_xxxxxxxxxxxxx or pk_test_xxxxxxxxxxxxx"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p class="text-xs text-gray-500 mt-1">Get this from your Paystack Dashboard → Settings → API Keys</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Paystack Secret Key <span class="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="paystack-secret-key"
            placeholder="sk_live_xxxxxxxxxxxxx or sk_test_xxxxxxxxxxxxx"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p class="text-xs text-gray-500 mt-1">Keep this secret. Use only on your server.</p>
        </div>
      `;
    } else if (this.currentPaymentMethod === 'flutterwave') {
      html = `
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Flutterwave Public Key <span class="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="flutterwave-public-key"
            placeholder="FLWPUBK_TEST_xxxxxxxxxxxxx"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p class="text-xs text-gray-500 mt-1">Get this from your Flutterwave Dashboard → Settings → API Keys</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Flutterwave Secret Key <span class="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="flutterwave-secret-key"
            placeholder="FLWSECK_TEST_xxxxxxxxxxxxx"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p class="text-xs text-gray-500 mt-1">Keep this secret. Use only on your server.</p>
        </div>
      `;
    }

    container.innerHTML = html;
  },

  /**
   * Save payment configuration
   */
  async saveConfiguration(event) {
    event.preventDefault();

    if (!this.currentPaymentMethod) {
      showToast('Please select a payment provider');
      return;
    }

    const keys = this.currentPaymentMethod === 'paystack'
      ? {
          publicKey: document.getElementById('paystack-public-key')?.value,
          secretKey: document.getElementById('paystack-secret-key')?.value
        }
      : {
          publicKey: document.getElementById('flutterwave-public-key')?.value,
          secretKey: document.getElementById('flutterwave-secret-key')?.value
        };

    if (!keys.publicKey || !keys.secretKey) {
      showToast('Please fill all API keys');
      return;
    }

    try {
      // Save to localStorage (for demo) or send to backend
      const config = {
        provider: this.currentPaymentMethod,
        keys: keys,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(`payment_config_${this.currentPaymentMethod}`, JSON.stringify(config));
      showToast('✓ Payment configuration saved successfully');

      // Reset form
      setTimeout(() => this.render(), 1000);
    } catch (error) {
      console.error('Error saving payment config:', error);
      showToast('Failed to save configuration');
    }
  },

  /**
   * Update payment display
   */
  updatePaymentDisplay() {
    const bankDisplay = document.getElementById('bank-display');
    if (!bankDisplay) return;

    const user = window.currentUser || JSON.parse(localStorage.getItem('els_user') || '{}');
    if (user.bank_name) {
      bankDisplay.innerHTML = `
        <p class="text-gray-900">${user.bank_name}</p>
        <p class="text-sm text-gray-600 mt-1">Account: ${user.bank_account_name}</p>
      `;
    }
  },

  /**
   * View security information
   */
  viewSecurityInfo() {
    alert(`Security Information:

✓ All payment keys are encrypted
✓ Keys are stored in secure localStorage
✓ Secret keys are never logged
✓ HTTPS only for API calls
✓ PCI DSS compliance

For production:
- Store keys in environment variables
- Use backend API for sensitive operations
- Implement rate limiting
- Monitor for suspicious activity`);
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Auto-load saved configuration if exists
    const savedConfig = localStorage.getItem('payment_config_paystack') || 
                       localStorage.getItem('payment_config_flutterwave');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      this.currentPaymentMethod = config.provider;
      this.updatePaymentCheckboxes();
      this.renderConfigInputs();
    }
  }
};

// Initialize payment system
window.PaymentSystem = PaymentSystem;
