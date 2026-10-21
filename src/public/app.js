const form = document.getElementById('item-form');
const idInput = document.getElementById('item-id');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const quantityInput = document.getElementById('quantity');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const errorEl = document.getElementById('error');
const tbody = document.getElementById('items');

async function loadItems() {
  const res = await fetch('/api/items');
  const items = await res.json();
  tbody.innerHTML = '';
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No products yet.</td></tr>';
    return;
  }
  for (const item of items) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.id}</td>
      <td></td>
      <td>${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td><button class="edit">Edit</button></td>`;
    row.children[1].textContent = item.name;
    row.querySelector('.edit').addEventListener('click', () => startEdit(item));
    tbody.appendChild(row);
  }
}

function startEdit(item) {
  idInput.value = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  quantityInput.value = item.quantity;
  formTitle.textContent = `Edit Product #${item.id}`;
  submitBtn.textContent = 'Update';
  cancelBtn.hidden = false;
  errorEl.textContent = '';
}

function resetForm() {
  form.reset();
  idInput.value = '';
  formTitle.textContent = 'Add Product';
  submitBtn.textContent = 'Add';
  cancelBtn.hidden = true;
  errorEl.textContent = '';
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const id = idInput.value;
  const res = await fetch(id ? `/api/items/${id}` : '/api/items', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameInput.value,
      price: Number(priceInput.value),
      quantity: Number(quantityInput.value),
    }),
  });
  if (!res.ok) {
    errorEl.textContent = (await res.json()).error;
    return;
  }
  resetForm();
  loadItems();
});

cancelBtn.addEventListener('click', resetForm);

loadItems();
