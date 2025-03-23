// rendom expenses generator

// Function to generate random expenses for testing
function generateRandomExpenses(count = 50) {
  // Arrays of sample data
  const categories = ["Supplies", "Cleaning Products", "Equipment", "Marketing", "Office", "Transportation", "Insurance", "Utilities", "Maintenance", "Training", "Uniforms", "Miscellaneous"];
  
  const descriptions = [
    "Monthly supplies", "Cleaning chemicals", "New vacuum cleaner", "Business cards", 
    "Office rent", "Fuel for company vehicle", "Liability insurance", "Electricity bill", 
    "Equipment repair", "Staff training session", "Employee uniforms", "Advertising costs", 
    "Client gifts", "Software subscription", "Phone service", "Vehicle maintenance", 
    "Cleaning tools", "Paper products", "Safety equipment", "Professional services",
    "Website hosting", "Accounting software", "Disinfectants", "Microfiber cloths",
    "Floor polisher rental", "Window cleaning tools", "Garbage bags", "Rubber gloves"
  ];
  
  // Get existing expenses or create empty array
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const originalCount = expenses.length;
  
  // Function to get a random date within the past 6 months
  const getRandomDate = () => {
    const today = new Date();
    const pastDate = new Date(today);
    // Random date between today and 6 months ago
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 180));
    return pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }
  
  // Generate random expenses
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Generate random amount between $5 and $500
    const amount = (Math.random() * 495 + 5).toFixed(2);
    
    // Generate random date
    const date = getRandomDate();
    const dateObj = new Date(date);
    
    // Create expense object matching your format
    const newExpense = {
      category: category,
      description: description,
      amount: amount,
      date: date,
      weekNumber: getWeekNumber(dateObj)
    };
    
    // Add to expenses array
    expenses.push(newExpense);
  }
  
  // Save to localStorage
  localStorage.setItem("expenses", JSON.stringify(expenses));
  
  console.log(`✅ Successfully generated ${count} random expenses (total: ${expenses.length}, added: ${expenses.length - originalCount})`);
  
  // Return the expenses if needed
  return expenses;
}

// Helper function to get today's date as YYYY-MM-DD string
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// To use this function, simply call:
// generateRandomExpenses(); // Generates 50 random expenses by default
// or specify a different number:
// generateRandomExpenses(100); // Generates 100 random expenses


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense-form");
  const categoryInput = document.getElementById("category");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  dateInput.value = getTodayDateString();
  const expenseList = document.getElementById("expense-list");
  const submitButton = form.querySelector("button");

  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let editIndex = null;

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function renderExpenses(filteredExpenses = expenses) {
    expenseList.innerHTML = "";
    filteredExpenses.forEach((expense, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>$${expense.amount}</td>
                <td>${expense.date}</td>
                <td>
                    <button onclick="editExpense(${index})">Edit</button>
                    <button onclick="deleteExpense(${index})">Delete</button>
                </td>
            `;
      expenseList.appendChild(row);
    });
  }

  window.deleteExpense = (index) => {
    expenses.splice(index, 1);
    saveExpenses();
    renderExpenses(filterExpenses());
  };

  window.editExpense = (index) => {
    const expense = expenses[index];
    categoryInput.value = expense.category;
    descriptionInput.value = expense.description;
    amountInput.value = expense.amount;
    dateInput.value = expense.date;

    editIndex = index;
    submitButton.textContent = "Update Expense";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dateObj = new Date(dateInput.value);
    const newExpense = {
      category: categoryInput.value,
      description: descriptionInput.value,
      amount: parseFloat(amountInput.value).toFixed(2),
      date: dateInput.value,
      weekNumber: getWeekNumber(dateObj),
    };

    if (editIndex !== null) {
      expenses[editIndex] = newExpense;
      editIndex = null;
      submitButton.textContent = "Add Expense";
    } else {
      expenses.push(newExpense);
    }

    saveExpenses();
    renderExpenses(filterExpenses());
    form.reset();
  });

  function populateMonthYear() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    months.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = month;
      if (index === currentMonth) {
        option.selected = true;
      }
      monthSelect.appendChild(option);
    });

    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === currentYear) {
        option.selected = true;
      }
      yearSelect.appendChild(option);
    }
  }

  function filterExpenses() {
    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === selectedMonth &&
        expenseDate.getFullYear() === selectedYear
      );
    });
  }

  monthSelect.addEventListener("change", () => {
    renderExpenses(filterExpenses());
  });

  yearSelect.addEventListener("change", () => {
    renderExpenses(filterExpenses());
  });

  populateMonthYear();
  renderExpenses(filterExpenses());
});
