// Mock Data (Load from Local Storage if available)
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let currentCustomerNumber = customers.length > 0 ? Math.max(...customers.map(c => c.customerNumber)) + 1 : 1;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const managerDashboard = document.getElementById('manager-dashboard');
const loginForm = document.getElementById('login-form');
const addCustomerBtn = document.getElementById('add-customer-btn');
const customerModal = document.getElementById('customer-modal');
const closeModal = document.querySelector('.close');
const customerForm = document.getElementById('customer-form');
const todayList = document.getElementById('today-list');
const calendarElement = document.getElementById('calendar');

// Login Logic
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Mock Authentication
  if (username === 'manager' && password === 'password') {
    loginScreen.classList.add('hidden');
    managerDashboard.classList.remove('hidden');
    loadDashboard();
  } else {
    alert('Invalid credentials');
  }
});

// Load Dashboard
function loadDashboard() {
  updateTodayList();
  renderCalendar();
}

// Add Customer Modal
addCustomerBtn.addEventListener('click', () => {
  customerModal.classList.remove('hidden');
  document.getElementById('customer-number').value = currentCustomerNumber;
});

// Close Modal
closeModal.addEventListener('click', () => {
  closeCustomerModal();
});

// Close Modal when clicking outside the modal content
customerModal.addEventListener('click', (e) => {
  if (e.target === customerModal) {
    closeCustomerModal();
  }
});

// Function to close the modal
function closeCustomerModal() {
  customerModal.classList.add('hidden');
  customerForm.reset();
}

// Save Customer
customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const customer = {
    firstName: document.getElementById('first-name').value,
    lastName: document.getElementById('last-name').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    customerNumber: currentCustomerNumber++,
    frequency: document.getElementById('frequency').value,
    startDate: document.getElementById('start-date').value,
  };
  customers.push(customer);
  localStorage.setItem('customers', JSON.stringify(customers));
  closeCustomerModal(); // Close the modal after saving
  updateTodayList();
  renderCalendar();
});

// Update Today's Cleaning List
function updateTodayList() {
  todayList.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  customers.forEach(customer => {
    if (customer.startDate === today) {
      const li = document.createElement('li');
      li.textContent = `${customer.firstName} ${customer.lastName} - ${customer.address}`;
      todayList.appendChild(li);
    }
  });
}

// Render Calendar
function renderCalendar() {
  calendarElement.innerHTML = '<h3>Calendar View</h3>';
  // Add calendar rendering logic here (e.g., using a library like FullCalendar)
}

// Render Customers Table (for customers.html)
if (window.location.pathname.endsWith('customers.html')) {
  const customersTable = document.getElementById('customers-table').getElementsByTagName('tbody')[0];
  customers.forEach(customer => {
    const row = customersTable.insertRow();
    row.innerHTML = `
      <td>${customer.customerNumber}</td>
      <td>${customer.firstName}</td>
      <td>${customer.lastName}</td>
      <td>${customer.phone}</td>
      <td>${customer.address}</td>
      <td>${customer.frequency}</td>
      <td>${customer.startDate}</td>
    `;
  });
}