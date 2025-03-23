//employee constructor js loaded on html before this
const employeeManager = new EmployeeManager();
const selectedWeek = document.getElementById("dateSelector")
selectedWeek.value = formatCurrentWeek();
const currentWeek = document.getElementById("currentWeek")
const weeklyPayrollTable = document.getElementById("weekTable")
const tableBody = document.getElementById("tableBody")

currentWeek.addEventListener("click", () => {selectedWeek.value = selectedWeek.value = formatCurrentWeek();
  populateTableForSelectedWeek();
});

selectedWeek.addEventListener("change", () => populateTableForSelectedWeek());

function normalizeDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getISOWeek(date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  const dayOfWeek = utcDate.getUTCDay();
  const thursdayOffset = dayOfWeek === 0 ? -3 : 4 - dayOfWeek;
  utcDate.setUTCDate(utcDate.getUTCDate() + thursdayOffset);

  const firstThursday = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 4));
  const firstThursdayDay = firstThursday.getUTCDay();
  firstThursday.setUTCDate(firstThursday.getUTCDate() - (firstThursdayDay === 0 ? 6 : firstThursdayDay - 4)); 

  const diffInDays = Math.floor((utcDate - firstThursday) / 86400000);
  return 1 + Math.floor(diffInDays / 7);
}

function formatCurrentWeek() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const week = getISOWeek(today).toString().padStart(2, '0');
  return `${year}-W${week}`;
}

function getWeekDates(isoWeekString) {
  const [year, week] = isoWeekString.split('-W').map(Number);

  const firstThursday = new Date(year, 0, 4);
  const dayOfWeek = firstThursday.getDay();
  firstThursday.setDate(firstThursday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 4));

  const monday = new Date(firstThursday);
  monday.setDate(firstThursday.getDate() + (week - 1) * 7 - 3);

  const formatDate = (date) => date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });

  return {
      Mon: formatDate(monday),
      Tue: formatDate(new Date(monday.setDate(monday.getDate() + 1))),
      Wed: formatDate(new Date(monday.setDate(monday.getDate() + 1))),
      Thu: formatDate(new Date(monday.setDate(monday.getDate() + 1))),
      Fri: formatDate(new Date(monday.setDate(monday.getDate() + 1))),
      Sat: formatDate(new Date(monday.setDate(monday.getDate() + 1))),
      Sun: formatDate(new Date(monday.setDate(monday.getDate() + 1))),
      year: year //passes the year to filter employees by year too when populating the table.
  };
}

function getMondayFilterEmployees(year, weekNumber) {
  const janFirst = new Date(year, 0, 1);
  const dayOfYear = (weekNumber - 1) * 7 + 1;
  const monday = new Date(janFirst.getTime() + (dayOfYear - janFirst.getDay() + (janFirst.getDay() > 4 ? 7 : 0)) * 86400000);
  return monday;
}

function getWeekDatesFilterEmployees(monday) {
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday.getTime() + i * 86400000);
    weekDates.push(date);
  }
  return weekDates;
}

function filterEmployeesForDate(selectedWeek) {
  const allEmployees = employeeManager.employees;
  const filteredEmployees = [];

  const [year, weekNumber] = selectedWeek.split(('W'));
  const weekStartDate = getMondayFilterEmployees(parseInt(year), parseInt(weekNumber));
  const weekDates = getWeekDatesFilterEmployees(weekStartDate);

  allEmployees.forEach(employee => {
    for (const date of weekDates) {
      const dateString = date.toISOString().split('T')[0];
      if (employee.hoursWorked && employee.hoursWorked[dateString]) {
        filteredEmployees.push(employee);
        break;
      }
    }
  });
  return filteredEmployees;
}

function populateTableForSelectedWeek() {
  const week = selectedWeek.value;
  const employees = filterEmployeesForDate(week)
  const tableBody = document.querySelector('#weekTable tbody');

  if (!week) {
    alert("Please select a valid week!");
    return;
  }
  if (!tableBody) {
    alert("No table found!");
    return;
  }

  const dates = getWeekDates(week);

  //dateRow.innerHTML = '';
  const weekDates = getWeekDatesFilterEmployees(getMondayFilterEmployees(dates.year, week.split('-W')[1]));
  const dateRow = document.getElementById("dateRow");
  dateRow.innerHTML = `
    <td id="employee">Employee</td>
    <td>Mon ${dates.Mon}</td>
    <td>Tue ${dates.Tue}</td>
    <td>Wed ${dates.Wed}</td>
    <td>Thu ${dates.Thu}</td>
    <td>Fri ${dates.Fri}</td>
    <td>Sat ${dates.Sat}</td>
    <td>Sun ${dates.Sun}</td>
    <td id="employeeHours">Total Hours</td>
    <td id="employeeRate">Rate</td>
    <td id="employeePay">Net Pay</td>
  `

  tableBody.innerHTML = '';
  employees.forEach(employee => {
    const employeeRow = document.createElement('tr');
    let totalHours = 0;
    let employeeSavedHours = 0;
    const dailyHours = {}

    weekDates.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      if (employee.hoursWorked && employee.hoursWorked[dateString]) {
        const hoursObject = employee.hoursWorked[dateString];
        if (hoursObject && hoursObject.details) {
          const dayHours = hoursObject.details.reduce((sum, item) => sum + item.hours, 0);

          dailyHours[dateString] = dayHours;
          totalHours += dayHours;
          employeeSavedHours = employee.hoursWorked[dateString]['totalHours'];
        }
      } else {
        dailyHours[dateString] = 0; // No hours for that day
      }
    });

    let netPay = Number(totalHours) * Number(employee.hourlyRate);
    employeeRow.innerHTML = `
      <td id="employee" class="employeeClass">${employee.firstName} ${employee.lastName}</td>
      <td>${dailyHours[weekDates[0].toISOString().split('T')[0]] || 0}</td>
      <td>${dailyHours[weekDates[1].toISOString().split('T')[0]] || 0}</td>
      <td>${dailyHours[weekDates[2].toISOString().split('T')[0]] || 0}</td>
      <td>${dailyHours[weekDates[3].toISOString().split('T')[0]] || 0}</td>
      <td>${dailyHours[weekDates[4].toISOString().split('T')[0]] || 0}</td>
      <td>${dailyHours[weekDates[5].toISOString().split('T')[0]] || 0}</td>
      <td>${dailyHours[weekDates[6].toISOString().split('T')[0]] || 0}</td>
      <td>${totalHours}</td>
      <td>${employee.hourlyRate}</td>
      <td>${netPay}</td>
    `;
    tableBody.appendChild(employeeRow);
  });
}

populateTableForSelectedWeek();

