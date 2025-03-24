document.addEventListener("DOMContentLoaded", function () {
    const calendarElement = document.getElementById("calendar");
    const currentMonthElement = document.getElementById("currentMonth");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const selectedDateElement = document.getElementById("selectedDate");
    const clientsListElement = document.getElementById("clients");

    // set active link for nav bar
  const currentPage = window.location.pathname.split("/").pop(); // Get current page filename
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPage) {
          link.classList.add("active-link"); // Set active link dynamically
      }
  });
  
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
  
        // Check if there are any clients scheduled for this day
        const hasClients = checkIfClientsScheduledForDate(date);
        if (hasClients) {
          dayElement.classList.add("has-clients");
        }
  
        // Click event to display clients for the selected day
        dayElement.addEventListener("click", function () {
          // Remove selected class from all days
          document.querySelectorAll(".day").forEach(day => day.classList.remove("selected"));
          // Add selected class to this day
          dayElement.classList.add("selected");
          
          selectedDateElement.textContent = date.toDateString();
          updateClientList(date);
        });
  
        calendarElement.appendChild(dayElement);
      }
    }
  
    // Helper function to check if any clients are scheduled for a date (for visual indication)
    function checkIfClientsScheduledForDate(date) {
      const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
      const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // First check if there's any cleaning history for this date
      const clientWithHistoryOnDate = storedClients.some(client => 
        client.cleaningHistory && 
        client.cleaningHistory.some(history => history.date === dateString && history.completed)
      );
      
      if (clientWithHistoryOnDate) return true;
      
      // Then check scheduled cleanings based on frequency
      return storedClients.some(client => {
        if (!client || !client.cleaningFrequency || !client.startDate) {
          return false;
        }
        return isClientScheduledForDate(client.cleaningFrequency, client.startDate, date);
      });
    }
  
    // Updated function to include cleaning group information
    function updateClientList(date) {
      clientsListElement.innerHTML = "";
      const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
      const selectedDateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Check for clients with cleaning history on this date
      const clientsWithHistory = [];
      storedClients.forEach(client => {
        if (client.cleaningHistory && Array.isArray(client.cleaningHistory)) {
          const historyOnDate = client.cleaningHistory.find(history => 
            history.date === selectedDateString && history.completed
          );
          
          if (historyOnDate) {
            clientsWithHistory.push({
              name: `${client.firstName} ${client.lastName}`,
              group: historyOnDate.cleaningGroup || client.cleaningGroup || "No Group",
              service: client.service || "Standard Cleaning",
              completed: true,
              historicalCleaning: true
            });
          }
        }
      });
      
      // Check for scheduled cleanings based on frequency
      const scheduledClients = [];
      storedClients.forEach(client => {
        if (!client || !client.firstName || !client.lastName || !client.cleaningFrequency || !client.startDate) {
          return;
        }
        
        // Skip clients that already have cleaning history for this date
        const alreadyHasHistory = clientsWithHistory.some(
          historyClient => historyClient.name === `${client.firstName} ${client.lastName}`
        );
        
        if (!alreadyHasHistory && isClientScheduledForDate(client.cleaningFrequency, client.startDate, date)) {
          scheduledClients.push({
            name: `${client.firstName} ${client.lastName}`,
            group: client.cleaningGroup || "No Group",
            service: client.service || "Standard Cleaning",
            frequency: client.cleaningFrequency,
            completed: false,
            historicalCleaning: false
          });
        }
      });
      
      // Combine both lists and sort by group
      const allClients = [...clientsWithHistory, ...scheduledClients].sort((a, b) => {
        // Sort first by group
        if (a.group < b.group) return -1;
        if (a.group > b.group) return 1;
        // Then by name
        return a.name.localeCompare(b.name);
      });
      
      if (allClients.length === 0) {
        clientsListElement.innerHTML = "<li class='no-clients'>No clients scheduled</li>";
      } else {
        // Group headers to organize by cleaning group
        let currentGroup = null;
        let groupContainer = null;
        
        allClients.forEach(client => {
          // Create a new group section if needed
          if (currentGroup !== client.group) {
            currentGroup = client.group;
            
            const groupHeader = document.createElement("li");
            groupHeader.classList.add("group-header");
            groupHeader.textContent = `Group: ${currentGroup}`;
            clientsListElement.appendChild(groupHeader);
            
            groupContainer = document.createElement("ul");
            groupContainer.classList.add("group-clients");
            clientsListElement.appendChild(groupContainer);
          }
          
          const li = document.createElement("li");
          li.classList.add("client-item");
          if (client.completed) {
            li.classList.add("completed");
          }
          
          // Create client info with more details
          const nameSpan = document.createElement("span");
          nameSpan.classList.add("client-name");
          nameSpan.textContent = client.name;
          
          const detailsSpan = document.createElement("span");
          detailsSpan.classList.add("client-details");
          
          if (client.historicalCleaning) {
            detailsSpan.textContent = `${client.service} (Completed)`;
          } else {
            detailsSpan.textContent = `${client.service} (${client.frequency})`;
          }
          
          li.appendChild(nameSpan);
          li.appendChild(detailsSpan);
          groupContainer.appendChild(li);
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
          case "once":
            // For one-time cleanings
            currentDate.setFullYear(currentDate.getFullYear() + 10); // Exit the loop
            break;
          default:
            // For custom frequencies or fallback
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
      
      // Normalize dates to compare just year, month, day
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      switch (frequency.toLowerCase()) {
        case "weekly":
          const daysDiff = Math.floor((normalizedTargetDate - normalizedStartDate) / (1000 * 60 * 60 * 24));
          return daysDiff % 7 === 0;
          
        case "bi-weekly":
          const biWeeklyDaysDiff = Math.floor((normalizedTargetDate - normalizedStartDate) / (1000 * 60 * 60 * 24));
          return biWeeklyDaysDiff % 14 === 0;
          
        case "monthly":
          return targetDate.getDate() === startDate.getDate();
          
        case "once":
          return normalizedTargetDate.getTime() === normalizedStartDate.getTime();
          
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