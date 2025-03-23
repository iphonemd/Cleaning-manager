// use this to get yyyy/mm//dd
function getTodayDateString() {
  const today = new Date();
  const todayISO = today.toISOString();
  return todayISO.slice(0, 10);
}