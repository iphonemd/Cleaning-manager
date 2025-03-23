// client constructor loaded on html before this
const clientManager = new ClientManager();

let currentDate = new Date();
let clientsTableBody = document.querySelector("#clientsTable tbody");
let totalChargeDisplay = document.getElementById("totalCharge");
let currentDateDisplay = document.getElementById("currentDate") || "";
const selectAllButton = document.getElementById("selectAll");
const dateSelector = document.getElementById("dateSelector");
const todayButton = document.getElementById("todayButton");

function normalizeDate(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayClientsForDate(dateString) {
  currentDateDisplay.textContent = dateString;
  clientsTableBody.innerHTML = "";
  let totalCharge = 0;

  clientManager.clients.forEach((client) => {
    if (needsCleaningToday(client, dateString, client.startDate)) {
      const row = clientsTableBody.insertRow();

      const selectCell = row.insertCell();
      const clientCell = row.insertCell();
      const chargeCell = row.insertCell();
      const cleaningGroupCell = row.insertCell();

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `client-${client.id}`;
      checkbox.checked = isCleaningCompleted(client, dateString);

      selectCell.appendChild(checkbox);
      clientCell.textContent = `${client.firstName} ${client.lastName}`;
      chargeCell.textContent = `$${client.charge.toFixed(2)}`;
      cleaningGroupCell.textContent = client.cleaningGroup;

      checkbox.addEventListener("change", () => {
        console.log("Checkbox changed");
        updateCleaningStatus(client, dateString, checkbox.checked);
        calculateTotal(); // Call calculateTotal here
      });
    }
  });
  totalChargeDisplay.textContent = totalCharge.toFixed(2);
}

function needsCleaningToday(client, dateString, startDate) {
  const startDateObj = new Date(startDate);
  const dateStringObj = new Date(dateString);

  const diffTime = Math.abs(dateStringObj - startDateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let frequencyDays = 0;

  switch (client.cleaningFrequency) {
    case "weekly":
      frequencyDays = 7;
      break;
    case "biweekly":
      frequencyDays = 14;
      break;
    case "monthly":
      frequencyDays = 30;
      break;
    default:
      return startDate === dateString; // Once only
  }

  const result = diffDays % frequencyDays === 0 && dateStringObj >= startDateObj; // modified comparison
  return result;
}



function isCleaningCompleted(client, dateString) {
  const found = client.cleaningHistory.some((event) => {
    return event.date === dateString && event.completed;
  });
  return found;
}

function getCleaningGroup(client, date) {
  const event = client.cleaningHistory.find((event) => event.date === date);
  return event ? event.cleaningGroup : null;
}

function updateCleaningStatus(client, dateString, completed) {
  let eventIndex = client.cleaningHistory.findIndex(event => event.date === dateString);

  if (eventIndex !== -1) {
    // Event exists, update it
    client.cleaningHistory[eventIndex].completed = completed;
  } else {
    // Event doesn't exist, create a new one
    client.cleaningHistory.push(new CleaningEvent(dateString, completed, client.cleaningGroup));
  }

  clientManager.saveClients();
}

function calculateTotal() {
  console.log("calculateTotal called");

  let totalCharge = 0;
  const selectedDate = dateSelector.value; // Use dateSelector.value

  clientManager.clients.forEach((client) => {
    if (
      needsCleaningToday(client, selectedDate, client.startDate) &&
      isCleaningCompleted(client, selectedDate)
    ) {

      totalCharge += client.charge;
    }
  });
  totalChargeDisplay.textContent = totalCharge.toFixed(2);
}

// Select All button functionality
selectAllButton.addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(
    "#clientsTable input[type='checkbox']"
  );

  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
    const clientId = parseInt(checkbox.id.replace("client-", ""));
    const client = clientManager.getClientById(clientId);
    if (client) {
      updateCleaningStatus(client, dateSelector.value, true);
    }
  });
  calculateTotal();    
});

// Function to handle date input change
function handleDateChange() {
  currentDate = new Date(dateSelector.value);
  displayClientsForDate(dateSelector.value); // Pass the string
  calculateTotal(); // Call calculateTotal here

}

// Function to handle "Today" button click
function handleTodayButtonClick() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedToday = `${year}-${month}-${day}`;

  dateSelector.value = formattedToday;
  currentDate = new Date(formattedToday);
  displayClientsForDate(formattedToday); // Pass the string
}

// Set initial date input value to today's date
//setDateInputValue(currentDate);

// Event listeners
handleTodayButtonClick()

dateSelector.addEventListener("change", handleDateChange);
todayButton.addEventListener("click", handleTodayButtonClick);

// Initial display
const today = new Date();

const formattedToday = String(normalizeDate(today));

dateSelector.value = formattedToday;
currentDate = new Date(formattedToday);

displayClientsForDate(currentDate);
handleTodayButtonClick();