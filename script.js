
// Data produk simulasi
const PRODUCTS = [
  { id: 'ML-001', name: 'Mythic 120⭐ | 40 Skin | 65% Hero', price: 1499000, img: 'assets/akun1.png' },
  { id: 'ML-002', name: 'Mythic 80⭐ | 25 Skin | 50% Hero', price: 999000, img: 'assets/akun2.png' },
  { id: 'ML-003', name: 'Legend V | 18 Skin | 45% Hero', price: 749000, img: 'assets/akun3.png' },
  { id: 'ML-004', name: 'Epic II | 12 Skin | 30% Hero', price: 499000, img: 'assets/akun4.png' },
  { id: 'ML-005', name: 'Collector Skin Set | Mythic', price: 1999000, img: 'assets/akun5.png' },
  { id: 'ML-006', name: 'Murmer Starter | Rank GM', price: 249000, img: 'assets/akun6.png' },
];

function idr(n) { return n.toLocaleString('id-ID'); }

// Render produk ke grid
function renderProducts(elId) {
  const wrap = document.getElementById(elId);
  wrap.innerHTML = PRODUCTS.map(p => `
    <article class="product">
      <div class="imgwrap">
        <img src="${p.img}" alt="${p.name}">
        <button class="buy-btn" onclick="goBuy('${p.id}')">Beli / Pesan</button>
      </div>
      <div class="info">
        <div style="font-weight:700">${p.name}</div>
        <div class="meta">
          <span class="price">Rp ${idr(p.price)}</span>
          <span class="badge">ID: ${p.id}</span>
        </div>
      </div>
    </article>
  `).join('');
}

// Klik beli -> ke halaman transaksi dengan query
function goBuy(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const url = new URL('transaksi.html', window.location.href);
  url.searchParams.set('id', p.id);
  url.searchParams.set('name', p.name);
  url.searchParams.set('price', p.price);
  window.location.href = url.toString();
}

// Prefill form transaksi dari query
function prefillTransactionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') || '';
  const price = params.get('price') || '';
  document.getElementById('produk').value = name;
  document.getElementById('harga').value = price;
}

// Buat order
function createOrderAndGoToInvoice(fd) {
  const data = Object.fromEntries(fd.entries());
  if (!data.tos) { alert('Setujui S&K terlebih dahulu.'); return; }

  // Kupon
  let discount = 0;
  if ((data.kupon || '').toUpperCase() === 'Z2NHEMAT') { discount = 50000; }

  const order = {
    id: 'Z2N-' + Date.now(),
    date: new Date().toISOString(),
    customer: { name: data.nama, email: data.email, wa: data.wa },
    product: { name: data.produk, price: Number(data.harga || 0) },
    warranty: data.garansi || 'Garansi Login 7 Hari',
    method: data.metode,
    notes: data.catatan || '',
    discount: discount,
    total: Math.max(0, Number(data.harga || 0) - discount)
  };
  localStorage.setItem('z2n_order', JSON.stringify(order));
  window.location.href = 'invoice.html';
}

// Render invoice dari localStorage
function renderInvoice() {
  const json = localStorage.getItem('z2n_order');
  if (!json) {
    document.getElementById('invoice').innerHTML = '<p>Tidak ada data invoice. Silakan lakukan transaksi terlebih dahulu.</p>';
    return;
  }
  const o = JSON.parse(json);
  document.getElementById('inv-id').textContent = '#' + o.id;
  document.getElementById('cust-name').textContent = o.customer.name;
  document.getElementById('cust-email').textContent = o.customer.email;
  document.getElementById('cust-wa').textContent = o.customer.wa;
  document.getElementById('inv-items').innerHTML = `
    <tr>
      <td>${o.product.name}</td>
      <td>${o.warranty}</td>
      <td>Rp ${idr(o.product.price)}</td>
    </tr>
  `;
  document.getElementById('inv-subtotal').textContent = 'Rp ' + idr(o.product.price);
  document.getElementById('inv-discount').textContent = 'Rp ' + idr(o.discount);
  document.getElementById('inv-total').textContent = 'Rp ' + idr(o.total);
  const d = new Date(o.date);
  document.getElementById('inv-date').textContent = d.toLocaleString('id-ID');
  document.getElementById('inv-method').textContent = o.method;
  document.getElementById('inv-notes').textContent = o.notes || '-';

  const waLink = `https://wa.me/6281318483706?text=${encodeURIComponent(
    `Halo Z2N.ID, ini bukti pesanan saya%0A%0AInvoice: ${o.id}%0ANama: ${o.customer.name}%0AProduk: ${o.product.name}%0ATotal: Rp ${idr(o.total)}`
  )}`;
  document.getElementById('inv-wa').href = waLink;
}
