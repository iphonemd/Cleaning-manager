// employee constructor loaded on html
const employeeManager = new EmployeeManager();
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const phoneNumberInput = document.getElementById("phoneNumber");
const emailInput = document.getElementById("email");
const jobTitleInput = document.getElementById("jobTitle");
const hireDateInput = document.getElementById("hireDate");
const assignedGroupInput = document.getElementById("assignedGroup");
const hourlyRateInput = document.getElementById("hourlyRate");
const employeeIdInput = document.getElementById("employeeId");
const addEmployeeButton = document.getElementById("addEmployeeButton");

// Check for edit ID in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const editId = parseInt(urlParams.get('editId'));

    // set active link for nav bar
    document.addEventListener("DOMContentLoaded", () => {
      let currentPage = window.location.pathname.split("/").pop(); // Get current page filename
      const navLinks = document.querySelectorAll("nav a");
    
      navLinks.forEach(link => {
        if (link.getAttribute("href") === "employee-table.html") {
          currentPage = "employee-table.html"
        }
          if (link.getAttribute("href") === currentPage) {
              link.classList.add("active-link"); // Set active link dynamically
          }
      });
    });


if (editId) {
  editEmployee(editId);
}

phoneNumberInput.addEventListener("input", function (event) {
  let input = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters

  if (input.length > 10) {
    input = input.substring(0, 10);
  }

  let formattedNumber = "";
  if (input.length > 6) {
    formattedNumber = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6)}`;
  } else if (input.length > 3) {
    formattedNumber = `(${input.substring(0, 3)}) ${input.substring(3)}`;
  } else if (input.length > 0) {
    formattedNumber = `(${input}`;
  }

  event.target.value = formattedNumber;
});

addEmployeeButton.addEventListener("click", () => {
  if (validateForm()) {
    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    let phoneNumber = phoneNumberInput.value.replace(/\D/g, ""); // Raw number
    const email = emailInput.value;
    const jobTitle = jobTitleInput.value;
    const hireDate = hireDateInput.value;
    const assignedGroup = assignedGroupInput.value;
    const hourlyRate = parseFloat(hourlyRateInput.value);
    const id = parseInt(employeeIdInput.value) || null;

    // Check for existing employee with the same name
    const existingEmployees = employeeManager.employees.filter(
      (employee) => employee.firstName.toLowerCase() === firstName.toLowerCase() && employee.lastName.toLowerCase() === lastName.toLowerCase()
    );

    if (existingEmployees.length > 0 && !id) {
      if (confirm(`An employee named '${firstName} ${lastName}' already exists. Proceed with adding this employee?`)) {
        addEmployeeToManager(firstName, lastName, phoneNumber, email, jobTitle, hireDate, assignedGroup, hourlyRate, id);
      }
    } else {
      addEmployeeToManager(firstName, lastName, phoneNumber, email, jobTitle, hireDate, assignedGroup, hourlyRate, id);
    }
  }
});

function addEmployeeToManager(firstName, lastName, phoneNumber, email, jobTitle, hireDate, assignedGroup, hourlyRate, id) {
  employeeManager.addEmployee(firstName, lastName, phoneNumber, email, jobTitle, hireDate, assignedGroup, hourlyRate, id);
  clearForm();
  successMessage();
}

function clearForm() {
  firstNameInput.value = "";
  lastNameInput.value = "";
  phoneNumberInput.value = "";
  emailInput.value = "";
  jobTitleInput.value = "Helper";
  hireDateInput.value = "";
  assignedGroupInput.value = "Group-A";
  hourlyRateInput.value = "";
  employeeIdInput.value = "";
}

function editEmployee(id) {
  const employee = employeeManager.getEmployeeById(id);
  if (employee) {
    firstNameInput.value = employee.firstName;
    lastNameInput.value = employee.lastName;
    phoneNumberInput.value = employee.phoneNumber;
    emailInput.value = employee.email;
    jobTitleInput.value = employee.jobTitle;
    hireDateInput.value = employee.hireDate;
    assignedGroupInput.value = employee.assignedGroup;
    hourlyRateInput.value = employee.hourlyRate;
    employeeIdInput.value = employee.id;
  }
}

function validateForm() {
  let isValid = true;
  const firstName = firstNameInput.value;
  const lastName = lastNameInput.value;
  const phoneNumber = phoneNumberInput.value;
  const hireDate = hireDateInput.value;
  const hourlyRate = hourlyRateInput.value;

  resetErrors();

  if (!firstName) {
    displayError("firstName", "First name is required.");
    isValid = false;
  }
  if (!lastName) {
    displayError("lastName", "Last name is required.");
    isValid = false;
  }
  if (!phoneNumber) {
    displayError("phoneNumber", "Phone number is required.");
    isValid = false;
  }
  if (!hireDate) {
    displayError("startDate", "Hire date is required.");
    isValid = false;
  }
  if (!hourlyRate || isNaN(hourlyRate) || parseFloat(hourlyRate) < 0) {
    displayError("hourlyRate", "Hourly rate must be a positive number.");
    isValid = false;
  }

  const phoneRegex = /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  if (!phoneRegex.test(phoneNumber)) {
    displayError("phoneNumber", "Invalid phone number format.");
    isValid = false;
  }

  return isValid;
}

function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add("error");
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function resetErrors() {
  document.querySelectorAll(".error-message").forEach(message => message.remove());
  document.querySelectorAll(".error").forEach(field => field.classList.remove("error"));
}

function successMessage() {
  let message = document.getElementById("successMessage");
  message.classList.remove("hidden");

  setTimeout(() => {
    message.style.opacity = "0";
    setTimeout(() => {
      message.classList.add("hidden");
      message.style.opacity = "1";
    }, 1000);
  }, 3000);
}
