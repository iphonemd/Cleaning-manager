const employeeManager = new EmployeeManager();

const reportTypeSelect = document.getElementById("reportType");
const weekSelector = document.getElementById("weekSelector");
weekSelector.value = getTodayForWeek();
const monthSelector = document.getElementById("monthSelector");
monthSelector.value = getTodayForMonth();
const yearSelector = document.getElementById("yearSelector");
yearSelector.value = getTodayForYear();
const generateButton = document.getElementById("generateReport");
const revenueChartCanvas = document.getElementById("revenueChart").getContext("2d");
const reportSummaryDiv = document.getElementById("reportSummary");

let revenueChart;

const selectedType = reportTypeSelect.value;
weekSelector.style.display = selectedType === "weekly" ? "block" : "none";

const clientManager = new ClientManager();

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

function loadClients() {
  const storedClients = localStorage.getItem("clients");
  return storedClients ? JSON.parse(storedClients) : [];
}

//Helper Function: Normalize Date (Remove Time Portion)  
function normalizeDate(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

// function to get first day of the year accurately
function getFirstDayOfISOWeek(year, week) {
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const dayOffset = (week - 1) * 7;
  const firstDayOfWeek = new Date(firstThursday.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const dayOfWeek = firstDayOfWeek.getUTCDay();
  const mondayOffset = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  firstDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() + mondayOffset);
  return firstDayOfWeek;
}

function getLocalFirstDayOfISOWeek(year, week) {
  const utcDate = getFirstDayOfISOWeek(year, week);
  return new Date(utcDate.getTime()); // Convert to local time
}

function getTodayForWeek() {
  const today = new Date();
  const year = today.getFullYear();
  const weekNumber = getISOWeek(today); // You'll need the getISOWeek function from previous examples
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

function getTodayForMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  return `${year}-${month}`;
}

function getTodayForYear() {
  const today = new Date();
  return today.getFullYear().toString();
}

// Function to get the ISO week number
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Calculate difference between current date and January 4.
  // Round to nearest number of days, and calculate the week number.
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function calculateDailyRevenueForWeek(clients, weekString) {
  const [year, week] = weekString.split("-W");
  const startOfWeek = getFirstDayOfISOWeek(year, week);
  const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

  let revenueData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  clients.forEach(client => {
    client.cleaningHistory.forEach(event => {
      const eventDate = event.date; 
      const eventDateObj = new Date(eventDate);
      const dayOfWeek = eventDateObj.getDay(); 
      const startOfWeekObj = new Date(startOfWeek.toISOString().split('T')[0]);
      const endOfWeekObj = new Date(endOfWeek.toISOString().split('T')[0]);
      const eventDateString = eventDateObj.toISOString().split('T')[0];
      const startOfWeekString = startOfWeekObj.toISOString().split('T')[0];
      const endOfWeekString = endOfWeekObj.toISOString().split('T')[0];

      if (eventDateString >= startOfWeekString && eventDateString <= endOfWeekString && event.completed) {
        revenueData[dayOfWeek] += client.charge;
      }
    });
  });

  return revenueData;
}
  

function calculateDailyRevenueForMonth(clients, monthString) {
  const [year, month] = monthString.split("-");
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(Date.UTC(year, parseInt(month), 0)).toISOString().split('T')[0];

  let revenueData = {};
  const lastDayOfMonthObj = new Date(lastDayOfMonth);
  for (let i = 1; i <= lastDayOfMonthObj.getUTCDate(); i++) {
    revenueData[i] = 0;
  }

  clients.forEach(client => {
    client.cleaningHistory.forEach(event => {
      const eventDate = event.date;
      const eventDateObj = new Date(eventDate);
      const eventDateString = eventDateObj.toISOString().split('T')[0];

      if (eventDateString >= firstDayOfMonth && eventDateString <= lastDayOfMonth && event.completed) {
        const eventDay = eventDateObj.getUTCDate();
        revenueData[eventDay] += client.charge;
      }
    });
  });

  return revenueData;
}

function calculateMonthlyRevenueForYear(clients, year) {
  let revenueData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };

  clients.forEach(client => {
    client.cleaningHistory.forEach(event => {
      const eventDate = event.date;
      const eventDateObj = new Date(eventDate);
      const eventYear = eventDateObj.getUTCFullYear();
      const month = eventDateObj.getUTCMonth();

      if (eventYear === parseInt(year) && event.completed) {
        revenueData[month] += client.charge;
      }
    });
  });

  return revenueData;
}

function getExpenses() {
  const storedExpenses = localStorage.getItem("expenses");
  return storedExpenses ? JSON.parse(storedExpenses) : [];
}

function calculateAndDisplayExpenses(reportType, dateValue) {
  const expenses = getExpenses();
  let expensesData = [];
  let chartLabels = [];

    if (reportType === "weekly") {
        const [year, week] = dateValue.split("-W");
        const weekStartDate = getFirstDayOfISOWeek(parseInt(year), parseInt(week));
        const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        chartLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        expensesData = [0, 0, 0, 0, 0, 0, 0];
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const expenseDateString = expenseDate.toISOString().split('T')[0];
            const weekStartDateString = weekStartDate.toISOString().split('T')[0];
            const weekEndDateString = weekEndDate.toISOString().split('T')[0];

            if (expenseDateString >= weekStartDateString && expenseDateString <= weekEndDateString) {
                const dayOfWeek = expenseDate.getDay();
                expensesData[dayOfWeek] += parseFloat(expense.amount);
            }
        });
    } else if (reportType === "monthly") {
        const [year, month] = dateValue.split("-");
        const firstDayOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0);
        const daysInMonth = lastDayOfMonth.getDate();
        chartLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        expensesData = Array(daysInMonth).fill(0);
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
             const expenseDateString = expenseDate.toISOString().split('T')[0];
            const firstDayOfMonthString = firstDayOfMonth.toISOString().split('T')[0];
            const lastDayOfMonthString = lastDayOfMonth.toISOString().split('T')[0];
            if (expenseDateString >= firstDayOfMonthString && expenseDateString <= lastDayOfMonthString) {
                const dayOfMonth = expenseDate.getDate() - 1;
                expensesData[dayOfMonth] += parseFloat(expense.amount);
            }
        });
    } else if (reportType === "yearly") {
        const year = parseInt(dateValue);
        const firstDayOfYear = new Date(year, 0, 1);
        const lastDayOfYear = new Date(year, 11, 31);

        chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        expensesData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
         expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const expenseDateString = expenseDate.toISOString().split('T')[0];
            const firstDayOfYearString = firstDayOfYear.toISOString().split('T')[0];
            const lastDayOfYearString = lastDayOfYear.toISOString().split('T')[0];

            if (expenseDateString >= firstDayOfYearString && expenseDateString <= lastDayOfYearString) {
                const month = expenseDate.getMonth();
                expensesData[month] += parseFloat(expense.amount);
            }
        });
    }
    return { labels: chartLabels, data: expensesData };
}

function displayRevenueReport(reportType, clients, dateValue) {
  let revenueData = {};
  let chartLabels = [];
  let chartData = [];
  let hoursData = [];
  let payData = [];
  let earningsData = [];
  let expensesData;

  if (reportType === "weekly") {
    revenueData = calculateDailyRevenueForWeek(clients, dateValue);
    chartLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const [year, week] = dateValue.split("-W");
      const weekStartDate = getFirstDayOfISOWeek(parseInt(year), parseInt(week));
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStartDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            let totalHoursForDay = 0;
            let totalPayForDay = 0;
            let earningsForDay = 0;
            employeeManager.employees.forEach(employee => {
                if (employee.hoursWorked && employee.hoursWorked[currentDate] && employee.hoursWorked[currentDate].totalHours) {
                    totalHoursForDay += employee.hoursWorked[currentDate].totalHours;
                    totalPayForDay += employee.hoursWorked[currentDate].totalHours * employee.hourlyRate;
                }
            });
            hoursData.push(totalHoursForDay);
            payData.push(totalPayForDay);
             earningsForDay = revenueData[i] - totalPayForDay;
             earningsData.push(earningsForDay);
        }
  } else if (reportType === "monthly") {
    revenueData = calculateDailyRevenueForMonth(clients, dateValue);
    const [year, month] = dateValue.split("-");
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    chartLabels = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
     for (let i = 1; i <= lastDayOfMonth; i++) {
            const currentDate = `${year}-${month}-${i.toString().padStart(2, '0')}`;
            let totalHoursForDay = 0;
            let totalPayForDay = 0;
             let earningsForDay = 0;
            employeeManager.employees.forEach(employee => {
                if (employee.hoursWorked && employee.hoursWorked[currentDate] && employee.hoursWorked[currentDate].totalHours) {
                    totalHoursForDay += employee.hoursWorked[currentDate].totalHours;
                    totalPayForDay += employee.hoursWorked[currentDate].totalHours * employee.hourlyRate;
                }
            });
            hoursData.push(totalHoursForDay);
            payData.push(totalPayForDay);
            earningsForDay = revenueData[i] - totalPayForDay;
            earningsData.push(earningsForDay);
        }

  } else if (reportType === "yearly") {
    revenueData = calculateMonthlyRevenueForYear(clients, dateValue);
    chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 12; i++) {
            const month = (i + 1).toString().padStart(2, '0');
            let totalHoursForMonth = 0;
            let totalPayForMonth = 0;
             let earningsForMonth = 0;
            employeeManager.employees.forEach(employee => {
                for (let day in employee.hoursWorked) {
                    if (day.startsWith(`${dateValue}-${month}`)) {
                        if (employee.hoursWorked[day].totalHours) {
                            totalHoursForMonth += employee.hoursWorked[day].totalHours;
                            totalPayForMonth += employee.hoursWorked[day].totalHours * employee.hourlyRate;
                        }
                    }
                }
            });
            hoursData.push(totalHoursForMonth);
            payData.push(totalPayForMonth);
            earningsForMonth = revenueData[i] - totalPayForMonth;
            earningsData.push(earningsForMonth);
        }
  }

  chartData = Object.values(revenueData);
  const { labels, data: expensesDataVal } = calculateAndDisplayExpenses(reportType, dateValue);
  expensesData = expensesDataVal;


  reportSummaryDiv.textContent = `Total Revenue: $${chartData.reduce((sum, value) => sum + value, 0).toFixed(2)}`;

  if (revenueChart) {
    revenueChart.destroy();
  }

  revenueChart = new Chart(revenueChartCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Revenue",
        data: chartData,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Hours",
        data: hoursData,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Pay",
        data: payData,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Earnings",
        data: earningsData,
        backgroundColor: "rgba(201, 203, 207, 0.5)",
        borderColor: "rgba(201, 203, 207, 1)",
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: expensesData,
        backgroundColor: "rgba(255, 205, 86, 0.5)",
        borderColor: "rgba(255, 205, 86, 1)",
        borderWidth: 1,
      }
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}


reportTypeSelect.addEventListener("change", () => {
  const selectedType = reportTypeSelect.value;
  weekSelector.style.display = selectedType === "weekly" ? "block" : "none";
  monthSelector.style.display = selectedType === "monthly" ? "block" : "none";
  yearSelector.style.display = selectedType === "yearly" ? "block" : "none";
});

generateButton.addEventListener("click", () => {
  const reportType = reportTypeSelect.value;
  const clients = loadClients();

  let dateValue;

  if (reportType === "weekly") {
    dateValue = weekSelector.value;
  } else if (reportType === "monthly") {
    dateValue = monthSelector.value;
  } else if (reportType === "yearly") {
    dateValue = yearSelector.value;
  }

  displayRevenueReport(reportType, clients, dateValue);
});
