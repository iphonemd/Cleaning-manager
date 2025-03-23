// client-constructor loads before this, see html
const clientManager = new ClientManager();
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const phoneNumberInput = document.getElementById("phoneNumber");

const streetInput = document.getElementById("street");
const cityStateInput = document.getElementById("cityState");
const zipCodeInput = document.getElementById("zipCode");

const cleaningFrequencyInput = document.getElementById("cleaningFrequency");
const chargeInput = document.getElementById("charge");
const serviceInput = document.getElementById("service");
const cleaningGroupInput = document.getElementById("cleaningGroup");
const zoneInput = document.getElementById("zone");
const startDateInput = document.getElementById("startDate");

const addClientButton = document.getElementById("addClientButton");
const clientIdInput = document.getElementById("clientId");



// Check for edit ID in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const editId = parseInt(urlParams.get('editId'));

if (editId) {
  editClient(editId);
}

phoneNumberInput.addEventListener("input", function (event) {
  let input = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters

  if (input.length > 10) {
      input = input.substring(0, 10); // Ensure max length of 10 digits
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

phoneNumberInput.addEventListener("keyup", () => {
  validateForm();
});
lastNameInput.addEventListener("keyup", () => {
  validateForm();
});
phoneNumberInput.addEventListener("keyup", () => {
  validateForm();
});

streetInput.addEventListener("keyup", () => {
  validateForm();
});
cityStateInput.addEventListener("keyup", () => {
  validateForm();
});
zipCodeInput.addEventListener("keyup", () => {
  validateForm();
});

chargeInput.addEventListener("keyup", () => {
  validateForm();
});
startDateInput.addEventListener("keyup", () => {
  validateForm();
});
startDateInput.addEventListener("click", () => {
  validateForm();
});

addClientButton.addEventListener("click", () => {
  if (validateForm()) {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    let phoneNumber = phoneNumberInput.value.replace(/\D/g, "");//get raw number
    const street = document.getElementById("street").value;
    const cityState = document.getElementById("cityState").value;
    const zipCode = document.getElementById("zipCode").value;
    const cleaningFrequency = cleaningFrequencyInput.value;
    const charge = parseFloat(document.getElementById("charge").value);
    const service = document.getElementById("service").value;
    const cleaningGroup = cleaningGroupInput.value;
    const zone = zoneInput.value;
    const startDate = startDateInput.value;
    const id = parseInt(clientIdInput.value) || null;

    // Check for existing client with the same name
    const existingClients = clientManager.clients.filter(
      (client) => client.firstName.toLowerCase() === firstName.toLowerCase() && client.lastName.toLowerCase() === lastName.toLowerCase()
    );

    if (existingClients.length > 0 && !id) {
      if (confirm(`Client with the name '${firstName} ${lastName}' already exists. Proceed with adding the client again?`)) {
        addClientToManager(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id);
      }
    } else {
      addClientToManager(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id);
    }
  }
});

function addClientToManager(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id) {
  clientManager.addClient(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id);
  clearForm();

  successMessage()
  // The line below redirects to a page if needed
  //window.location.href = 'client-information.html';
}

function clearForm() {
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phoneNumber").value = "";
  document.getElementById("street").value = "";
  document.getElementById("cityState").value = "";
  document.getElementById("zipCode").value = "";
  cleaningFrequencyInput.value = "once"; // Reset to default
  document.getElementById("charge").value = "";
  document.getElementById("service").value = "";
  document.getElementById("cleaningGroup").value = "";
  document.getElementById("zone").value = "";
  startDateInput.value = "";
  clientIdInput.value = "";
}

function editClient(id) {
  const client = clientManager.getClientById(id);
  if (client) {
    document.getElementById("firstName").value = client.firstName;
    document.getElementById("lastName").value = client.lastName;
    document.getElementById("phoneNumber").value = client.phoneNumber;
    document.getElementById("street").value = client.street;
    document.getElementById("cityState").value = client.cityState;
    document.getElementById("zipCode").value = client.zipCode;
    cleaningFrequencyInput.value = client.cleaningFrequency; // Set the selected cleaning frequency
    document.getElementById("charge").value = client.charge;
    document.getElementById("service").value = client.service;
    document.getElementById("cleaningGroup").value = client.cleaningGroup;
    document.getElementById("zone").value = client.zone;
    startDateInput.value = client.startDate;
    clientIdInput.value = client.id;
  }
}

function validateForm() {
  let isValid = true;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const street = document.getElementById("street").value;
  const cityState = document.getElementById("cityState").value;
  const zipCode = document.getElementById("zipCode").value;
  const charge = document.getElementById("charge").value;
  const startDate = document.getElementById("startDate").value;

  // Reset error messages
  resetErrors();

  // Required fields validation
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
  if (!street) {
    displayError("street", "Street is required.");
    isValid = false;
  }
  if (!cityState) {
    displayError("cityState", "City/State is required.");
    isValid = false;
  }
  if (!zipCode) {
    displayError("zipCode", "Zip code is required.");
    isValid = false;
  }
  if (!charge) {
    displayError("charge", "Charge is required.");
    isValid = false;
  }
  if (!startDate) {
    displayError("startDate", "Start date is required.");
    isValid = false;
  }

  // Data type and format validation
  if (isNaN(zipCode) || zipCode.length !== 5) {
    displayError("zipCode", "Zip code must be a 5-digit number.");
    isValid = false;
  }
  if (isNaN(charge) || parseFloat(charge) < 0) {
    displayError("charge", "Charge must be a positive number.");
    isValid = false;
  }

  const phoneRegex = /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  if (!phoneRegex.test(phoneNumber)) {
    displayError("phoneNumber", "Invalid phone number format.");
    isValid = false;
  }

  // Date format validation
  /*if (!isValidDate(startDate)) {
    displayError("startDate", "Invalid date format (YYYY-MM-DD).");
    isValid = false;
  } */

  return isValid;
}

/*function isValidDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    return false;
  }

  return date.toISOString().startsWith(dateString);
} */

function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add("error");
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function resetErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(message => message.remove());
  const errorFields = document.querySelectorAll(".error");
  errorFields.forEach(field => field.classList.remove("error"));
}

function successMessage() {
  let message = document.getElementById("successMessage");
  message.classList.remove("hidden");

  // Fade out in 3 seconds
  setTimeout(() => {
    message.style.opacity = "0";

      // Hide element after fade out
      setTimeout(() => {
        message.classList.add(
          "hidden");
          message.style.opacity = "1";
      }, 1000);
  }, 3000);
}