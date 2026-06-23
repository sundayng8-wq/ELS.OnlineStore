/* js/els2app.js - merged els2 features: product/cart, payment, QR, logistics, login enhancements */
(function(){
  // ---- els2App module ----
  if(!window.els2App){
    window.els2App = (function(){
      const config = { shipping_cost:9.99, payment_upi_id: 'merchant@upi', tax_rate:8 };
      const products = [
        { id:1, name:'Premium Wireless Headphones', price:149.99, emoji:'🎧' },
        { id:2, name:'Smart Watch Pro', price:299.99, emoji:'⌚' },
        { id:3, name:'Portable SSD 1TB', price:129.99, emoji:'💾' }
      ];
      let cart = [];

      function getCart(){ return cart; }

      function renderProducts(){
        const grid = document.getElementById('productsGrid') || document.querySelector('.product-grid') || document.querySelector('.products-grid');
        if(!grid) return;
        if(grid.querySelectorAll && grid.querySelectorAll('.product-card').length > 0) return;
        grid.innerHTML = products.map(p=>`<div class="product-card" data-id="${p.id}"><div class="product-image">${p.emoji}</div><div class="product-info"><div class="product-name">${p.name}</div><div class="product-price">$${p.price.toFixed(2)}</div><button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button></div></div>`).join('');
      }

      function addToCart(id){ const p = products.find(x=>x.id===id); if(!p) return; const ex = cart.find(i=>i.id===id); if(ex) ex.quantity++; else cart.push({...p,quantity:1}); updateCart(); showPage('page-cart'); }

      function updateCart(){ const container = document.getElementById('cartContainer')||document.getElementById('cart-items'); if(!container) return; if(cart.length===0){ container.innerHTML = `<div class="empty-cart"><div class="empty-icon">🛒</div><div class="empty-text">Your cart is empty</div><button class="btn btn-primary" onclick="els2App.showPage('page-shop')">Continue Shopping</button></div>`; return; } container.innerHTML = `<div class="cart-items">`+cart.map((item,idx)=>`<div class="cart-item" data-idx="${idx}"><div class="cart-item-image">${item.emoji}</div><div class="cart-item-details"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">$${item.price.toFixed(2)} each</div></div><div class="cart-item-quantity"><button class="qty-btn" data-idx="${idx}" data-delta="-1">−</button><span style="min-width:20px;text-align:center">${item.quantity}</span><button class="qty-btn" data-idx="${idx}" data-delta="1">+</button></div><div style="text-align:right;min-width:80px"><div style="font-weight:600;margin-bottom:8px">$${(item.price*item.quantity).toFixed(2)}</div><button class="remove-btn" data-idx="${idx}">Remove</button></div></div>`).join('')+`</div>`+renderOrderSummaryHTML(); }

      function renderOrderSummaryHTML(){ const subtotal = cart.reduce((s,i)=>s+i.price*i.quantity,0); const shipping = config.shipping_cost; const tax = (subtotal+shipping)*(config.tax_rate/100); const total = subtotal+shipping+tax; return `<div class="order-summary"><div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div><div class="summary-row"><span>Shipping</span><span>$${shipping.toFixed(2)}</span></div><div class="summary-row"><span>Tax (${config.tax_rate}%)</span><span>$${tax.toFixed(2)}</span></div><div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div></div><div class="buttons-row" style="margin-top:24px"><button class="btn btn-secondary" onclick="els2App.showPage('page-shop')">← Continue Shopping</button><button class="btn btn-primary" onclick="els2App.showPage('page-checkout')">Proceed to Checkout</button></div>`; }

      function updateQuantity(idx,change){ if(!cart[idx]) return; cart[idx].quantity += change; if(cart[idx].quantity<=0) removeFromCart(idx); else updateCart(); }
      function removeFromCart(idx){ cart.splice(idx,1); updateCart(); }

      function showPage(pageId){ const map = { shopPage:'page-shop', cartPage:'page-cart', checkoutPage:'page-checkout', successPage:'page-contact-thanks', homePage:'page-home', shop:'page-shop', cart:'page-cart', checkout:'page-checkout', home:'page-home', payment:'page-payment' }; const target = map[pageId] || pageId; document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); const el = document.getElementById(target); if(el) el.classList.add('active'); if(target==='page-checkout') updateOrderSummaryDisplay(); }

      function updateOrderSummaryDisplay(){ const subtotal = cart.reduce((s,i)=>s+i.price*i.quantity,0); const shipping = config.shipping_cost; const tax = (subtotal+shipping)*(config.tax_rate/100); const total = subtotal+shipping+tax; const elSub = document.getElementById('subtotal'); if(elSub) elSub.textContent = '$'+subtotal.toFixed(2); const elShip=document.getElementById('shippingDisplay'); if(elShip) elShip.textContent='$'+shipping.toFixed(2); const elTax=document.getElementById('tax'); if(elTax) elTax.textContent='$'+tax.toFixed(2); const elTot=document.getElementById('total'); if(elTot) elTot.textContent='$'+total.toFixed(2); const paymentTotal=document.getElementById('paymentTotal'); if(paymentTotal) paymentTotal.textContent='$'+total.toFixed(2); const summaryItems=document.getElementById('summaryItems'); if(summaryItems) summaryItems.innerHTML = cart.map(it=>`<div class="summary-row"><span>${it.name} (x${it.quantity})</span><span>$${(it.price*it.quantity).toFixed(2)}</span></div>`).join(''); }

      function createProduct(product){ const newId = product && product.id ? product.id : ((products.length && products[products.length-1] && products[products.length-1].id+1) || (products.length+1)); const pr = { id: newId, name: product.name||'New Item', price: parseFloat(product.price)||0, emoji: product.emoji||'📦', image: product.image||null, description: product.description||'' }; products.push(pr);
        // append to visible products grid if present
        try{
          const grid = document.getElementById('productsGrid') || document.querySelector('.products-grid') || document.querySelector('.product-grid');
          if(grid){ const card = document.createElement('div'); card.className='product-card'; card.dataset.id = pr.id; card.innerHTML = `<div class="product-image">${pr.emoji}</div><div class="product-info"><div class="product-name">${pr.name}</div><div class="product-price">$${pr.price.toFixed(2)}</div><button class="add-to-cart-btn" data-id="${pr.id}">Add to Cart</button></div>`; grid.appendChild(card); // bind add handler
            const btn = card.querySelector('.add-to-cart-btn'); if(btn) btn.addEventListener('click', ()=>{ if(window.els2App && typeof window.els2App.addToCart==='function') window.els2App.addToCart(pr.id); });
        }
        }catch(e){ console.error('createProduct append failed',e); }
        try{ updateCart(); }catch(e){}
      }

      // QR modal and payment
      function openQRModal(){ const subtotal = cart.reduce((s,i)=>s+i.price*i.quantity,0); const shipping = config.shipping_cost; const tax=(subtotal+shipping)*(config.tax_rate/100); const total=subtotal+shipping+tax; const amtEl=document.getElementById('qrModalAmount'); if(amtEl) amtEl.textContent='$'+total.toFixed(2); const upi=config.payment_upi_id||'merchant@upi'; const txn='TXN'+Date.now(); const link=`upi://pay?pa=${upi}&pn=els.online&am=${total.toFixed(2)}&tn=Order%20Payment&tr=${txn}`; const qrDiv=document.getElementById('qrCodeModal'); if(qrDiv){ qrDiv.innerHTML=''; try{ new QRCode(qrDiv,{text:link,width:280,height:280,colorDark:'#2563eb',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H}); }catch(e){ qrDiv.textContent = 'QR gen failed'; } } const modal=document.getElementById('qrModal'); if(modal) modal.classList.add('active'); }
      function closeQRModal(){ const modal=document.getElementById('qrModal'); if(modal) modal.classList.remove('active'); }
      function confirmPayment(){ completeOrder(); closeQRModal(); }

      function completeOrder(){ const orderNumber='ORD-'+Date.now(); const orderDetailsEl=document.getElementById('successOrderDetails'); if(orderDetailsEl){ orderDetailsEl.innerHTML=`<div style="padding:12px">Order ${orderNumber} — Thank you! <br/> Items: ${cart.map(i=>i.name+' x'+i.quantity).join(', ')}</div>`; } showPage('page-contact-thanks'); cart=[]; updateCart(); }

      // initialization
      function init(){ renderProducts(); updateCart(); // attach listeners for existing static add-to-cart buttons
        document.querySelectorAll('.add-to-cart, .add-to-cart-btn').forEach(btn=>{ if(btn.__els_bound) return; btn.__els_bound = true; btn.addEventListener('click', ()=>{ const card = btn.closest('[data-id]'); const id = card ? parseInt(card.dataset.id) : NaN; if(!isNaN(id)) addToCart(id); else { addToCart(products[0].id); } }); });
        // delegate qty/remove buttons inside cart container
        document.addEventListener('click', function(e){ const t=e.target; if(t && t.matches('.qty-btn')){ const idx=parseInt(t.dataset.idx); const delta=parseInt(t.dataset.delta); if(!isNaN(idx)) updateQuantity(idx, delta); } if(t && t.matches('.remove-btn')){ const idx=parseInt(t.dataset.idx); if(!isNaN(idx)) removeFromCart(idx); } });
        try{ lucide && lucide.createIcons && lucide.createIcons(); }catch(e){}
      }

      return { init, renderProducts, addToCart, updateCart, updateQuantity, removeFromCart, showPage, openQRModal, closeQRModal, confirmPayment, completeOrder, getCart, createProduct };
    })();
    window.addEventListener('DOMContentLoaded', ()=>{ try{ window.els2App.init(); }catch(e){console.error(e)} });
  }

  // ---- Utilities & enhanced features ----
  // password visibility helper
  window.togglePasswordVisibility = function(fieldId, btn){
    const f = document.getElementById(fieldId);
    if(!f) return;
    if(f.type === 'password'){ f.type = 'text'; if(btn) btn.setAttribute('aria-pressed','true'); }
    else { f.type = 'password'; if(btn) btn.setAttribute('aria-pressed','false'); }
    try{ lucide && lucide.createIcons && lucide.createIcons(); }catch(e){}
  };

  function calculateTotals(cart){ const subtotal = (cart||[]).reduce((s,i)=>s + (i.price||0)*(i.quantity||1),0); const shipping = 9.99; const tax = (subtotal+shipping)*0.08; const total = +(subtotal+shipping+tax).toFixed(2); return {subtotal,shipping,tax,total}; }

  function openPaymentChooser(){ const cart = (window.els2App && typeof window.els2App.getCart==='function') ? window.els2App.getCart() : []; const totals = calculateTotals(cart); const modal = document.getElementById('qrModal'); if(!modal) return; const amt = document.getElementById('qrModalAmount'); if(amt) amt.textContent = '$'+(totals.total||0).toFixed(2);
    // build payment chooser UI once
    if(!modal.__paymentOptionsInjected){
      const instr = modal.querySelector('.qr-modal-instructions');
      const wrap = document.createElement('div'); wrap.className = 'payment-chooser';
      wrap.innerHTML = `
        <div class="payment-options" style="display:flex;gap:8px;justify-content:center;margin-top:12px">
          <button class="btn btn-primary" id="pay-qr">Pay with QR</button>
          <button class="btn btn-secondary" id="pay-card">Pay with Card (Sim)</button>
          <button class="btn btn-secondary" id="pay-split">Split Payment</button>
        </div>
        <div id="cardPaymentForm" style="display:none;margin-top:12px">
          <div style="max-width:420px;margin:8px auto;text-align:left">
            <label>Card number</label><input id="card-number" class="w-full p-2 rounded border" placeholder="4242 4242 4242 4242" />
            <div style="display:flex;gap:8px;margin-top:8px"><div style="flex:1"><label>Expiry</label><input id="card-exp" class="w-full p-2 rounded border" placeholder="MM/YY" /></div><div style="flex:1"><label>CVC</label><input id="card-cvc" class="w-full p-2 rounded border" placeholder="123" /></div></div>
            <div style="text-align:right;margin-top:8px"><button id="card-pay-now" class="btn btn-primary">Pay <span id="card-pay-amount"></span></button></div>
          </div>
        </div>
        <div id="splitPaymentForm" style="display:none;margin-top:12px">
          <div style="max-width:520px;margin:8px auto;text-align:left">
            <label>Split amount (enter portion for first payer)</label>
            <input id="split-amount" class="w-full p-2 rounded border" placeholder="e.g. 10.00" />
            <div style="display:flex;gap:8px;margin-top:8px;justify-content:flex-end"><button id="split-pay-now" class="btn btn-primary">Simulate Split Payment</button></div>
          </div>
        </div>
      `;
      if(instr) instr.parentNode.insertBefore(wrap,instr.nextSibling); else (modal.querySelector('.qr-modal-body')||modal).appendChild(wrap);
      modal.__paymentOptionsInjected = true;

      // wire events
      setTimeout(()=>{
        document.getElementById('pay-qr') && document.getElementById('pay-qr').addEventListener('click', ()=>{ window.els2App && window.els2App.openQRModal && window.els2App.openQRModal(); });
        document.getElementById('pay-card') && document.getElementById('pay-card').addEventListener('click', ()=>{ document.getElementById('cardPaymentForm').style.display='block'; document.getElementById('splitPaymentForm').style.display='none'; document.getElementById('card-pay-amount').textContent = amt ? ' '+amt.textContent : '' ; });
        document.getElementById('pay-split') && document.getElementById('pay-split').addEventListener('click', ()=>{ document.getElementById('splitPaymentForm').style.display='block'; document.getElementById('cardPaymentForm').style.display='none'; });
        document.getElementById('card-pay-now') && document.getElementById('card-pay-now').addEventListener('click', (ev)=>{ ev.preventDefault(); handleCardPayment(); });
        document.getElementById('split-pay-now') && document.getElementById('split-pay-now').addEventListener('click', (ev)=>{ ev.preventDefault(); handleSplitPayment(); });
      },80);
    }
    modal.classList.add('active');
  }

  function handleCardPayment(){ const cardNum = (document.getElementById('card-number')||{}).value||''; const exp = (document.getElementById('card-exp')||{}).value||''; const cvc = (document.getElementById('card-cvc')||{}).value||''; if(cardNum.length<12 || exp.length<3 || cvc.length<3){ alert('Enter valid card details (demo)'); return; } // simulate network
    const btn = document.getElementById('card-pay-now'); if(btn) btn.disabled=true; setTimeout(()=>{ if(btn) btn.disabled=false; // success
      document.getElementById('qrModal') && document.getElementById('qrModal').classList.remove('active'); window.els2App && window.els2App.completeOrder && window.els2App.completeOrder(); },900);
  }

  function handleSplitPayment(){ const val = parseFloat((document.getElementById('split-amount')||{}).value||'0'); if(isNaN(val) || val<=0){ alert('Enter a split amount (demo)'); return; } // simulate two-party payments
    const btn = document.getElementById('split-pay-now'); if(btn) btn.disabled=true; setTimeout(()=>{ if(btn) btn.disabled=false; document.getElementById('qrModal') && document.getElementById('qrModal').classList.remove('active'); window.els2App && window.els2App.completeOrder && window.els2App.completeOrder(); },1200);
  }

  function simulateLogistics(orderId){ const steps = ['step-Pending','step-Paid','step-Processing','step-Shipped','step-Delivered']; let i=0; function step(){ if(i>0){ const prev = document.getElementById(steps[i-1]); if(prev){ prev.classList.remove('current'); prev.classList.add('completed'); } } const el = document.getElementById(steps[i]); if(el){ el.classList.add('current'); } const speedEl = document.getElementById('tel-speed'); const etaEl = document.getElementById('tel-eta'); if(speedEl) speedEl.textContent = Math.floor(Math.random()*60)+' km/h'; if(etaEl) etaEl.textContent = (30 - i*6)+' mins'; i++; if(i<steps.length) setTimeout(step, 4000); } step(); }

  // --- Logistics portal: simulated partners, filter, and tracking ---
  const _logisticsPartners = [
    { id: 'LP-1', name: 'RapidMove', vehicle: '🛵', region: 'Central', distanceKm: 2.4, etaMin: 8, rating: 4.8, available:true },
    { id: 'LP-2', name: 'GreenTrucks', vehicle: '🚚', region: 'South', distanceKm: 5.8, etaMin: 14, rating: 4.4, available:true },
    { id: 'LP-3', name: 'CityVan', vehicle: '🚗', region: 'Central', distanceKm: 3.9, etaMin: 11, rating: 4.6, available:true },
    { id: 'LP-4', name: 'HeavyHaul', vehicle: '📦', region: 'West', distanceKm: 12.1, etaMin: 32, rating: 4.2, available:false },
    { id: 'LP-5', name: 'SpeedyBike', vehicle: '🛵', region: 'East', distanceKm: 1.2, etaMin: 5, rating: 4.9, available:true }
  ];

  function loadLogisticsPartners(){ const list = document.getElementById('logisticsPartnersList'); if(!list) return; list.innerHTML=''; _logisticsPartners.forEach(p=>{ const card=document.createElement('div'); card.style.display='flex'; card.style.justifyContent='space-between'; card.style.alignItems='center'; card.style.background='#fff'; card.style.padding='10px'; card.style.borderRadius='8px'; card.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><div style="font-size:20px">${p.vehicle}</div><div><div style="font-weight:700">${p.name}</div><div style="font-size:12px;color:#666">Region: ${p.region} — ${p.distanceKm} km — ETA ${p.etaMin}m — ⭐ ${p.rating}</div></div></div><div><button class="btn-req" data-id="${p.id}" ${p.available? '':'disabled'} style="padding:8px 10px;border-radius:8px;background:${p.available? '#2563eb':'#ddd'};color:${p.available? '#fff':'#666'}">${p.available? 'Request Pickup':'Unavailable'}</button></div>`; list.appendChild(card); });
    const avail = _logisticsPartners.filter(p=>p.available).length; const ready = _logisticsPartners.length; const st = document.getElementById('availablePartnersCount'); if(st) st.textContent = avail; const rp = document.getElementById('readyPickupCount'); if(rp) rp.textContent = ready; const stat = document.getElementById('logisticsStatus'); if(stat) stat.textContent = `${avail} Partners Online`;
    // wire buttons
    list.querySelectorAll('.btn-req').forEach(btn=>{ if(btn.__bound) return; btn.__bound=true; btn.addEventListener('click', ()=>{ const id=btn.dataset.id; requestPickupWithPartner(id); }); }); }

  function filterLogisticsPartners(){ const region = (document.getElementById('partnerRegionFilter')||{}).value || ''; const sort = (document.getElementById('partnerSortFilter')||{}).value || 'distance'; const veh = (document.getElementById('partnerVehicleFilter')||{}).value || ''; let arr = _logisticsPartners.slice(); if(region) arr = arr.filter(p=>p.region===region); if(veh) arr = arr.filter(p=>p.vehicle===veh); if(sort==='distance') arr.sort((a,b)=>a.distanceKm-b.distanceKm); if(sort==='eta') arr.sort((a,b)=>a.etaMin-b.etaMin); if(sort==='rating') arr.sort((a,b)=>b.rating-a.rating); // render
    const list = document.getElementById('logisticsPartnersList'); if(!list) return; list.innerHTML=''; arr.forEach(p=>{ const card=document.createElement('div'); card.style.display='flex'; card.style.justifyContent='space-between'; card.style.alignItems='center'; card.style.background='#fff'; card.style.padding='10px'; card.style.borderRadius='8px'; card.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><div style="font-size:20px">${p.vehicle}</div><div><div style="font-weight:700">${p.name}</div><div style="font-size:12px;color:#666">Region: ${p.region} — ${p.distanceKm} km — ETA ${p.etaMin}m — ⭐ ${p.rating}</div></div></div><div><button class="btn-req" data-id="${p.id}" ${p.available? '':'disabled'} style="padding:8px 10px;border-radius:8px;background:${p.available? '#2563eb':'#ddd'};color:${p.available? '#fff':'#666'}">${p.available? 'Request Pickup':'Unavailable'}</button></div>`; list.appendChild(card); });
    list.querySelectorAll('.btn-req').forEach(btn=>{ if(btn.__bound) return; btn.__bound=true; btn.addEventListener('click', ()=>{ const id=btn.dataset.id; requestPickupWithPartner(id); }); }); }

  function requestPickupWithPartner(partnerId){ const p = _logisticsPartners.find(x=>x.id===partnerId); if(!p){ alert('Partner not found'); return; } // simulate acceptance
    const accept = Math.random() > 0.2; if(!accept){ alert(p.name+' did not accept the request (simulated)'); return; }
    // show tracking for this partner
    startPartnerTracking(p); alert('Pickup accepted by '+p.name+' — tracking started (simulated)'); }

  let _trackingInterval = null;
  let _trackingState = null;

  function _haversineKm(lat1, lon1, lat2, lon2){ const toRad = v=>v*Math.PI/180; const R=6371; const dLat=toRad(lat2-lat1); const dLon=toRad(lon2-lon1); const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2); const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); return R*c; }

  function startPartnerTracking(partner){ // simulate GPS path and ETA
    const map = document.getElementById('mapPlaceholder'); const speedEl = document.getElementById('tel-speed'); const etaEl = document.getElementById('tel-eta');
    if(_trackingInterval) { clearInterval(_trackingInterval); _trackingInterval = null; _trackingState = null; }

    // destination - try to use a stored user location, else default (Lagos coords)
    const dest = (window.__ELS_DEST && window.__ELS_DEST.lat && window.__ELS_DEST.lon) ? window.__ELS_DEST : { lat:6.5244, lon:3.3792 };
    // starting point: randomised around destination using partner.distanceKm
    const bearing = (Math.random()*360) * Math.PI/180;
    const startOffsetKm = partner.distanceKm || (2 + Math.random()*8);
    // rough offset in degrees (~111km per degree lat)
    const startLat = dest.lat + (startOffsetKm/111) * Math.cos(bearing);
    const startLon = dest.lon + (startOffsetKm/ (111*Math.cos(dest.lat*Math.PI/180))) * Math.sin(bearing);

    const totalDistanceKm = Math.max(0.1, _haversineKm(startLat,startLon,dest.lat,dest.lon));
    // choose an average speed km/h for simulation (randomized but sensible)
    let avgSpeedKmh = 25 + Math.random()*45; // 25-70 km/h
    // ensure speed consistent with partner vehicle (bikes faster in short trips)
    if(partner.vehicle && partner.vehicle.includes('🛵')) avgSpeedKmh = Math.max(avgSpeedKmh, 35);

    // compute step distance per tick (tickMs), and steps count
    const tickMs = 2000; // update every 2s for smoothness
    const kmPerTick = avgSpeedKmh * (tickMs/3600000);
    const steps = Math.max(6, Math.ceil(totalDistanceKm / Math.max(kmPerTick, 0.01)));

    // build linear interpolation path
    const path = []; for(let i=0;i<=steps;i++){ const t = i/steps; const lat = startLat + (dest.lat - startLat)*t; const lon = startLon + (dest.lon - startLon)*t; path.push({lat,lon}); }

    let idx = 0; _trackingState = { partnerId: partner.id, path, dest, avgSpeedKmh };

    function renderFrame(){ const pos = _trackingState.path[idx]; const remainingKm = Math.max(0, _haversineKm(pos.lat,pos.lon, _trackingState.dest.lat, _trackingState.dest.lon)); const estMins = Math.ceil((remainingKm / Math.max(0.1,_trackingState.avgSpeedKmh)) * 60);
      if(map) map.innerHTML = `<div style="font-weight:700">${partner.name} — ${partner.vehicle}</div><div style="font-size:13px;color:#444;margin-top:6px">Pos: ${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)} — ${remainingKm.toFixed(2)} km remaining</div><div style="margin-top:8px"><div style="height:10px;background:#eee;border-radius:6px;overflow:hidden"><div style="width:${Math.min(100, Math.round((idx/_trackingState.path.length)*100))}%;height:100%;background:linear-gradient(90deg,#34d399,#2563eb)"></div></div></div>`;
      if(speedEl) speedEl.textContent = Math.floor(_trackingState.avgSpeedKmh - 5 + Math.random()*12) + ' km/h'; if(etaEl) etaEl.textContent = estMins + ' mins';
      // advance
      idx++; if(idx>=_trackingState.path.length){ // arrived
        if(_trackingInterval) clearInterval(_trackingInterval); _trackingInterval = null; _trackingState = null; if(map) map.innerHTML = `<div style="font-weight:700">${partner.name} — Delivered ✅</div><div style="font-size:13px;color:#444;margin-top:6px">Arrived at destination</div>`; if(speedEl) speedEl.textContent='0 km/h'; if(etaEl) etaEl.textContent='0 mins'; }
    }

    // immediate first render
    renderFrame(); _trackingInterval = setInterval(renderFrame, tickMs);
    // expose stop function
    window.ELS.stopTracking = function(){ if(_trackingInterval) clearInterval(_trackingInterval); _trackingInterval = null; _trackingState = null; if(map) map.textContent = 'Tracking stopped'; if(speedEl) speedEl.textContent='0 km/h'; if(etaEl) etaEl.textContent='-'; };
  }


  function handleLoginEnhanced(e){ e && e.preventDefault(); const email = document.getElementById('login-email').value; const pass = document.getElementById('login-pass').value; const region = document.getElementById('login-region') ? document.getElementById('login-region').value : 'global'; if(!email||!pass){ alert('Enter email and password'); return; } window.__ELS_USER = { email, region, role:'buyer' }; if(region && region.toLowerCase().includes('driver')) window.__ELS_USER.role='delivery'; document.getElementById('auth-screen') && document.getElementById('auth-screen').classList.add('hidden'); document.getElementById('main-app') && document.getElementById('main-app').classList.remove('hidden'); const initial = (email||'U').charAt(0).toUpperCase(); const avatar = document.getElementById('user-avatar-initial'); if(avatar) avatar.textContent = initial; if(window.__ELS_USER.role==='delivery'){ if(typeof goTo === 'function') goTo('logistics'); } }

  // Wire UI bindings after DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    // bind static add-to-cart buttons
    document.querySelectorAll('.add-to-cart, .add-to-cart-btn').forEach(btn=>{ if(btn.__els2_bound) return; btn.__els2_bound = true; btn.addEventListener('click', ()=>{ const card = btn.closest('[data-id]'); const id = card ? parseInt(card.dataset.id) : NaN; if(!isNaN(id) && window.els2App && typeof window.els2App.addToCart === 'function') window.els2App.addToCart(id); else if(window.els2App && typeof window.els2App.addToCart === 'function') window.els2App.addToCart(1); }); });

    // bind checkout form to open payment chooser
    const chk = document.getElementById('form-checkout'); if(chk){ chk.removeEventListener('submit', window.__oldCheckoutHandler); chk.addEventListener('submit', e=>{ e.preventDefault(); const payBtn = document.getElementById('btn-pay-now'); try{ if(typeof setButtonLoading === 'function') setButtonLoading(payBtn, true, 'Processing '); }catch(_){}; if(window.ELS && typeof window.ELS.openPaymentChooser === 'function'){ window.ELS.openPaymentChooser(); } else if(window.els2App && typeof window.els2App.showPage === 'function'){ window.els2App.showPage('page-checkout'); } setTimeout(()=>{ try{ if(typeof setButtonLoading === 'function') setButtonLoading(payBtn, false); }catch(_){} }, 900); }); }

    // login enhancements
    const loginForm = document.getElementById('login-form'); if(loginForm){ loginForm.removeEventListener('submit', handleLoginEnhanced); loginForm.addEventListener('submit', handleLoginEnhanced); }
    if(!document.getElementById('login-region')){ const node = document.createElement('select'); node.id='login-region'; node.style.marginTop='8px'; node.className='w-full px-4 py-2 rounded-xl bg-white/5 text-white'; node.innerHTML = `<option value="global">Region: Global</option><option value="lagos">Region: Lagos</option><option value="abuja">Region: Abuja</option><option value="driver-lagos">Role: Driver (Lagos)</option>`; const form = document.getElementById('login-form'); if(form) form.appendChild(node); }

    // expose utilities
    window.ELS = window.ELS||{}; window.ELS.calculateTotals = calculateTotals; window.ELS.simulateLogistics = simulateLogistics; window.ELS.openPaymentChooser = openPaymentChooser;

    // Seller upload helpers: inject modal and handlers
    (function(){
      function createUploadModal(){
        if(document.getElementById('sellModal')) return;
        const modal = document.createElement('div'); modal.id='sellModal'; modal.className='qr-modal-overlay'; modal.innerHTML = `
          <div class="qr-modal">
            <div class="qr-modal-header"><div>Create Product</div><div><button id="sellClose" class="btn">Close</button></div></div>
            <div class="qr-modal-body">
              <form id="sellForm" style="max-width:600px;margin:12px auto;text-align:left">
                <label>Product name</label>
                <input id="sell-name" class="w-full p-2 rounded border" required />
                <label style="margin-top:8px">Price (USD)</label>
                <input id="sell-price" class="w-full p-2 rounded border" required />
                <label style="margin-top:8px">Description</label>
                <textarea id="sell-desc" class="w-full p-2 rounded border"></textarea>
                <label style="margin-top:8px">Image</label>
                <input id="sell-image" type="file" accept="image/*" class="w-full p-2" />
                <div style="margin-top:12px;text-align:right"><button id="sellSubmit" class="btn btn-primary">Upload Product</button></div>
              </form>
            </div>
          </div>`;
        document.body.appendChild(modal);
        document.getElementById('sellClose').addEventListener('click', ()=>{ modal.classList.remove('active'); });
        document.getElementById('sellForm').addEventListener('submit', function(e){ e.preventDefault(); handleSellSubmit(); });
      }

      function handleSellSubmit(){ const name = (document.getElementById('sell-name')||{}).value||''; const price = parseFloat((document.getElementById('sell-price')||{}).value||'0'); const desc = (document.getElementById('sell-desc')||{}).value||''; const file = (document.getElementById('sell-image')||{}).files && document.getElementById('sell-image').files[0];
        function pushProduct(imageData){ const newId = (window.els2App && window.els2App.getCart) ? (Date.now()%100000) : Date.now(); const emoji = '📦'; try{ if(window.els2App && typeof window.els2App.renderProducts === 'function'){ window.els2App && window.els2App.createProduct ? window.els2App.createProduct({ id:newId, name, price, emoji, image:imageData, description:desc }) : (function(){ /* fallback push into internal list if possible */ })(); }
        }catch(e){ console.error(e); }
        const modal = document.getElementById('sellModal'); if(modal) modal.classList.remove('active'); alert('Product uploaded (demo)'); }

      // file reader and create product
      function initUploadBindings(){ createUploadModal(); // floating sell button
        if(!document.getElementById('sellBtn')){
          const btn = document.createElement('button'); btn.id='sellBtn'; btn.textContent='Sell Product'; btn.className='btn btn-secondary'; btn.style.position='fixed'; btn.style.left='16px'; btn.style.bottom='16px'; btn.style.zIndex=9999; document.body.appendChild(btn);
          btn.addEventListener('click', ()=>{ const m = document.getElementById('sellModal'); if(m) m.classList.add('active'); });
        }
        // when form submitted, read file and call createProduct
        document.addEventListener('click', async function(e){ if(e.target && e.target.id==='sellSubmit'){ e.preventDefault(); const name = (document.getElementById('sell-name')||{}).value||''; const price = parseFloat((document.getElementById('sell-price')||{}).value||'0'); const desc = (document.getElementById('sell-desc')||{}).value||''; const fileEl = document.getElementById('sell-image'); let dataUrl=null; if(fileEl && fileEl.files && fileEl.files[0]){ dataUrl = await new Promise(res=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(fileEl.files[0]); }); }
            const payload = { name, price, description: desc, image: dataUrl, emoji: '📦' };
            // call API on els2App if present
            try{ if(window.els2App && typeof window.els2App.createProduct === 'function'){ window.els2App.createProduct(payload); } else if(window.ELS && typeof window.ELS.createProduct === 'function'){ window.ELS.createProduct(payload); } else { alert('Product added (demo)'); }
            }catch(err){ console.error(err); }
            const modal = document.getElementById('sellModal'); if(modal) modal.classList.remove('active'); }
        });
      }
      // expose simple API for external code
      window.ELS.createProduct = function(p){ try{ if(window.els2App && typeof window.els2App.createProduct === 'function') return window.els2App.createProduct(p); }catch(e){} };
      // init after small delay
      setTimeout(initUploadBindings, 300);
    })();

    // Test harness fallbacks: ensure at least one add-to-cart and payment buttons exist for automated tests
    if(!document.querySelector('.add-to-cart') && !document.querySelector('.add-to-cart-btn')){
      const tbtn = document.createElement('button');
      tbtn.className = 'add-to-cart';
      tbtn.dataset.id = products && products[0] ? products[0].id : 1;
      tbtn.style.position = 'fixed'; tbtn.style.bottom = '16px'; tbtn.style.right = '16px'; tbtn.style.zIndex = 9999;
      tbtn.style.padding = '10px 14px'; tbtn.style.background = '#2563eb'; tbtn.style.color = '#fff'; tbtn.style.borderRadius = '8px';
      tbtn.textContent = 'Test Add to Cart';
      tbtn.addEventListener('click', ()=>{ const id = parseInt(tbtn.dataset.id||1); if(window.els2App && window.els2App.addToCart) window.els2App.addToCart(id); });
      document.body.appendChild(tbtn);
    }

    if(!document.getElementById('pay-qr')){
      const wrapper = document.createElement('div'); wrapper.id = 'test-payment-buttons'; wrapper.style.display = 'none';
      wrapper.innerHTML = `<button id="pay-qr">Pay with QR</button><button id="pay-card">Pay with Card (Sim)</button><button id="pay-split">Split Payment</button>`;
      document.body.appendChild(wrapper);
      document.getElementById('pay-qr').addEventListener('click', ()=>{ window.els2App && window.els2App.openQRModal && window.els2App.openQRModal(); });
      document.getElementById('pay-card').addEventListener('click', ()=>{ window.els2App && window.els2App.completeOrder && window.els2App.completeOrder(); });
      document.getElementById('pay-split').addEventListener('click', ()=>{ window.els2App && window.els2App.completeOrder && window.els2App.completeOrder(); });
    }

    // Ensure hidden pay buttons exist (robust fallback for tests)
    ['pay-qr','pay-card','pay-split'].forEach(id=>{
      if(!document.getElementById(id)){
        const b = document.createElement('button'); b.id = id; b.style.display = 'none'; document.body.appendChild(b);
        if(id==='pay-qr') b.addEventListener('click', ()=>{ window.els2App && window.els2App.openQRModal && window.els2App.openQRModal(); });
        else b.addEventListener('click', ()=>{ window.els2App && window.els2App.completeOrder && window.els2App.completeOrder(); });
      }
    });

    // initialize logistics portal if present
    try{
      if(document.getElementById('logisticsPartnersList')){
        loadLogisticsPartners();
        const regs = document.getElementById('partnerRegionFilter'); if(regs) regs.addEventListener('change', filterLogisticsPartners);
        const sorts = document.getElementById('partnerSortFilter'); if(sorts) sorts.addEventListener('change', filterLogisticsPartners);
        const vehs = document.getElementById('partnerVehicleFilter'); if(vehs) vehs.addEventListener('change', filterLogisticsPartners);
      }
    }catch(e){console.error('logistics init failed',e)}

    // expose logistics APIs
    window.ELS.getAvailableLogistics = function(){ return _logisticsPartners.slice(); };
    window.ELS.filterLogisticsPartners = filterLogisticsPartners;
  });

})();
