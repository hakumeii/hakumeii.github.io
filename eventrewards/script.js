const grid = document.getElementById('productGrid');
const totalValue = document.getElementById('totalValue');
const toggleAllBtn = document.getElementById('toggleAllBtn');
const baseUrl = "https://raw.githubusercontent.com/hakumeii/hakumeii.github.io/refs/heads/master/images/";

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

// --- Display selected event ---
function displayEvent(uid) {
  grid.innerHTML = ''; // Clear product grid
  totalValue.textContent = 0; // Reset total
  allChecked = false;

  const rewardsDiv = document.getElementById('rewards');
  const farmDiv = document.getElementById('farmable');
  const sanDiv = document.getElementById('sanitymath');
  rewardsDiv.innerHTML = '';
  farmDiv.innerHTML = '';
  sanDiv.innerHTML = '';

  const event = events.find(e => e.uid === uid);
  if (!event) return;

  // Display rewards and farm sections if available
  displayRewards(event);
  displayFarm(event);
  displaySan(event);
  updateSanityTotal();
  updateRemainingCurrency();
  // --- Display event items ---
  event.items.forEach(item => {
    const product = products.find(p => p.id === item.id) || {};

    const col = document.createElement('div');
    col.className = 'col-md-2 col-sm-4 col-6 mb-3';

    const displayName = product.name || item.name || 'Unknown';
    const suffix = item.suffix ? ` ${item.suffix}` : '';
    const imageSrc = product.url
      ? `${baseUrl}${product.url}`
      : (item.url ? `${baseUrl}${item.url}` : 'img/placeholder.png');

    col.innerHTML = `
      <div class="card h-130" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;">
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

// --- Display rewards section ---
function displayRewards(event) {
  const rewardsDiv = document.getElementById('rewards');
  if (!event.rewards || event.rewards.length === 0) return;

  const header = document.createElement('h5');
  header.className = 'fw-bold my-2';
  header.textContent = 'Event Rewards';
  rewardsDiv.appendChild(header);

  const row = document.createElement('div');
  row.className = 'row';

  event.rewards.forEach(rw => {
    const product = products.find(p => p.id === rw.id) || {};
    const imageSrc = product.url
      ? `${baseUrl}${product.url}`
      : (rw.url ? `${baseUrl}${rw.url}` : 'img/placeholder.png');

    const name = rw.name || product.name || 'Unknown';
    const total = rw.total ? `${rw.total}` : '';

    row.innerHTML += `
      <div class="col-md-2 col-sm-4 col-6 mb-3">
        <div class="card h-130" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;">
          <div class="card-body d-flex flex-column justify-content-between">
            <span class="badge badge-name" style="white-space: pre;">${name}</span>
            <span class="badge badge-stock">${total}</span>
          </div>
        </div>
      </div>
    `;
  });

  rewardsDiv.appendChild(row);
}

// --- Display farmable section ---
function displayFarm(event) {
  const farmDiv = document.getElementById('farmable');
  if (!event.farm || event.farm.length === 0) return;

  const header = document.createElement('h5');
  header.className = 'fw-bold my-2';
  header.textContent = 'Farmable Materials';
  farmDiv.appendChild(header);

  const row = document.createElement('div');
  row.className = 'row';

  event.farm.forEach(fm => {
    const product = products.find(p => p.id === fm.id) || {};
    const imageSrc = product.url
      ? `${baseUrl}${product.url}`
      : 'img/placeholder.png';

    row.innerHTML += `
      <div class="col-md-2 col-sm-4 col-6 mb-3">
        <div class="card h-130" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;">
          <div class="card-body d-flex flex-column justify-content-between">
            <span class="badge badge-name" style="white-space: pre; visibility:hidden" >${product.name}</span>
            <div class="badge badge-stock">${fm.stage}</div>
          </div>
        </div>
      </div>
    `;
  });

  farmDiv.appendChild(row);
}

// --- Display sanity section with checkboxes ---
function displaySan(event) {
  const sanDiv = document.getElementById('sanitymath');
  if (!event.san || event.san.length === 0) return;

  const header = document.createElement('h5');
  header.className = 'fw-bold my-2';
  header.textContent = 'Currency Available';
  sanDiv.appendChild(header);

  const row = document.createElement('div');
  row.className = 'row';

  event.san.forEach(s => {
    const product = products.find(p => p.id === s.id) || {};
    const imageSrc = product.url
      ? `${baseUrl}${product.url}`
      : 'img/placeholder.png';

    const checkboxId = `checkSan${s.id}`;

    // Create a new card for each sanity item with a bottom row for value and checkbox
    const col = document.createElement('div');
    col.className = 'col-md-2 col-sm-4 col-6 mb-3';

    col.innerHTML = `
      <div class="card h-130" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;">
        <div class="card-body d-flex flex-column justify-content-between">
          <span class="badge badge-name" style="white-space: pre;">${s.not}</span>
          <div class="bottom-row mt-auto d-flex justify-content-between">
            <div class="badge badge-stock">${s.value}</div>
            <div class="form-check text-end mt-1">
              <input class="form-check-input" type="checkbox" value="${s.value}" id="${checkboxId}" checked/>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add the card to the row
    row.appendChild(col);

    const checkbox = col.querySelector(`#${checkboxId}`);
    checkbox.checked = true;
    const card = col.querySelector('.card');

    // Toggle checkbox when clicking the card (like product grid)
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked;
        card.classList.toggle('selected', checkbox.checked);
      }
      updateSanityTotal();  // Update sanity total when a checkbox is toggled
    });

    // Update sanity total when checkbox changes
    checkbox.addEventListener('change', () => {
      card.classList.toggle('selected', checkbox.checked);
      updateSanityTotal();
    });
  });

  // Append the row of cards to the sanity section
  sanDiv.appendChild(row);
}

// --- Update total for event items ---
function updateTotal() {
  const checkboxes = document.querySelectorAll('#productGrid .form-check-input:checked');
  let totalItems = 0;

  checkboxes.forEach(cb => totalItems += Number(cb.value));
  totalValue.textContent = totalItems;

  // Recalculate the remaining or shortage currency
  updateRemainingCurrency();
}

// --- Update total for sanity items ---
function updateSanityTotal() {
  const checkboxes = document.querySelectorAll('#sanitymath .form-check-input:checked');
  let totalSanity = 0;

  checkboxes.forEach(cb => {
    totalSanity += Number(cb.value);
  });

  const totalSanityElement = document.getElementById('totalSanity');
  totalSanityElement.textContent = totalSanity;

  updateRemainingCurrency();
}

// --- Calculate and update remaining or shortage currency ---
function updateRemainingCurrency() {
  const totalSanity = Number(document.getElementById('totalSanity').textContent);
  const totalItems = Number(document.getElementById('totalValue').textContent);

  const resultElement = document.getElementById('currencyResult');
  const difference = totalSanity - totalItems;

  const labelElement = document.getElementById('currencyLabel');

  if (difference >= 0) {
    resultElement.textContent = `${difference}`;
    labelElement.textContent = "Remaining Currency:";
    resultElement.style.color = 'green';
  } else {
    resultElement.textContent = `${Math.abs(difference)}`;
    labelElement.textContent = "Shortage Currency:";
    resultElement.style.color = 'red';
  }
}

// --- Check/Uncheck all ---
toggleAllBtn.addEventListener('click', () => {
  allChecked = !allChecked;
  const checkboxes = document.querySelectorAll('#productGrid .form-check-input');
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
