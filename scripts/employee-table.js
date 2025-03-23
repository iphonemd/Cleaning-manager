// employee constructor loaded on the html
const employeeManager = new EmployeeManager();

const addEmployeeButton = document.getElementById("addEmployeeButton");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const phoneNumberInput = document.getElementById("phoneNumber");
const emailInput = document.getElementById("email");
const hourlyRateInput = document.getElementById("hourlyRate");
const jobTitleInput = document.getElementById("jobTitle");
const employeeNumberInput = document.getElementById("employeeNumber");
const hireDateInput = document.getElementById("hireDate");
const assignedGroupInput = document.getElementById("assignedGroup");

const employeeTableBody = document.querySelector("#employeeTable tbody");

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
}

function populateTable(employees) {
  employeeTableBody.innerHTML = "";

  employees.forEach(employee => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${employee.employeeNumber}</td>
      <td>${employee.firstName}</td>
      <td>${employee.lastName}</td>
      <td>${formatPhoneNumber(employee.phoneNumber)}</td>
      <td>${employee.email}</td>
      <td>${employee.hourlyRate}</td>
      <td>${employee.jobTitle}</td>
      <td>${employee.hireDate}</td>
      <td>${employee.assignedGroup}</td>
      <td>
        <div class="table-buttons-div">
          <button id="editEmployee-${employee.id}" class="edit-button">Edit</button>
          <button id="deleteEmployee-${employee.id}" class="delete-button">Delete</button>
        </div>
      </td>
    `;
    employeeTableBody.appendChild(row);
  });

  addEventListeners();
}

// Event listeners for table buttons
function addEventListeners() {
  document.querySelectorAll('[id^="editEmployee-"]').forEach(button => {
    button.addEventListener("click", () => {
      const employeeId = button.id.split('-')[1];
      window.location.href = `add-employee-form.html?editId=${employeeId}`;
    });
  });

  document.querySelectorAll('[id^="deleteEmployee-"]').forEach(button => {
    button.addEventListener("click", () => {
      const employeeId = parseInt(button.id.split('-')[1], 10);
      employeeManager.deleteEmployee(employeeId);
      populateTable(employeeManager.employees);
    });
  });
}

// Event listeners for search inputs
firstNameInput.addEventListener("keyup", () => {
  const firstName = firstNameInput.value;
  populateTable(employeeManager.findEmployeesByFirstName(firstName));
});

lastNameInput.addEventListener("keyup", () => {
  const lastName = lastNameInput.value;
  populateTable(employeeManager.findEmployeesByLastName(lastName));
});

employeeNumberInput.addEventListener("keyup", () => {
  const employeeNumber = employeeNumberInput.value;
  populateTable(employeeManager.findEmployeesByEmployeeNumber(employeeNumber));
});

jobTitleInput.addEventListener("keyup", () => {
  const jobTitle = jobTitleInput.value;
  populateTable(employeeManager.findEmployeesByJobTitle(jobTitle));
});

phoneNumberInput.addEventListener("keyup", () => {
  const phoneNumber = phoneNumberInput.value;
  populateTable(employeeManager.findEmployeesByPhoneNumber(phoneNumber));
});

addEmployeeButton.addEventListener("click", () => window.location.href = "add-employee-form.html");

populateTable(employeeManager.employees);
