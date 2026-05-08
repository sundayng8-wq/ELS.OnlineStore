function renderOrders() {
  const userOrders = allOrders.filter(o => o.buyer === currentUser.name);
  const container = document.getElementById('orders-list');
  if (!userOrders.length) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">No orders yet. <button onclick="goTo(\'shop\')" class="underline font-semibold" style="color:#e94560;">Start shopping!</button></p>';
    document.getElementById('total-orders').textContent = '0';
    document.getElementById('in-transit-count').textContent = '0';
    document.getElementById('delivered-count').textContent = '0';
    return;
  }
  document.getElementById('total-orders').textContent = userOrders.length;
  const inTransit = userOrders.filter(o => o.order_status === 'In Transit').length;
  const delivered = userOrders.filter(o => o.order_status === 'Delivered').length;
  document.getElementById('in-transit-count').textContent = inTransit;
  document.getElementById('delivered-count').textContent = delivered;
  container.innerHTML = userOrders.map(o => `
    <div class="rounded-xl p-4 border-l-4 transition" style="background:white; border-color: ${o.order_status === 'Delivered' ? '#27ae60' : o.order_status === 'In Transit' ? '#0f3460' : '#e94560'};">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div>
          <p class="font-bold" style="color:#1a1a2e;">${o.order_id}</p>
          <p class="text-xs text-gray-500">${new Date(o.created_at).toLocaleDateString()}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold text-white w-fit" style="background: ${o.order_status === 'Delivered' ? '#27ae60' : o.order_status === 'In Transit' ? '#0f3460' : '#e94560'};">${o.order_status}</span>
      </div>
      <div class="mb-2 text-sm text-gray-600">
        <p>${o.items.map(i => i.name).join(', ')}</p>
        <p class="text-xs text-gray-500 mt-1">Delivery: ${o.delivery_method} | Total: <strong style="color:#e94560;">$${o.total_amount.toFixed(2)}</strong></p>
      </div>
      ${o.tracking_number ? `<p class="text-xs font-mono text-gray-500">Track: ${o.tracking_number}</p>` : '<p class="text-xs text-gray-400">Waiting for logistics assignment...</p>'}
    </div>
  `).join('');
}

function renderLogisticsView() {
  const sellerOrders = allOrders.filter(o => o.items.some(i => i.seller === currentUser.name));
  const pendingOrders = sellerOrders.filter(o => o.order_status === 'Pending Logistics');
  document.getElementById('seller-balance').textContent = '$' + ((Math.random() * 5000).toFixed(2));
  document.getElementById('pending-shipments').textContent = pendingOrders.length;
  document.getElementById('completed-seller-orders').textContent = sellerOrders.filter(o => o.order_status === 'Delivered').length;
  const sellerContainer = document.getElementById('seller-pending-orders');
  if (!pendingOrders.length) {
    sellerContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No pending orders to ship.</p>';
  } else {
    sellerContainer.innerHTML = pendingOrders.map(o => `
      <div class="rounded-lg p-3 border border-gray-200">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="font-bold text-sm" style="color:#1a1a2e;">${o.order_id}</p>
            <p class="text-xs text-gray-500">To: ${o.buyer_name}</p>
          </div>
          <button onclick="requestLogisticsPickup('${o.order_id}')" class="px-3 py-1 rounded text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600">Book Logistics</button>
        </div>
        <p class="text-xs text-gray-600">${o.delivery_method} • $${o.total_amount.toFixed(2)}</p>
      </div>
    `).join('');
  }

  const availableOrders = allOrders.filter(o => o.order_status === 'Pending Logistics');
  const activeDeliveries = allOrders.filter(o => o.order_status === 'In Transit' && o.logistics_provider === currentUser.name);
  document.getElementById('logistics-balance').textContent = '$' + ((Math.random() * 8000).toFixed(2));
  document.getElementById('active-shipments').textContent = activeDeliveries.length;
  document.getElementById('completed-deliveries').textContent = allOrders.filter(o => o.order_status === 'Delivered' && o.logistics_provider === currentUser.name).length;
  const availableContainer = document.getElementById('available-shipments');
  if (!availableOrders.length) {
    availableContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No pending shipments available.</p>';
  } else {
    availableContainer.innerHTML = availableOrders.map(o => `
      <div class="rounded-lg p-3 border border-green-200" style="background:#f0fdf4;">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="font-bold text-sm" style="color:#1a1a2e;">${o.order_id}</p>
            <p class="text-xs text-gray-600">${o.buyer_name} → ${o.delivery_method}</p>
          </div>
          <button onclick="acceptShipment('${o.order_id}')" class="px-3 py-1 rounded text-xs font-semibold text-white bg-green-500 hover:bg-green-600">Accept</button>
        </div>
        <p class="text-xs font-semibold" style="color:#27ae60;">Earnings: $${o.logistics_fee.toFixed(2)}</p>
      </div>
    `).join('');
  }

  const deliveriesContainer = document.getElementById('active-deliveries');
  if (!activeDeliveries.length) {
    deliveriesContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No active deliveries.</p>';
  } else {
    deliveriesContainer.innerHTML = activeDeliveries.map(o => `
      <div class="rounded-lg p-3 border border-blue-200" style="background:#eff6ff;">
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="font-bold text-sm" style="color:#1a1a2e;">${o.order_id} - ${o.tracking_number}</p>
            <p class="text-xs text-gray-600">To: ${o.buyer_name}</p>
          </div>
          <button onclick="completeDelivery('${o.order_id}')" class="px-3 py-1 rounded text-xs font-semibold text-white bg-green-600 hover:bg-green-700">Mark Delivered</button>
        </div>
        <p class="text-xs text-gray-600">${o.delivery_method}</p>
      </div>
    `).join('');
  }
}

function toggleLogisticsRole() {
  isLogisticsProvider = !isLogisticsProvider;
  document.getElementById('seller-logistics-view').classList.toggle('hidden');
  document.getElementById('logistics-provider-view').classList.toggle('hidden');
  document.getElementById('logistics-role-btn').textContent = isLogisticsProvider ? 'Switch to Seller View' : 'Switch to Logistics View';
  renderLogisticsView();
}

function requestLogisticsPickup(orderId) {
  const order = allOrders.find(o => o.order_id === orderId);
  if (order) {
    order.order_status = 'Awaiting Pickup';
    showToast('✓ Logistics pickup requested');
    renderLogisticsView();
  }
}

function acceptShipment(orderId) {
  const order = allOrders.find(o => o.order_id === orderId);
  if (order) {
    order.order_status = 'In Transit';
    order.logistics_provider = currentUser.name;
    order.tracking_number = 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    order.estimated_delivery = new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString();
    showToast(`✓ Shipment accepted! Earned $${order.logistics_fee.toFixed(2)}`);
    renderLogisticsView();
    renderOrders();
    try {
      const convId = `order-${orderId}`;
      let conv = conversations.find(c => c.id === convId);
      if (!conv) {
        conv = { id: convId, title: `Order ${orderId}`, orderId: orderId, participants: [order.buyer_name, currentUser.name], messages: [] };
        conversations.push(conv);
      }
      conv.messages.push({ sender: currentUser.name, text: `I've accepted this shipment and will deliver it. Tracking: ${order.tracking_number}`, time: new Date().toISOString() });
    } catch (e) { console.warn('order chat create failed', e); }
  }
}

function completeDelivery(orderId) {
  const order = allOrders.find(o => o.order_id === orderId);
  if (order) {
    order.order_status = 'Delivered';
    showToast(`✓ Delivery completed! Payment $${order.logistics_fee.toFixed(2)} + Product sales released to seller`);
    renderLogisticsView();
    renderOrders();
  }
}
