// Minimal stub for data_sdk used by tests/demo pages
window.DataSDK = window.DataSDK || {
  fetchProducts: function(){ return Promise.resolve([]); },
  getUser: function(){ return Promise.resolve(null); },
  saveOrder: function(order){ console.log('DataSDK.saveOrder', order); return Promise.resolve({ ok: true, id: 'stub-'+Date.now() }); }
};
