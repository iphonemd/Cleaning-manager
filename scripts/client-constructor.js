// random client generator
// Function to generate random clients for testing
function generateRandomClients(count = 20) {
  // Arrays of sample data
  const firstNames = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Lisa", "William", "Karen", "Thomas", "Jessica", "Daniel", "Nancy", "Matthew", "Elizabeth", "Christopher", "Susan", "Andrew", "Amanda"];
  
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White"];
  
  const streets = ["123 Oak Street", "456 Pine Avenue", "789 Maple Boulevard", "321 Cedar Road", "654 Elm Street", "987 Birch Lane", "741 Walnut Drive", "852 Cherry Street", "369 Spruce Avenue", "159 Willow Lane"];
  
  const cities = ["Tulsa OK", "Oklahoma City OK", "Norman OK", "Broken Arrow OK", "Edmond OK", "Midwest City OK", "Stillwater OK", "Lawton OK", "Moore OK", "Ardmore OK"];
  
  const zones = ["North", "South", "East", "West", "Central", "Northeast", "Northwest", "Southeast", "Southwest"];
  
  const cleaningFrequencies = ["once", "weekly", "biweekly", "monthly"];
  
  const services = ["Full house", "Partial house", "Deep clean", "Move-in/Move-out", "Special event", "Basic clean", "Premium clean", "VIP service"];
  
  const cleaningGroups = ["Group A", "Group B", "Group C", "Group D", "Group E"];
  
  const zipCodes = ["74101", "74102", "74103", "74104", "74105", "74106", "74107", "74108", "74109", "74110"];
  
  const clientManager = new ClientManager();
  
  // Generate random date within the last 60 days
  const getRandomDate = () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 60));
    return pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  // Generate a formatted phone number
  const generatePhoneNumber = () => {
    const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
    const prefix = Math.floor(Math.random() * 900) + 100; // 100-999
    const lineNumber = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return `${areaCode}${prefix}${lineNumber}`;
  };
  
  // Generate random clients
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phoneNumber = generatePhoneNumber();
    const street = streets[Math.floor(Math.random() * streets.length)];
    const cityState = cities[Math.floor(Math.random() * cities.length)];
    const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
    const cleaningFrequency = cleaningFrequencies[Math.floor(Math.random() * cleaningFrequencies.length)];
    const charge = Math.floor(Math.random() * 300) + 100; // Random charge between 100-400
    const service = services[Math.floor(Math.random() * services.length)];
    const cleaningGroup = cleaningGroups[Math.floor(Math.random() * cleaningGroups.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const startDate = getRandomDate();
    
    const newClient = clientManager.addClient(
      firstName,
      lastName,
      phoneNumber,
      street,
      cityState,
      zipCode,
      cleaningFrequency,
      charge,
      service,
      cleaningGroup,
      zone,
      startDate
    );
    
    // Add a cleaning history entry for some clients (random chance)
    if (Math.random() > 0.3) { // 70% chance to have cleaning history
      const cleaningEvent = new CleaningEvent(
        startDate,
        Math.random() > 0.2, // 80% chance to be completed
        cleaningGroup
      );
      
      if (!newClient.cleaningHistory) {
        newClient.cleaningHistory = [];
      }
      
      newClient.cleaningHistory.push(cleaningEvent);
      
      // Add employee hours for some completed cleanings
      if (cleaningEvent.completed && Math.random() > 0.4) { // 60% chance for completed cleanings
        const employeeNames = ["Elon Musk", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos", "Sheryl Sandberg"];
        const employeeName = employeeNames[Math.floor(Math.random() * employeeNames.length)];
        const employeeNumber = "100000" + (Math.floor(Math.random() * 9) + 1);
        const hours = Math.floor(Math.random() * 5) + 2; // 2-7 hours
        
        if (!newClient.employeeHours[startDate]) {
          newClient.employeeHours[startDate] = [];
        }
        
        newClient.employeeHours[startDate].push({
          employeeNumber: employeeNumber,
          employeeName: employeeName,
          hours: hours
        });
      }
    }
  }
  
  // Save all changes
  clientManager.saveClients();
  console.log(`✅ Successfully generated ${count} random clients for testing`);
  return clientManager.clients;
}

// To use this function, simply call:
// generateRandomClients(); // Generates 20 random clients
// or specify a different number:
// generateRandomClients(50); // Generates 50 random clients



class Client {
  constructor(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id = null, clientNumber = null) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.street = street;
    this.cityState = cityState;
    this.zipCode = zipCode;
    this.cleaningFrequency = cleaningFrequency;
    this.charge = charge;
    this.service = service;
    this.cleaningGroup = cleaningGroup;
    this.zone = zone;
    this.startDate = startDate;
    this.id = id || Date.now();
    this.clientNumber = clientNumber;
    this.cleaningHistory = this.cleaningHistory || [];
    this.employeeHours = {};

  }
}

class ClientManager {
  constructor() {
    this.clients = this.loadClients();
    this.assignClientNumbers();
  }

  assignClientNumbers() {
    this.clients.forEach((client, index) => {
      client.clientNumber = index + 1;
    });
    this.saveClients();
  }

  addClient(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id = null) {
    const newClient = new Client(firstName, lastName, phoneNumber, street, cityState, zipCode, cleaningFrequency, charge, service, cleaningGroup, zone, startDate, id);
    if (id) {
      this.clients = this.clients.filter(client => client.id !== id);
    }
    this.clients.push(newClient);
    this.assignClientNumbers();
    this.saveClients();
    return newClient;
  }

  deleteClient(id) {
    this.clients = this.clients.filter(client => client.id !== id);
    this.assignClientNumbers();
    this.saveClients();
  }

  saveClients() {
    localStorage.setItem('clients', JSON.stringify(this.clients));
  }

  loadClients() {
    const storedClients = localStorage.getItem('clients');
    return storedClients ? JSON.parse(storedClients) : [];
  }

  getClientById(id) {
    return this.clients.find(client => client.id === id);
  }

  findClientsByLastName(lastName) {
    return this.clients.filter(client => client.lastName.toLowerCase().startsWith(lastName.toLowerCase()));
  }

  findClientsByFirstName(firstName) {
    return this.clients.filter(client => client.firstName.toLowerCase().startsWith(firstName.toLowerCase()));
  }

  findClientsByZone(zone) {
    return this.clients.filter(client => client.zone.toLowerCase().startsWith(zone.toLowerCase()));
  }

  findClientsByCleaningGroup(cleaningGroup) {
    return this.clients.filter(client => client.cleaningGroup.toLowerCase().startsWith(cleaningGroup.toLowerCase()));
  }

  findClientsByPhoneNumber(phoneNumber) {
    return this.clients.filter(client => client.phoneNumber.toLowerCase().startsWith(phoneNumber.toLowerCase()));
  }
}

class CleaningEvent {
  constructor(date, completed = false, cleaningGroup = null) {
    this.date = date; // YYYY-MM-DD format
    this.completed = completed;
    this.cleaningGroup = cleaningGroup;
  }
}