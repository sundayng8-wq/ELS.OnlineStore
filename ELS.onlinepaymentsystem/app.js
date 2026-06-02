// 1. Array with local image paths instead of emojis
const products = [
  { id: 1, name: 'Premium Wireless Headphones', price: 149.99, image: 'images/headphones.jpg' },
  { id: 2, name: 'Smart Watch Pro', price: 299.99, image: 'images/smartwatch.jpg' },
  { id: 3, name: 'Portable SSD 1TB', price: 129.99, image: 'images/ssd.jpg' },
  { id: 4, name: 'Mechanical Keyboard', price: 189.99, image: 'images/keyboard.jpg' },
  { id: 5, name: '4K Webcam', price: 179.99, image: 'images/webcam.jpg' },
  { id: 6, name: 'USB-C Hub Multi-Port', price: 79.99, image: 'images/hub.jpg' }
];

// 2. Target the HTML container
const container = document.getElementById('products-container');

// 3. Loop through the data and generate HTML structure
products.forEach(product => {
  // Create a card container for each product
  const productCard = document.createElement('div');
  productCard.className = 'product-card';

  // Build the inner HTML template including the local <img> tag
  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image" />
    <h3>${product.name}</h3>
    <p>$${product.price.toFixed(2)}</p>
  `;

  // Append the card to the main container
  container.appendChild(productCard);
});