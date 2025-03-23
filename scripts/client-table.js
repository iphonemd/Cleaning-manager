const clientManager = new ClientManager();

const addClientButton = document.getElementById("addClientButton");

const searchFirstNameInput = document.getElementById("firstName");
const searchLastNameInput = document.getElementById("lastName");
const searchZoneInput = document.getElementById("zone");
const searchGroupInput = document.getElementById("group");
const searchPhoneNumberInput = document.getElementById("phoneNumber");

const clientTableBody = document.querySelector("#clientTable tbody");

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
}

function populateTable(clients) {
  clientTableBody.innerHTML = "";

  clients.forEach(client => {
    const row = document.createElement("tr");

    console.log(typeof(client.id));


    row.innerHTML = `
      <td>${client.clientNumber}</td>
      <td>${client.firstName}</td>
      <td>${client.lastName}</td>
      <td>${formatPhoneNumber(client.phoneNumber)}</td>
      <td>${client.street}</td>
      <td>${client.cityState}</td>
      <td>${client.zipCode}</td>
      <td>${client.service}</td>
      <td>${client.charge}</td>
      <td>${client.cleaningFrequency}</td>
      <td>${client.startDate}</td>
      <td>${client.cleaningGroup}</td>
      <td>${client.zone}</td>
      <td><div class="table-buttons-div">
        <button id="editClient-${client.id}" class="edit-button">Edit</button>
        <button id="deleteClient-${client.id}" class="delete-button">Delete</button>
        </div>
      </td>
    `;
    clientTableBody.appendChild(row);
  });

  addEventListeners();
}

//Event listeners for table buttons
function addEventListeners() {
  const editButtons = document.querySelectorAll('[id^="editClient-"]');
  editButtons.forEach(button => {
    button.addEventListener("click", () => {
      const clientId = button.id.split('-')[1];
      window.location.href = `add-client-form.html?editId=${clientId}`;
    });
  });

  const deleteButtons = document.querySelectorAll('[id^="deleteClient-"]');
  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const clientId = parseInt(button.id.split('-')[1], 10);
      clientManager.deleteClient(clientId);
      populateTable(clientManager.clients);

     console.log(typeof(clientId));

    });
  });
}

// Event listeners for search params
searchFirstNameInput.addEventListener("keyup", () => {
  const firstName = document.getElementById("firstName").value;
  const foundClients = clientManager.findClientsByFirstName(firstName);
  populateTable(foundClients);
});

searchLastNameInput.addEventListener("keyup", () => {
  const lastName = document.getElementById("lastName").value;
  const foundClients = clientManager.findClientsByLastName(lastName);
  populateTable(foundClients);
});

searchGroupInput.addEventListener("keyup", () => {
  const group = document.getElementById("group").value;
  const foundClients = clientManager.findClientsByCleaningGroup(group);
  populateTable(foundClients);
});

searchZoneInput.addEventListener("keyup", () => {
  const zone = document.getElementById("zone").value;
  const foundClients = clientManager.findClientsByZone(zone);
  populateTable(foundClients);
});

searchPhoneNumberInput.addEventListener("keyup", () => {
  const phoneNumber = document.getElementById("phoneNumber").value;
  const foundClients = clientManager.findClientsByPhoneNumber(phoneNumber);
  populateTable(foundClients);
});

addClientButton.addEventListener("click", () => window.location.href = "add-client-form.html");


populateTable(clientManager.clients);

const testClients = document.getElementById("testClients");

testClients.addEventListener("click", () => generateRandomClients(50));
