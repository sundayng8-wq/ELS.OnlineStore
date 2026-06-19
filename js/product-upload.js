// Product creation UI logic
const inputFiles = document.getElementById('prod-image');
const uploadStatus = document.getElementById('upload-status');
let uploadedUrls = [];

inputFiles?.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  uploadStatus.textContent = 'Uploading images...';
  uploadedUrls = [];
  for (const f of files) {
    try {
      const dataUrl = await fileToDataUrl(f);
      const url = await uploadImageToCloud(dataUrl, Date.now().toString());
      if (url) uploadedUrls.push(url);
    } catch (err) {
      console.error('Upload failed', err);
    }
  }
  uploadStatus.textContent = uploadedUrls.length ? `Uploaded ${uploadedUrls.length} images` : 'No images uploaded';
});

document.getElementById('create-product')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const name = (document.getElementById('product-name')?.value || '').trim();
  const price = Number(document.getElementById('product-price')?.value || 0);
  const category = (document.getElementById('product-category')?.value || '').trim();
  const desc = (document.getElementById('product-desc')?.value || '').trim();
  const result = document.getElementById('result');
  result.textContent = '';
  if (!name || !price) return result.textContent = 'Name and price required';

  // Prepare product object
  const body = { name, price, category, description: desc, images: uploadedUrls, public: true };

  try {
    const token = localStorage.getItem('els_token') || '';
    const res = await fetch((window.API_URL || 'http://localhost:8001') + '/api/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (res.ok) {
      result.textContent = 'Product created successfully';
      document.getElementById('product-form').reset();
      uploadStatus.textContent = '';
      uploadedUrls = [];
      return;
    }
    result.textContent = json && json.error ? json.error : 'Failed to create product';
  } catch (err) {
    console.error(err);
    result.textContent = 'Server error during product creation';
  }
});

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
