// client-cleaning-tracker.js

// set active link for nav bar
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // Get current page filename
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPage) {
          link.classList.add("active-link"); // Set active link dynamically
      }
  });
});

class ClientCleaningTracker {
  constructor() {
    this.clientManager = new ClientManager();
    this.employeeManager = new EmployeeManager();
    
    this.elements = {
      // Daily revenue elements
      dateSelector: document.getElementById("dateSelector"),
      todayButton: document.getElementById("todayButton"),
      selectAllButton: document.getElementById("selectAll"),
      clientsTableBody: document.querySelector("#clientsTable tbody"),
      totalChargeDisplay: document.getElementById("totalCharge"),
      currentDateDisplay: document.getElementById("currentDate") || "",
      
      // Payroll elements
      payrollDateInput: document.getElementById("payrollDate"),
      payrollGroupInput: document.getElementById("payrollGroup"),
      showEmployeesButton: document.getElementById("showEmployees"),
      payrollTableBody: document.querySelector("#payrollTable tbody"),
      saveHoursButton: document.getElementById("saveHours"),
      
      // New elements for integrated functionality
      syncButton: document.getElementById("syncButton"),
      assignEmployeesButton: document.getElementById("assignEmployeesButton")
    };
    
    this.currentDate = new Date();
    this.initDateFormatters();
    this.attachEventListeners();
    this.initPage();
  }
  
  initDateFormatters() {
    // Set initial date values
    const today = new Date();
    const formattedToday = this.normalizeDate(today);
    
    // Initialize date selectors if they exist
    if (this.elements.dateSelector) {
      this.elements.dateSelector.value = formattedToday;
    }
    
    if (this.elements.payrollDateInput) {
      this.elements.payrollDateInput.value = formattedToday;
    }
  }
  
  normalizeDate(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(utcDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  attachEventListeners() {
    // Daily revenue event listeners
    if (this.elements.dateSelector) {
      this.elements.dateSelector.addEventListener("change", () => this.handleDateChange());
    }
    
    if (this.elements.todayButton) {
      this.elements.todayButton.addEventListener("click", () => this.handleTodayButtonClick());
    }
    
    if (this.elements.selectAllButton) {
      this.elements.selectAllButton.addEventListener("click", () => this.selectAllClients());
    }
    
    // Payroll event listeners
    if (this.elements.showEmployeesButton) {
      this.elements.showEmployeesButton.addEventListener("click", () => this.showEmployeesForDate());
    }
    
    if (this.elements.saveHoursButton) {
      this.elements.saveHoursButton.addEventListener("click", () => this.saveEmployeeHours());
    }
    
    // Sync button to easily transfer data between screens
    if (this.elements.syncButton) {
      this.elements.syncButton.addEventListener("click", () => this.syncDatesBetweenPages());
    }
    
    // Button to automatically assign employees based on client groups
    if (this.elements.assignEmployeesButton) {
      this.elements.assignEmployeesButton.addEventListener("click", () => this.autoAssignEmployees());
    }
    
    // If we're on the payroll page and payroll date changes, clear the table
    if (this.elements.payrollDateInput) {
      this.elements.payrollDateInput.addEventListener("change", () => {
        if (this.elements.payrollTableBody) {
          this.elements.payrollTableBody.innerHTML = "";
        }
      });
    }
  }
  
  initPage() {
    // Determine which page we're on and initialize accordingly
    if (this.elements.clientsTableBody) {
      // We're on the daily revenue page
      this.handleTodayButtonClick();
      this.displayClientsForDate(this.elements.dateSelector.value);
    }
    
    if (this.elements.payrollTableBody) {
      // We're on the payroll page
      this.addAllOptionToGroups();
    }
  }
  
  // Daily Revenue Functions
  displayClientsForDate(dateString) {
    if (!this.elements.clientsTableBody) return;
    
    if (this.elements.currentDateDisplay) {
      this.elements.currentDateDisplay.textContent = dateString;
    }
    
    this.elements.clientsTableBody.innerHTML = "";
    let totalCharge = 0;
    
    this.clientManager.clients.forEach((client) => {
      if (this.needsCleaningToday(client, dateString, client.startDate)) {
        const row = this.elements.clientsTableBody.insertRow();
        
        const selectCell = row.insertCell();
        const clientCell = row.insertCell();
        const chargeCell = row.insertCell();
        const cleaningGroupCell = row.insertCell();
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `client-${client.id}`;
        checkbox.checked = this.isCleaningCompleted(client, dateString);
        
        selectCell.appendChild(checkbox);
        clientCell.textContent = `${client.firstName} ${client.lastName}`;
        chargeCell.textContent = `$${client.charge.toFixed(2)}`;
        cleaningGroupCell.textContent = client.cleaningGroup;
        
        if (checkbox.checked) {
          totalCharge += client.charge;
        }
        
        checkbox.addEventListener("change", () => {
          this.updateCleaningStatus(client, dateString, checkbox.checked);
          this.calculateTotal();
        });
      }
    });
    
    this.elements.totalChargeDisplay.textContent = totalCharge.toFixed(2);
  }
  
  needsCleaningToday(client, dateString, startDate) {
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
    
    return diffDays % frequencyDays === 0 && dateStringObj >= startDateObj;
  }
  
  isCleaningCompleted(client, dateString) {
    return client.cleaningHistory.some((event) => {
      return event.date === dateString && event.completed;
    });
  }
  
  updateCleaningStatus(client, dateString, completed) {
    let eventIndex = client.cleaningHistory.findIndex(event => event.date === dateString);
    
    if (eventIndex !== -1) {
      // Event exists, update it
      client.cleaningHistory[eventIndex].completed = completed;
    } else {
      // Event doesn't exist, create a new one
      client.cleaningHistory.push(new CleaningEvent(dateString, completed, client.cleaningGroup));
    }
    
    this.clientManager.saveClients();
  }
  
  calculateTotal() {
    if (!this.elements.totalChargeDisplay) return;
    
    let totalCharge = 0;
    const selectedDate = this.elements.dateSelector.value;
    
    this.clientManager.clients.forEach((client) => {
      if (
        this.needsCleaningToday(client, selectedDate, client.startDate) &&
        this.isCleaningCompleted(client, selectedDate)
      ) {
        totalCharge += client.charge;
      }
    });
    
    this.elements.totalChargeDisplay.textContent = totalCharge.toFixed(2);
  }
  
  selectAllClients() {
    if (!this.elements.clientsTableBody) return;
    
    const checkboxes = document.querySelectorAll(
      "#clientsTable input[type='checkbox']"
    );
    
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
      const clientId = parseInt(checkbox.id.replace("client-", ""));
      const client = this.clientManager.getClientById(clientId);
      if (client) {
        this.updateCleaningStatus(client, this.elements.dateSelector.value, true);
      }
    });
    
    this.calculateTotal();
  }
  
  handleDateChange() {
    if (!this.elements.dateSelector) return;
    
    this.currentDate = new Date(this.elements.dateSelector.value);
    this.displayClientsForDate(this.elements.dateSelector.value);
    this.calculateTotal();
  }
  
  handleTodayButtonClick() {
    const today = new Date();
    const formattedToday = this.normalizeDate(today);
    
    if (this.elements.dateSelector) {
      this.elements.dateSelector.value = formattedToday;
      this.currentDate = new Date(formattedToday);
      this.displayClientsForDate(formattedToday);
    }
  }
  
  // Payroll Functions
  addAllOptionToGroups() {
    if (!this.elements.payrollGroupInput) return;
    
    if (!Array.from(this.elements.payrollGroupInput.options).some(option => option.value === "All")) {
      const allOption = document.createElement("option");
      allOption.value = "All";
      allOption.textContent = "All Groups";
      this.elements.payrollGroupInput.prepend(allOption);
    }
  }
  
  showEmployeesForDate() {
    if (!this.elements.payrollTableBody || !this.elements.payrollDateInput || !this.elements.payrollGroupInput) return;
    
    const selectedDate = this.elements.payrollDateInput.value;
    const selectedGroup = this.elements.payrollGroupInput.value;
    
    let clientsWithCleaningHistory = [];
    let employees = [];
    
    if (selectedGroup === "All") {
      // Get all clients with cleaning history for the selected date
      clientsWithCleaningHistory = this.clientManager.clients.filter(
        client => client.cleaningHistory.some(history => history.date === selectedDate && history.completed)
      );
      
      // Get all employees
      employees = this.employeeManager.employees;
    } else {
      // Get clients for the selected group
      const clientsForGroup = this.clientManager.clients.filter(client => client.cleaningGroup === selectedGroup);
      clientsWithCleaningHistory = clientsForGroup.filter(
        client => client.cleaningHistory.some(history => history.date === selectedDate && history.completed)
      );
      
      // Get employees for the selected group
      employees = this.employeeManager.employees.filter(emp => emp.assignedGroup === selectedGroup);
    }
    
    if (clientsWithCleaningHistory.length > 0) {
      this.populatePayrollTable(employees, clientsWithCleaningHistory);
    } else {
      this.elements.payrollTableBody.innerHTML = "";
      alert("No clients were cleaned on the selected date" + (selectedGroup !== "All" ? " by this group." : "."));
    }
  }
  
  populatePayrollTable(employees, clientsWithCleaningHistory) {
    if (!this.elements.payrollTableBody) return;
    
    this.elements.payrollTableBody.innerHTML = "";
    const selectedDate = this.elements.payrollDateInput.value;
    const selectedGroup = this.elements.payrollGroupInput.value;
    
    // Group header for "All" option
    if (selectedGroup === "All") {
      // Sort employees by group for better organization
      employees.sort((a, b) => {
        if (a.assignedGroup < b.assignedGroup) return -1;
        if (a.assignedGroup > b.assignedGroup) return 1;
        return 0;
      });
    }
    
    clientsWithCleaningHistory.forEach(client => {
      // For "All" option, filter employees who can work with this client's group
      const relevantEmployees = selectedGroup === "All" 
        ? employees.filter(emp => emp.assignedGroup === client.cleaningGroup)
        : employees;
      
      // Only show client if there are employees assigned to their group
      if (relevantEmployees.length === 0) return;
      
      // Add group header when "All" is selected
      if (selectedGroup === "All") {
        const groupHeader = document.createElement("tr");
        groupHeader.innerHTML = `
          <td colspan="5" style="font-weight: bold; background-color: #f0f0f0; text-align: center;">
            Group: ${client.cleaningGroup}
          </td>
        `;
        this.elements.payrollTableBody.appendChild(groupHeader);
      }
      
      const clientNameRow = document.createElement("tr");
      clientNameRow.innerHTML = `
        <td colspan="5" style="font-weight: bold; text-align: center;">${client.firstName} ${client.lastName}</td>
      `;
      this.elements.payrollTableBody.appendChild(clientNameRow);
      
      // Add "Hours for All" input field
      const hoursForAllRow = document.createElement("tr");
      hoursForAllRow.innerHTML = `
        <td colspan="3" style="text-align: right; font-weight: bold;">Set Hours for All:</td>
        <td colspan="2"><input type="number" class="hoursForAllInput" data-client="${client.firstName} ${client.lastName}" data-group="${client.cleaningGroup}" min="0"></td>
      `;
      this.elements.payrollTableBody.appendChild(hoursForAllRow);
      
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
      
      relevantEmployees.forEach(employee => {
        const employeeHoursWorked = employee.hoursWorked[selectedDate]?.details
          ? (employee.hoursWorked[selectedDate].details.find(entry => entry.clientName === `${client.firstName} ${client.lastName}`)?.hours || 0)
          : 0;
        
        const row = document.createElement("tr");
        row.classList.add("employeeRow");
        row.innerHTML = `
          <td class="employeeNumber">${employee.employeeNumber}</td>
          <td>${employee.firstName}</td>
          <td>${employee.lastName}</td>
          <td><input type="number" class="hoursInput" value="${employeeHoursWorked}"></td>
          <td class="clientName">${client.firstName} ${client.lastName}</td>
        `;
        this.elements.payrollTableBody.appendChild(row);
      });
    });
  }
  
  saveEmployeeHours() {
    if (!this.elements.payrollTableBody) return;
    
    const selectedDate = this.elements.payrollDateInput.value;
    const employees = this.employeeManager.employees;
    const clients = this.clientManager.clients;
    const employeeRows = document.querySelectorAll(".employeeRow");
    
    // Create a structure to temporarily store hours data
    const hoursData = {};
    
    employeeRows.forEach(row => {
      const employeeNumberCell = row.querySelector(".employeeNumber");
      const hoursInput = row.querySelector(".hoursInput");
      const clientNameCell = row.querySelector(".clientName");
      
      if (employeeNumberCell && hoursInput && clientNameCell) {
        const employeeNumber = parseInt(employeeNumberCell.textContent, 10);
        const hours = parseFloat(hoursInput.value) || 0;
        const clientName = clientNameCell.textContent;
        
        if (!hoursData[employeeNumber]) {
          hoursData[employeeNumber] = {};
        }
        
        if (!hoursData[employeeNumber][clientName]) {
          hoursData[employeeNumber][clientName] = hours;
        }
      }
    });
    
    // Now process the collected data
    for (const employeeNumber in hoursData) {
      const employee = employees.find(emp => Number(emp.employeeNumber) === parseInt(employeeNumber, 10));
      
      if (!employee) continue;
      
      // Initialize array if needed
      if (!employee.hoursWorked[selectedDate] || !Array.isArray(employee.hoursWorked[selectedDate].details)) {
        employee.hoursWorked[selectedDate] = { details: [] };
      }
      
      for (const clientName in hoursData[employeeNumber]) {
        const hours = hoursData[employeeNumber][clientName];
        const client = clients.find(c => `${c.firstName} ${c.lastName}` === clientName);
        
        if (!client) continue;
        
        // Update employee hours
        const existingEntryIndex = employee.hoursWorked[selectedDate].details.findIndex(
          entry => entry.clientName === clientName
        );
        
        if (existingEntryIndex >= 0) {
          employee.hoursWorked[selectedDate].details[existingEntryIndex].hours = hours;
        } else {
          employee.hoursWorked[selectedDate].details.push({ clientName, hours });
        }
        
        // Update client hours
        if (!client.employeeHours[selectedDate]) {
          client.employeeHours[selectedDate] = [];
        }
        
        const existingClientEntry = client.employeeHours[selectedDate].findIndex(
          entry => entry.employeeNumber === parseInt(employeeNumber, 10)
        );
        
        if (existingClientEntry >= 0) {
          client.employeeHours[selectedDate][existingClientEntry].hours = hours;
        } else {
          client.employeeHours[selectedDate].push({
            employeeNumber: parseInt(employeeNumber, 10),
            employeeName: `${employee.firstName} ${employee.lastName}`,
            hours: hours
          });
        }
      }
      
      // Calculate total hours for this employee on this date
      employee.hoursWorked[selectedDate].totalHours = 
        employee.hoursWorked[selectedDate].details.reduce((sum, entry) => sum + entry.hours, 0);
    }
    
    this.employeeManager.saveEmployees();
    this.clientManager.saveClients();
    alert("Hours saved successfully!");
  }
  
  // New Integration Functions
  syncDatesBetweenPages() {
    // This function can be used to sync the date between pages
    // Useful when navigating from daily revenue to payroll
    if (this.elements.payrollDateInput && this.elements.dateSelector) {
      this.elements.payrollDateInput.value = this.elements.dateSelector.value;
      this.showEmployeesForDate();
    } else {
      const selectedDate = localStorage.getItem('selectedDate');
      if (selectedDate) {
        if (this.elements.dateSelector) {
          this.elements.dateSelector.value = selectedDate;
          this.handleDateChange();
        }
        if (this.elements.payrollDateInput) {
          this.elements.payrollDateInput.value = selectedDate;
        }
      }
    }
  }
  
  saveSelectedDate() {
    // Save selected date to localStorage when navigating between pages
    if (this.elements.dateSelector) {
      localStorage.setItem('selectedDate', this.elements.dateSelector.value);
    } else if (this.elements.payrollDateInput) {
      localStorage.setItem('selectedDate', this.elements.payrollDateInput.value);
    }
  }
  
  autoAssignEmployees() {
    // Automatically assign employees to clients based on cleaning groups
    if (!this.elements.payrollTableBody) return;
    
    const selectedDate = this.elements.payrollDateInput.value;
    const clients = this.clientManager.clients.filter(
      client => client.cleaningHistory.some(history => history.date === selectedDate && history.completed)
    );
    
    // Group clients by cleaning group
    const clientsByGroup = {};
    clients.forEach(client => {
      if (!clientsByGroup[client.cleaningGroup]) {
        clientsByGroup[client.cleaningGroup] = [];
      }
      clientsByGroup[client.cleaningGroup].push(client);
    });
    
    // For each group, assign employees evenly
    for (const group in clientsByGroup) {
      const groupClients = clientsByGroup[group];
      const groupEmployees = this.employeeManager.employees.filter(emp => emp.assignedGroup === group);
      
      if (groupEmployees.length === 0) continue;
      
      // Simple algorithm to distribute work evenly
      groupClients.forEach((client, index) => {
        // Assign employee based on rotating index
        const employeeIndex = index % groupEmployees.length;
        const employee = groupEmployees[employeeIndex];
        
        // Set default hours (can be adjusted by user later)
        const defaultHours = 2.0; // Default hours per client
        
        // Update data structures
        if (!employee.hoursWorked[selectedDate]) {
          employee.hoursWorked[selectedDate] = { details: [], totalHours: 0 };
        }
        
        // Check if entry already exists
        const existingEntryIndex = employee.hoursWorked[selectedDate].details.findIndex(
          entry => entry.clientName === `${client.firstName} ${client.lastName}`
        );
        
        if (existingEntryIndex >= 0) {
          employee.hoursWorked[selectedDate].details[existingEntryIndex].hours = defaultHours;
        } else {
          employee.hoursWorked[selectedDate].details.push({ 
            clientName: `${client.firstName} ${client.lastName}`, 
            hours: defaultHours 
          });
        }
        
        // Update client's employee hours
        if (!client.employeeHours[selectedDate]) {
          client.employeeHours[selectedDate] = [];
        }
        
        const existingClientEntry = client.employeeHours[selectedDate].findIndex(
          entry => entry.employeeNumber === employee.employeeNumber
        );
        
        if (existingClientEntry >= 0) {
          client.employeeHours[selectedDate][existingClientEntry].hours = defaultHours;
        } else {
          client.employeeHours[selectedDate].push({
            employeeNumber: employee.employeeNumber,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            hours: defaultHours
          });
        }
      });
    }
    
    // Recalculate total hours
    this.employeeManager.employees.forEach(employee => {
      if (employee.hoursWorked[selectedDate]) {
        employee.hoursWorked[selectedDate].totalHours = 
          employee.hoursWorked[selectedDate].details.reduce((sum, entry) => sum + entry.hours, 0);
      }
    });
    
    // Save data
    this.employeeManager.saveEmployees();
    this.clientManager.saveClients();
    
    // Refresh the table
    this.showEmployeesForDate();
    
    alert("Employees automatically assigned to clients!");
  }
}

// Initialize the tracker when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const tracker = new ClientCleaningTracker();
  
  // Store tracker in window for debugging
  window.tracker = tracker;
});