//gitHub
document.addEventListener("DOMContentLoaded", function () {
  const calendarElement = document.getElementById("calendar");
  const currentMonthElement = document.getElementById("currentMonth");
  const prevMonthButton = document.getElementById("prevMonth");
  const nextMonthButton = document.getElementById("nextMonth");
  const selectedDateElement = document.getElementById("selectedDate");
  const clientsListElement = document.getElementById("clients");

  let currentDate = new Date();

  function renderCalendar() {
      calendarElement.innerHTML = "";
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Set the month title
      currentMonthElement.textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentDate);

      // Get the first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay(); // 0 (Sunday) - 6 (Saturday)

      // Fill in previous month's days for alignment
      for (let i = 0; i < firstDayOfWeek; i++) {
          const emptyDiv = document.createElement("div");
          emptyDiv.classList.add("day", "empty");
          calendarElement.appendChild(emptyDiv);
      }

      // Fill in the days of the current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
          const date = new Date(year, month, day);
          const dayElement = document.createElement("div");
          dayElement.classList.add("day");
          dayElement.textContent = day;

          // Highlight today's date
          const today = new Date();
          if (date.toDateString() === today.toDateString()) {
              dayElement.classList.add("today");
          }

          // Click event to display clients for the selected day
          dayElement.addEventListener("click", function () {
              selectedDateElement.textContent = date.toDateString();
              updateClientList(date);
          });

          calendarElement.appendChild(dayElement);
      }
  }


// Modify updateClientList to be more efficient
function updateClientList(date) {
    clientsListElement.innerHTML = "";
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    const selectedDateString = date.toDateString();
    
    // Create a more efficient lookup
    const clientsForSelectedDate = [];
    
    storedClients.forEach(client => {
        if (!client || !client.firstName || !client.lastName || !client.cleaningFrequency || !client.startDate) {
            return;
        }
        
        const name = `${client.firstName} ${client.lastName}`;
        const frequency = client.cleaningFrequency;
        const startDate = client.startDate;
        
        // Check if date matches before calculating all dates
        if (isClientScheduledForDate(frequency, startDate, date)) {
            clientsForSelectedDate.push({
                name: name,
                frequency: frequency
            });
        }
    });
    
    if (clientsForSelectedDate.length === 0) {
        clientsListElement.innerHTML = "<li>No clients scheduled</li>";
    } else {
        clientsForSelectedDate.forEach(client => {
            const li = document.createElement("li");
            li.textContent = `${client.name} (${client.frequency})`;
            clientsListElement.appendChild(li);
        });
    }
}

function calculateCleaningDates(frequency, startDateStr) {
    const startDate = new Date(startDateStr);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 6); // Look ahead 6 months
    
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        
        // Increment based on frequency
        switch (frequency.toLowerCase()) {
            case "weekly":
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case "bi-weekly":
                currentDate.setDate(currentDate.getDate() + 14);
                break;
            case "monthly":
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            default:
                // For one-time or custom frequencies
                currentDate.setFullYear(currentDate.getFullYear() + 10); // Exit the loop
        }
    }
    
    return dates;
}

// Helper function to check if a client is scheduled for a specific date
function isClientScheduledForDate(frequency, startDateStr, targetDate) {
    const startDate = new Date(startDateStr);
    const targetTime = targetDate.getTime();
    
    // If start date is in the future compared to target date
    if (startDate > targetDate) {
        return false;
    }
    
    switch (frequency.toLowerCase()) {
        case "weekly":
            const daysDiff = Math.floor((targetTime - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff % 7 === 0;
            
        case "bi-weekly":
            const biWeeklyDaysDiff = Math.floor((targetTime - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return biWeeklyDaysDiff % 14 === 0;
            
        case "monthly":
            return targetDate.getDate() === startDate.getDate();
            
        case "one-time":
            return targetDate.toDateString() === startDate.toDateString();
            
        default:
            return false;
    }
}


  prevMonthButton.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
  });

  nextMonthButton.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
  });

  renderCalendar();
  updateClientList(currentDate);
});
