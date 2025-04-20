const form = document.getElementById('itemForm');
const input = document.getElementById('nameInput');
const list = document.getElementById('itemList');

async function loadItems() {
  const res = await fetch('/api/items');
  const items = await res.json();
  list.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = item.name + ' ';
    
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.onclick = () => {
      const newName = prompt('Edit item:', item.name);
      if (newName) updateItem(item.id, newName);
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.onclick = () => deleteItem(item.id);

    li.appendChild(text);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

async function addItem(name) {
  await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  input.value = '';
  loadItems();
}

async function updateItem(id, name) {
  await fetch(`/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  loadItems();
}

async function deleteItem(id) {
  await fetch(`/api/items/${id}`, { method: 'DELETE' });
  loadItems();
}

form.onsubmit = e => {
  e.preventDefault();
  if (input.value.trim()) {
    addItem(input.value.trim());
  }
};

loadItems();
