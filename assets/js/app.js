let booksData = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
  setupEventListeners();
  updateCartUI();
});

async function fetchBooks() {
  try {
    const res = await fetch('_data/books.json');
    booksData = await res.json();
    renderBooks(booksData);
  } catch (err) {
    console.error('Error loading books data:', err);
  }
}

function renderBooks(books) {
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${book.image}" alt="${book.title}">
      <div class="book-info">
        <span class="category-badge">${book.category}</span>
        <h3>${book.title}</h3>
        <p class="author">by ${book.author}</p>
        <div class="rating">★ ${book.rating}</div>
        <div class="card-footer">
          <span class="price">$${book.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${book.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const cartBtn = document.getElementById('cartBtn');
  const closeModal = document.querySelector('.close-modal');
  const cartModal = document.getElementById('cartModal');

  searchInput.addEventListener('input', filterBooks);
  categoryFilter.addEventListener('change', filterBooks);

  cartBtn.addEventListener('click', () => { cartModal.style.display = 'flex'; });
  closeModal.addEventListener('click', () => { cartModal.style.display = 'none'; });
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
  });
}

function filterBooks() {
  const searchVal = document.getElementById('searchInput').value.toLowerCase();
  const categoryVal = document.getElementById('categoryFilter').value;

  const filtered = booksData.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchVal) ||
                          book.author.toLowerCase().includes(searchVal);
    const matchesCategory = categoryVal === 'all' || book.category === categoryVal;
    return matchesSearch && matchesCategory;
  });

  renderBooks(filtered);
}

function addToCart(id) {
  const book = booksData.find(b => b.id === id);
  if (!book) return;

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...book, qty: 1 });
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  cartCount.textContent = totalQty;
  cartTotal.textContent = totalPrice.toFixed(2);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <strong>${item.title}</strong> (${item.qty})
          <div><small>$${(item.price * item.qty).toFixed(2)}</small></div>
        </div>
        <button class="add-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `).join('');
  }
}

function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  alert('Thank you for your order!');
  cart = [];
  saveCart();
  updateCartUI();
  document.getElementById('cartModal').style.display = 'none';
}