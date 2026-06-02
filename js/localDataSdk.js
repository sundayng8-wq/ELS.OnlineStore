// localDataSdk.js  lightweight client-side data store to run frontend without backend
(function(){
  const LS_KEYS = { products: 'local_products_v1', orders: 'local_orders_v1', tx: 'local_transactions_v1', stores: 'local_stores_v1' };
  function read(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  function ensureDefaults(){ if(!localStorage.getItem(LS_KEYS.products)){
    const sample = [ { _id: 'p1', name: 'Sample Headphones', price: 149.99, description:'Comfortable wireless', seller: 'Test Seller', image_data:'', created_at: new Date().toISOString(), public:true } ]; write(LS_KEYS.products, sample); }
    if(!localStorage.getItem(LS_KEYS.orders)) write(LS_KEYS.orders, []);
    if(!localStorage.getItem(LS_KEYS.tx)) write(LS_KEYS.tx, []);
    if(!localStorage.getItem(LS_KEYS.stores)) write(LS_KEYS.stores, []);
  }

  function genId(prefix){ return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }

  const products = {
    getAll: async () => { return read(LS_KEYS.products); },
    create: async (p) => { const list = read(LS_KEYS.products); const item = Object.assign({}, p, { _id: genId('p'), created_at: new Date().toISOString() }); list.push(item); write(LS_KEYS.products, list); return { isOk: true, item, id: item._id }; },
    update: async (id, payload) => { const list = read(LS_KEYS.products); const idx = list.findIndex(x=>x._id==id); if(idx===-1) return { isOk:false }; list[idx] = Object.assign({}, list[idx], payload); write(LS_KEYS.products, list); return { isOk:true, item:list[idx] }; },
    delete: async (id) => { let list = read(LS_KEYS.products); list = list.filter(x=>x._id!=id); write(LS_KEYS.products, list); return { isOk:true }; },
    sellerMine: async (userEmail) => { const list = read(LS_KEYS.products); return list.filter(p => String(p.seller||'').toLowerCase() === String((userEmail||'').toLowerCase()) || (p.seller && p.seller === (window.currentUser && window.currentUser.name))); }
  };

  const orders = {
    listForSeller: async (userEmail) => { const list = read(LS_KEYS.orders); return list.filter(o => String(o.seller_email||o.seller||'').toLowerCase() === String((userEmail||'').toLowerCase())); }
  };

  const earnings = {
    seller: async (userEmail) => {
      const seller = String((userEmail||'')).toLowerCase();
      const ordersList = read(LS_KEYS.orders).filter(o => String(o.seller_email||o.seller||'').toLowerCase()===seller);
      const paid = ordersList.filter(o=> o.payment_status==='paid' || o.order_status==='delivered');
      const total = paid.reduce((s,o)=>s + (o.seller_payout||o.seller_payout===0? o.seller_payout : (o.total||0)),0);
      const monthAgo = new Date(Date.now() - 1000*60*60*24*30);
      const monthly = paid.filter(o=> new Date(o.created_at) > monthAgo).reduce((s,o)=>s + (o.seller_payout||o.total||0),0);
      const pending = ordersList.filter(o=> o.payment_status!=='paid').reduce((s,o)=>s + (o.seller_payout||o.total||0),0);
      const txs = read(LS_KEYS.tx).filter(t=> (t.split_details||[]).some(s=> String(s.seller_email||s.seller||'').toLowerCase()===seller)).map(t=>({ parent_transaction_id: t.parent_transaction_id, payout: (t.split_details||[]).reduce((s,d)=> s + (String((d.seller_email||d.seller||'')).toLowerCase()===seller ? (d.payout||0):0),0), created_at: t.created_at }));
      return { total, monthly, pending, payouts: txs };
    }
  };

  const stores = {
    create: async (store) => { const list = read(LS_KEYS.stores); const item = Object.assign({}, store, { _id: genId('s'), created_at: new Date().toISOString() }); list.push(item); write(LS_KEYS.stores, list); return { isOk:true, item }; },
    getByOwner: async (ownerEmail) => { const list = read(LS_KEYS.stores); return list.filter(s=> String(s.owner_email||s.owner_id||'').toLowerCase()===String((ownerEmail||'').toLowerCase())); }
  };

  // expose unified dataSdk for existing frontend
  window.localSdk = { products, orders, earnings, stores, _lsKeys: LS_KEYS };
  window.dataSdk = window.dataSdk || {
    getAll: async () => { return products.getAll(); },
    create: async (p) => { return products.create(p); },
    update: async (p) => { if(!p || !p._id) return { isOk:false }; return products.update(p._id, p); },
    delete: async (p) => { const id = (p && (p._id || p.__backendId)) || p; return products.delete(id); }
  };

  ensureDefaults();

  // convenience: auto-seed store for current user if missing
  try { if(!localStorage.getItem('local_store_seeded')){ const u = JSON.parse(localStorage.getItem('els_user')||'null'); if(u && u.name){ const stores = read(LS_KEYS.stores); stores.push({ _id: genId('s'), owner_id: u._id || u.email, store_name: u.name + "'s Store", bank_account_number:'0000000000', bank_name:'LocalBank', created_at: new Date().toISOString() }); write(LS_KEYS.stores, stores); localStorage.setItem('local_store_seeded','1'); } } }catch(e){}

})();
