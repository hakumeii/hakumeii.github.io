const grid = document.getElementById('productGrid');
const totalValue = document.getElementById('totalValue');
const toggleAllBtn = document.getElementById('toggleAllBtn');

// Create dropdown for event selection
const selectorContainer = document.createElement('div');
selectorContainer.className = 'my-3';
selectorContainer.innerHTML = `
  <label for="eventSelect" class="form-label fw-bold me-2">Select Event:</label>
  <select id="eventSelect" class="form-select d-inline-block w-auto"></select>
`;
document.getElementById('eventstore').prepend(selectorContainer);

const eventSelect = document.getElementById('eventSelect');

let allChecked = false;
let products = [];
let events = [];

// --- Fetch data and initialize ---
Promise.all([
  fetch('items.json').then(res => res.json()),
  fetch('eventitems.json').then(res => res.json())
])
  .then(([productList, eventList]) => {
    products = productList;
    events = eventList.events;

    // Populate event dropdown
    eventSelect.innerHTML = events
      .map(ev => `<option value="${ev.uid}">${ev.title}</option>`)
      .join('');

    // Display the first event by default
    displayEvent(events[0].uid);
  })
  .catch(err => console.error('Error loading data:', err));

// --- Display event items ---
function displayEvent(uid) {
  grid.innerHTML = ''; // Clear previous
  totalValue.textContent = 0; // Reset total
  allChecked = false;

  const event = events.find(e => e.uid === uid);
  if (!event) return;

  event.items.forEach(item => {
    // find product info (for image and proper name)
    const product = products.find(p => p.id === item.id) || {};

    const col = document.createElement('div');
    col.className = 'col-md-2 col-sm-4';

    const displayName = product.name || item.name || 'Unknown';
    const suffix = item.suffix ? ` ${item.suffix}` : '';
    const imageSrc = product.url ? `https://raw.githubusercontent.com/hakumeii/hakumeii.github.io/refs/heads/master/images/${product.url}` : 'img/placeholder.png';

    col.innerHTML = `
      <div class="card h-125s" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;">
          <div class="card-body d-flex flex-column justify-content-between">
              <span class="badge badge-name" style="white-space: pre;">${displayName}${suffix}</span>
              <div class="bottom-row mt-auto">
                  <span class="badge badge-stock">${item.stock}</span>
                  <span class="badge badge-price">${item.price}</span>
                  <div class="form-check text-end mt-1">
                      <input class="form-check-input" type="checkbox" value="${item.stock * item.price}" id="check${item.id}">
                  </div>
              </div>
          </div>
      </div>
    `;

    const card = col.querySelector('.card');
    const checkbox = col.querySelector('.form-check-input');

    // Toggle checkbox when clicking card
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked;
        card.classList.toggle('selected', checkbox.checked);
      }
      updateTotal();
    });

    // Keep highlight in sync
    checkbox.addEventListener('change', () => {
      card.classList.toggle('selected', checkbox.checked);
      updateTotal();
    });

    grid.appendChild(col);
  });
}

// --- Update total ---
function updateTotal() {
  const checkboxes = document.querySelectorAll('.form-check-input:checked');
  let total = 0;
  checkboxes.forEach(cb => total += Number(cb.value));
  totalValue.textContent = total;
}

// --- Check/Uncheck all ---
toggleAllBtn.addEventListener('click', () => {
  allChecked = !allChecked;
  const checkboxes = document.querySelectorAll('.form-check-input');
  checkboxes.forEach(cb => {
    cb.checked = allChecked;
    cb.closest('.card').classList.toggle('selected', allChecked);
  });
  updateTotal();
});

// --- Event select change handler ---
eventSelect.addEventListener('change', (e) => {
  displayEvent(e.target.value);
});
