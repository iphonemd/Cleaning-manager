// scripts/utils.js

function calculateCleaningDates(frequency, startDateString) {
  const dates = [];
  const startDate = new Date(startDateString + "T00:00:00"); // Ensure proper UTC date parsing
  let currentDate = new Date(startDate);

  // Allow 2 years ahead for scheduling
  const endRange = new Date();
  endRange.setFullYear(endRange.getFullYear() + 2);

  // Handle "once" cleanings
  if (frequency === "once") {
      if (currentDate >= new Date()) {
          dates.push(new Date(currentDate));
      }
      return dates;
  }

  // Generate recurring dates
  while (currentDate <= endRange) {
      dates.push(new Date(currentDate));

      switch (frequency) {
          case "weekly":
              currentDate.setDate(currentDate.getDate() + 7);
              break;
          case "bi-weekly":
              currentDate.setDate(currentDate.getDate() + 14);
              break;
          case "every 3 weeks":
              currentDate.setDate(currentDate.getDate() + 21);
              break;
          case "monthly":
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
      }
  }

  return dates;
}

function getNextScheduledDate(frequency, startDateString, today = new Date()) {
  const startDate = new Date(startDateString);

  if (startDate >= today) {
    return startDate;
  }

  const intervals = {
    "weekly": 7,
    "bi-weekly": 14,
    "every 3 weeks": 21,
    "monthly": "monthly",
  };

  let nextDate = new Date(startDate);

  if (intervals[frequency] === "monthly") {
    const monthsDiff = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24 * 30));
    nextDate.setMonth(startDate.getMonth() + monthsDiff);
  } else {
    const daysDiff = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const periodsPassed = Math.ceil(daysDiff / intervals[frequency]);
    nextDate.setDate(startDate.getDate() + (periodsPassed * intervals[frequency]));
  }

  return nextDate;
}
