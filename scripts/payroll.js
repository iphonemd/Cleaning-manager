//client and employee constructors js loaded on html before this script
const employeeManager = new EmployeeManager();
const clientManager = new ClientManager();

const payrollGroupInput = document.getElementById("payrollGroup");
const showEmployeesButton = document.getElementById("showEmployees");
const payrollTableBody = document.querySelector("#payrollTable tbody");
const saveHoursButton = document.getElementById("saveHours");
const payrollDateInput = document.getElementById("payrollDate");
const todayDate = getTodayDateString();
payrollDateInput.value = todayDate;


payrollDateInput.addEventListener("change", () => {
  payrollTableBody.innerHTML = "";
});

showEmployeesButton.addEventListener("click", () => {
  const selectedDate = payrollDateInput.value;
  const selectedGroup = payrollGroupInput.value;

  const clientsForGroup = clientManager.clients.filter(client => client.cleaningGroup === selectedGroup);
  const clientsWithCleaningHistory = clientsForGroup.filter(client => client.cleaningHistory.some(history => history.date === selectedDate && history.completed));

  if (clientsWithCleaningHistory.length > 0) {
    const employees = employeeManager.employees.filter(emp => emp.assignedGroup === selectedGroup);
    populateTable(employees, clientsWithCleaningHistory);
  } else {
    payrollTableBody.innerHTML = ""; // Clear table if no clients
    alert("No clients were cleaned by this group on the selected date.");
  }
});

function getTodayDateString() {
  const today = new Date();
  const todayISO = today.toISOString();
  return todayISO.slice(0, 10);
}

function populateTable(employees, clientsWithCleaningHistory) {
  payrollTableBody.innerHTML = "";
  const selectedDate = payrollDateInput.value;

  clientsWithCleaningHistory.forEach(client => {
    const clientNameRow = document.createElement("tr");
  clientNameRow.innerHTML = `
    <td colspan="5" style="font-weight: bold; text-align: center;">${client.firstName} ${client.lastName}</td>
  `;
  payrollTableBody.appendChild(clientNameRow);

     // Add "Hours for All" input field
     const hoursForAllRow = document.createElement("tr");
     hoursForAllRow.innerHTML = `
       <td colspan="3" style="text-align: right; font-weight: bold;">Set Hours for All:</td>
       <td colspan="2"><input type="number" class="hoursForAllInput" data-client="${client.firstName} ${client.lastName}" min="0"></td>
     `;
     payrollTableBody.appendChild(hoursForAllRow);
 
     const hoursForAllInput = hoursForAllRow.querySelector(".hoursForAllInput");
     hoursForAllInput.addEventListener("input", (event) => {
       const newHours = parseFloat(event.target.value) || 0;
       const clientName = event.target.getAttribute("data-client");
       
       document.querySelectorAll(".employeeRow").forEach(row => {
         if (row.querySelector(".clientName").textContent === clientName) {
           row.querySelector(".hoursInput").value = newHours;
         }
       });
     });

    employees.forEach(employee => {
      const employeeHoursWorked = (employee.hoursWorked[selectedDate]?.details || []).find(entry => entry.clientName === `${client.firstName} ${client.lastName}`)?.hours || 0;

      const row = document.createElement("tr");
      row.classList.add("employeeRow")
      row.innerHTML = `
        <td class="employeeNumber">${employee.employeeNumber}</td>
        <td>${employee.firstName}</td>
        <td>${employee.lastName}</td>
        <td><input type="number" class="hoursInput" value=${employeeHoursWorked}></td>
        <td class="clientName">${client.firstName} ${client.lastName}</td>
      `;
      payrollTableBody.appendChild(row);
    });
  });
}

saveHoursButton.addEventListener("click", () => {
  const selectedDate = payrollDateInput.value;
  const employees = employeeManager.employees;
  const clients = clientManager.clients;
  const employeeRows = document.querySelectorAll(".employeeRow");

  employeeRows.forEach(row => {
    const employeeNumberCell = row.querySelector(".employeeNumber");
    const hoursInput = row.querySelector(".hoursInput");
    const clientNameCell = row.querySelector(".clientName");

    if (employeeNumberCell && hoursInput && clientNameCell) {
      const employeeNumber = parseInt(employeeNumberCell.textContent, 10);
      const hours = parseFloat(hoursInput.value) || 0;
      const clientName = clientNameCell.textContent;

      const employee = employees.find(emp => Number(emp.employeeNumber) === employeeNumber);
      const client = clients.find(c => `${c.firstName} ${c.lastName}` === clientName);

      if (employee) {
        if (!Array.isArray(employee.hoursWorked[selectedDate])) {
          employee.hoursWorked[selectedDate] = []; 
        }

        const existingEntry = employee.hoursWorked[selectedDate].find(entry => entry.clientName === clientName);
        if (existingEntry) {
          existingEntry.hours = hours;
        } else {
          employee.hoursWorked[selectedDate].push({ clientName, hours });
        }
      }

      if (client) {
        if (!Array.isArray(client.employeeHours[selectedDate])) {
          client.employeeHours[selectedDate] = [];
        }

        const existingEntry = client.employeeHours[selectedDate].find(entry => entry.employeeNumber === employeeNumber);
        if (existingEntry) {
          existingEntry.hours = hours;
        } else {
          client.employeeHours[selectedDate].push({
            employeeNumber: employee.employeeNumber, 
            employeeName: `${employee.firstName} ${employee.lastName}`,
            hours: hours
          });
        }
      }
    }
  });

  // ✅ Calculate Total Hours for Each Employee on the Selected Date
  employees.forEach(employee => {
    if (employee.hoursWorked && employee.hoursWorked[selectedDate]) {
      if (Array.isArray(employee.hoursWorked[selectedDate])) { 
        const totalHours = employee.hoursWorked[selectedDate].reduce((sum, entry) => sum + entry.hours, 0);
        employee.hoursWorked[selectedDate] = { 
          details: employee.hoursWorked[selectedDate], 
          totalHours: totalHours 
        };
      } else {
        console.warn(`employee.hoursWorked[${selectedDate}] is not an array for employee ${employee.firstName} ${employee.lastName}`);
      }
    }
  });

  employeeManager.saveEmployees();
  clientManager.saveClients();
  alert("Hours saved successfully!");
});


