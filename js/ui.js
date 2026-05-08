// ===== STATE =====
let allProducts = [];
let cart = [];
let currentCategory = 'All';
let currentUser = { name: 'User', email: '' };
let selectedImages = []; // array of data URLs
let primaryImageIndex = 0;
let conversations = [];
let currentConversation = null;
let allOrders = [];
let isLogisticsProvider = false;
let logisticsFees = { 'Standard': 5, 'Express': 12, 'Overnight': 25, 'Pickup': 0 };

const defaultConfig = {
  site_name: 'ELS.OnlineStoress',
  tagline: 'Shop. Sell. Thrive.',
  hero_heading: 'Discover What You Love',
  bg_color: '#f8f6f3',
  surface_color: '#ffffff',
  text_color: '#1a1a2e',
  primary_color: '#e94560',
  secondary_color: '#0f3460',
  font_family: 'Outfit',
  font_size: 16
};

try {
  if (location && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.cloudImageUploadUrl = window.cloudImageUploadUrl || (location.protocol + '//' + location.hostname + ':8001/upload');
    console.info('Defaulting cloudImageUploadUrl to', window.cloudImageUploadUrl);
  }
} catch (e) {}

window.elementSdk.init({
  defaultConfig,
  onConfigChange: async (config) => {
    const bg = config.bg_color || defaultConfig.bg_color;
    const surface = config.surface_color || defaultConfig.surface_color;
    const txt = config.text_color || defaultConfig.text_color;
    const primary = config.primary_color || defaultConfig.primary_color;
    const secondary = config.secondary_color || defaultConfig.secondary_color;
    const font = config.font_family || defaultConfig.font_family;
    const fs = config.font_size || defaultConfig.font_size;
    const siteName = config.site_name || defaultConfig.site_name;
    const tagline = config.tagline || defaultConfig.tagline;
    const heroH = config.hero_heading || defaultConfig.hero_heading;

    document.getElementById('app').style.background = bg;
    document.querySelectorAll('[style*="background:white"], [style*="background: white"]').forEach(el => el.style.background = surface);
    document.querySelectorAll('h2, h3, h4, label, .font-bold').forEach(el => { if (!el.closest('#auth-screen') && !el.closest('#topnav') && !el.closest('#sidebar')) el.style.color = txt; });
    document.querySelectorAll('[style*="background:#e94560"]').forEach(el => el.style.background = primary);
    document.querySelectorAll('[style*="color:#e94560"]').forEach(el => el.style.color = primary);
    document.getElementById('topnav').style.background = secondary;
    document.getElementById('sidebar').style.background = secondary;

    document.body.style.fontFamily = `${font}, Outfit, sans-serif`;
    document.body.style.fontSize = `${fs}px`;

    const authName = document.getElementById('auth-site-name');
    const navName = document.getElementById('nav-site-name');
    const authTag = document.getElementById('auth-tagline');
    const heroEl = document.getElementById('hero-heading');
    if (authName) authName.textContent = siteName;
    if (navName) navName.textContent = siteName;
    if (authTag) authTag.textContent = tagline;
    if (heroEl) heroEl.textContent = heroH;
  },
  mapToCapabilities: (config) => ({
    recolorables: [
      { get: () => config.bg_color || defaultConfig.bg_color, set: (v) => { config.bg_color = v; window.elementSdk.setConfig({ bg_color: v }); } },
      { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
      { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
      { get: () => config.primary_color || defaultConfig.primary_color, set: (v) => { config.primary_color = v; window.elementSdk.setConfig({ primary_color: v }); } },
      { get: () => config.secondary_color || defaultConfig.secondary_color, set: (v) => { config.secondary_color = v; window.elementSdk.setConfig({ secondary_color: v }); } }
    ],
    borderables: [],
    fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
    fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } }
  }),
  mapToEditPanelValues: (config) => new Map([
    ['site_name', config.site_name || defaultConfig.site_name],
    ['tagline', config.tagline || defaultConfig.tagline],
    ['hero_heading', config.hero_heading || defaultConfig.hero_heading]
  ])
});

const dataHandler = {
  onDataChanged(data) {
    allProducts = data.filter(d => d.name && d.price);
    renderShop();
    renderHomeProducts();
    renderMyProducts();
    try { saveProductsToLocal(); } catch (e) { }
  }
};

function setupHomeCarousel(keywords) {
  try {
    const container = document.getElementById('home-bg-carousel');
    if (!container) return;
    container.innerHTML = '';
    const track = document.createElement('div');
    track.className = 'bg-track';

    const kws = Array.isArray(keywords) && keywords.length ? keywords : ['ecommerce','shopping','storefront','marketplace','products','retail'];
    const images = kws.map(k => `https://source.unsplash.com/1600x900/?${encodeURIComponent(k)}`);
    const items = images.concat(images);
    items.forEach(url => {
      const d = document.createElement('div');
      d.className = 'bg-carousel-item';
      d.style.backgroundImage = `url(${url})`;
      track.appendChild(d);
    });
    container.appendChild(track);

    const duration = Math.max(20, images.length * 6);
    track.style.animationDuration = duration + 's';
  } catch (e) {
    console.warn('Carousel init failed', e);
  }
}

window.addEventListener('load', () => {
  setupHomeCarousel();
  try { bindButtonTouchResponses(); } catch (e) { }
});

function showUploadModal(count) {
  const modal = document.getElementById('upload-modal');
  if (!modal) return;
  document.getElementById('upload-list').innerHTML = '';
  modal.classList.remove('hidden');
  document.getElementById('upload-cancel-btn').classList.remove('hidden');
  document.getElementById('upload-close-btn').classList.add('hidden');
}

function hideUploadModal() {
  const modal = document.getElementById('upload-modal');
  if (!modal) return;
  document.getElementById('upload-cancel-btn').classList.add('hidden');
  document.getElementById('upload-close-btn').classList.remove('hidden');
  setTimeout(() => { modal.classList.add('hidden'); document.getElementById('upload-list').innerHTML = ''; }, 1400);
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'upload-cancel-btn') {
    window.__uploadProgressHandler = null;
    hideUploadModal();
    showToast('Upload cancelled');
  }
  if (e.target && e.target.id === 'upload-close-btn') {
    document.getElementById('upload-modal').classList.add('hidden');
  }
});

function bindButtonTouchResponses() {
  const selector = '.auth-cta, .hero-cta, .cat-btn, .side-link, .nav-link, .image-upload-area button, .product-card button';
  const nodes = Array.from(document.querySelectorAll(selector));
  nodes.forEach(el => {
    if (el._touchBound) return;
    el._touchBound = true;
    const trigger = (e) => {
      el.classList.remove('button-touch-anim');
      void el.offsetWidth;
      el.classList.add('button-touch-anim');
      if (e.type === 'touchstart') el.focus();
    };
    el.addEventListener('mouseenter', trigger, { passive: true });
    el.addEventListener('touchstart', trigger, { passive: true });
  });
}

function saveProductsToLocal() {
  try {
    localStorage.setItem('els_products', JSON.stringify(allProducts));
  } catch (e) { console.error('saveProductsToLocal failed', e); }
}

function loadProductsFromLocal() {
  try {
    const raw = localStorage.getItem('els_products');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      if (!allProducts || !allProducts.length) allProducts = parsed;
      renderShop(); renderHomeProducts(); renderMyProducts();
    }
  } catch (e) { console.error('loadProductsToLocal failed', e); }
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || '';
  el.classList.remove('hidden');
}

function clearFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

function validateOpenStoreForm() {
  let ok = true;
  const name = document.getElementById('prod-name').value.trim();
  const price = document.getElementById('prod-price').value.trim();
  const category = document.getElementById('prod-category').value.trim();
  const desc = document.getElementById('prod-desc').value.trim();

  if (!name) { showFieldError('err-prod-name', 'Please enter a product name'); ok = false; } else clearFieldError('err-prod-name');
  if (!price || isNaN(Number(price)) || Number(price) <= 0) { showFieldError('err-prod-price', 'Enter a valid price'); ok = false; } else clearFieldError('err-prod-price');
  if (!category) { showFieldError('err-prod-category', 'Select a category'); ok = false; } else clearFieldError('err-prod-category');
  if (!desc || desc.length < 10) { showFieldError('err-prod-desc', 'Description must be at least 10 characters'); ok = false; } else clearFieldError('err-prod-desc');

  return ok;
}

function updateAddProductButtonState() {
  const btn = document.getElementById('add-product-btn');
  if (!btn) return;
  const valid = validateOpenStoreForm();
  btn.disabled = !valid;
  btn.style.opacity = valid ? '1' : '0.6';
}

(function wireOpenStoreValidation(){
  const ids = ['prod-name','prod-price','prod-category','prod-desc'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => updateAddProductButtonState());
    el.addEventListener('change', () => updateAddProductButtonState());
  });
  setTimeout(updateAddProductButtonState, 200);
})();

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const regLogo = document.getElementById('register-logo');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');

  if (tab === 'login') {
    loginForm.classList.remove('hidden'); loginForm.setAttribute('aria-hidden', 'false');
    registerForm.classList.add('hidden'); registerForm.setAttribute('aria-hidden', 'true');
    regLogo.classList.add('hidden');
    loginTab.classList.add('text-white'); loginTab.classList.remove('text-gray-400'); loginTab.setAttribute('aria-pressed','true');
    registerTab.classList.remove('text-white'); registerTab.classList.add('text-gray-400'); registerTab.setAttribute('aria-pressed','false');
    setTimeout(()=>document.getElementById('login-email')?.focus(), 80);
  } else {
    loginForm.classList.add('hidden'); loginForm.setAttribute('aria-hidden', 'true');
    registerForm.classList.remove('hidden'); registerForm.setAttribute('aria-hidden', 'false');
    regLogo.classList.remove('hidden');
    registerTab.classList.add('text-white'); registerTab.classList.remove('text-gray-400'); registerTab.setAttribute('aria-pressed','true');
    loginTab.classList.remove('text-white'); loginTab.classList.add('text-gray-400'); loginTab.setAttribute('aria-pressed','false');
    setTimeout(()=>document.getElementById('reg-name')?.focus(), 80);
  }
}

function handleLogin(e) {
  e.preventDefault();
  currentUser.email = document.getElementById('login-email').value;
  currentUser.name = currentUser.email.split('@')[0];
  enterApp();
}

function handleRegister(e) {
  e.preventDefault();
  currentUser.name = document.getElementById('reg-name').value;
  currentUser.email = document.getElementById('reg-email').value;
  enterApp();
}

function enterApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  lucide.createIcons();
  showToast('Welcome, ' + currentUser.name + '!');
}

function handleLogout() {
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  toggleSidebar();
  cart = [];
  conversations = [];
  currentConversation = null;
  goTo('home');
}

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => { l.style.background = l.dataset.nav === page ? 'rgba(255,255,255,0.1)' : ''; l.style.color = l.dataset.nav === page ? 'white' : '#d1d5db'; });
  document.querySelectorAll('.side-link').forEach(l => { l.style.background = l.dataset.nav === page ? 'rgba(255,255,255,0.1)' : ''; l.style.color = l.dataset.nav === page ? 'white' : '#d1d5db'; });

  if (page === 'cart') renderCart();
  if (page === 'payment') renderPayment();
  if (page === 'shop') renderShop();
  if (page === 'messages') renderConversations();
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

function initHomeCarousel(images = [], speedPerImage = 6) {
  const container = document.getElementById('home-bg-carousel');
  if (!container) return;
  const imgs = (window.HOME_CAROUSEL_IMAGES && window.HOME_CAROUSEL_IMAGES.length) ? window.HOME_CAROUSEL_IMAGES : (images.length ? images : [
    'https://source.unsplash.com/1600x900/?ecommerce,shopping',
    'https://source.unsplash.com/1600x900/?store,products',
    'https://source.unsplash.com/1600x900/?marketplace,shop',
    'https://source.unsplash.com/1600x900/?retail,storefront',
    'https://source.unsplash.com/1600x900/?shopping,online',
    'https://source.unsplash.com/1600x900/?product,display'
  ]);

  container.innerHTML = '';
  const track = document.createElement('div'); track.className = 'bg-track';
  const all = imgs.concat(imgs);
  all.forEach(src => {
    const it = document.createElement('div'); it.className = 'bg-carousel-item';
    it.style.backgroundImage = `url('${src}')`;
    track.appendChild(it);
  });
  container.appendChild(track);

  const duration = Math.max(8, imgs.length * speedPerImage);
  track.style.animationDuration = duration + 's';
}

document.addEventListener('DOMContentLoaded', () => {
  initHomeCarousel();
});

(async () => {
  const r = await window.dataSdk.init(dataHandler);
  if (!r.isOk) console.error('Data SDK init failed');
})();

loadProductsFromLocal();
