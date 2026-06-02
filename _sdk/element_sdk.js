// Minimal stub for element_sdk used by tests/demo pages
window.ElementSDK = window.ElementSDK || {
  createElement: function(tag, attrs){ const el = document.createElement(tag); for(const k in attrs) el.setAttribute(k, attrs[k]); return el; },
  mount: function(selector, html){ const root = document.querySelector(selector); if(root) root.innerHTML = html; }
};
