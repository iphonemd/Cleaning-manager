// generate employee function for testing

function generateRandomEmployees(count = 10) {
  // Arrays of sample data
  const firstNames = ["James", "Maria", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
  
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"];
  
  const jobTitles = ["Helper", "Cleaner", "Team Lead", "Manager", "Supervisor", "Senior Cleaner", "Trainee", "Specialist"];
  
  const assignedGroups = ["Group A", "Group B", "Group C", "Group D", "Group E"];
  
  const employeeManager = new EmployeeManager();
  
  // Generate random date within the last year
  const getRandomHireDate = () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 365)); // Random date in the past year
    return pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  // Generate a formatted phone number
  const generatePhoneNumber = () => {
    const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
    const prefix = Math.floor(Math.random() * 900) + 100; // 100-999
    const lineNumber = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return `${areaCode}${prefix}${lineNumber}`;
  };
  
  // Generate a random email address
  const generateEmail = (firstName, lastName) => {
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "company.com"];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    // Random email format (firstname.lastname, firstinitial.lastname, etc.)
    const formats = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}${lastName.toLowerCase()[0]}@${domain}`,
      `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`,
      `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`
    ];
    
    return formats[Math.floor(Math.random() * formats.length)];
  };
  
  // Get today's date for hoursWorked
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Generate random employees
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phoneNumber = generatePhoneNumber();
    const email = generateEmail(firstName, lastName);
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const hireDate = getRandomHireDate();
    const assignedGroup = assignedGroups[Math.floor(Math.random() * assignedGroups.length)];
    const hourlyRate = Math.floor(Math.random() * 20) + 15; // Random rate between $15-35
    
    const newEmployee = employeeManager.addEmployee(
      firstName,
      lastName,
      phoneNumber,
      email,
      jobTitle,
      hireDate,
      assignedGroup,
      hourlyRate
    );
    
    // Add some hours worked data for some employees (random chance)
    if (Math.random() > 0.3) { // 70% chance to have hours worked
      // If the hoursWorked property doesn't exist, create it
      if (!newEmployee.hoursWorked) {
        newEmployee.hoursWorked = {};
      }
      
      // Add hours for today
      const hoursToday = Math.floor(Math.random() * 8) + 2; // 2-10 hours
      
      // Create a client to associate with the hours
      const clientManager = new ClientManager();
      const clients = clientManager.loadClients();
      
      // Only add client details if clients exist
      if (clients.length > 0) {
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        
        newEmployee.hoursWorked[today] = {
          totalHours: hoursToday,
          details: [
            {
              clientId: randomClient.id,
              clientName: `${randomClient.firstName} ${randomClient.lastName}`,
              hours: hoursToday
            }
          ]
        };
      } else {
        // Just add hours without client details
        newEmployee.hoursWorked[today] = {
          totalHours: hoursToday,
          details: []
        };
      }
    }
  }
  
  // Save all changes
  employeeManager.saveEmployees();
  console.log(`✅ Successfully generated ${count} random employees for testing`);
  return employeeManager.employees;
}

// To use this function, simply call:
// generateRandomEmployees(); // Generates 10 random employees by default
// or specify a different number:
// generateRandomEmployees(20); // Generates 20 random employees


class Employee {
  constructor(firstName, lastName, phoneNumber, email, jobTitle, employeeNumber, hireDate, assignedGroup, hourlyRate, id = null) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.jobTitle = jobTitle;
    this.employeeNumber = employeeNumber;
    this.hireDate = hireDate;
    this.assignedGroup = assignedGroup;
    this.hourlyRate = hourlyRate;
    this.hoursWorked = {}; // Initialize hoursWorked
    this.id = id || Date.now();
  }
}

class EmployeeManager {
  constructor() {
    this.employees = this.loadEmployees();
    this.assignEmployeeNumbers();
  }

  assignEmployeeNumbers() {
    this.employees.forEach((employee, index) => {
      employee.employeeNumber = `100${(index + 1).toString().padStart(4, '0')}`;
    });
    this.saveEmployees();
  }

  addEmployee(firstName, lastName, phoneNumber, email, jobTitle, hireDate, assignedGroup, hourlyRate, id = null) {
    const newEmployee = new Employee(firstName, lastName, phoneNumber, email, jobTitle, null, hireDate, assignedGroup, hourlyRate, id);
    if (id) {
      this.employees = this.employees.filter(employee => employee.id !== id);
    }
    this.employees.push(newEmployee);
    this.assignEmployeeNumbers();
    this.saveEmployees();
    return newEmployee;
  }

  deleteEmployee(id) {
    this.employees = this.employees.filter(employee => employee.id !== id);
    this.assignEmployeeNumbers();
    this.saveEmployees();
  }

  saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(this.employees));
  }

  loadEmployees() {
    const storedEmployees = localStorage.getItem('employees');
    return storedEmployees ? JSON.parse(storedEmployees) : [];
  }

  // use this if payroll isnt loading the employees to ensore employee number is a number
  /* loadEmployees() {
    const storedEmployees = localStorage.getItem("employees");
    return storedEmployees
      ? JSON.parse(storedEmployees).map(emp => ({
          ...emp,
          employeeNumber: Number(emp.employeeNumber) // Convert to number
        }))
      : [];
  }  */

  getEmployeeById(id) {
    return this.employees.find(employee => employee.id === id);
  }

  findEmployeesByFirstName(firstName) {
    return this.employees.filter(employee => 
      employee.firstName.toLowerCase().startsWith(firstName.toLowerCase())
    );
  }

  findEmployeesByLastName(lastName) {
    return this.employees.filter(employee => 
      employee.lastName.toLowerCase().startsWith(lastName.toLowerCase())
    );
  }

  findEmployeesByEmployeeNumber(employeeNumber) {
    return this.employees.filter(employee => 
      employee.employeeNumber.toString().startsWith(employeeNumber)
    );
  }

  findEmployeesByJobTitle(jobTitle) {
    return this.employees.filter(employee => 
      employee.jobTitle.toLowerCase().startsWith(jobTitle.toLowerCase())
    );
  }

  findEmployeesByPhoneNumber(phoneNumber) {
    return this.employees.filter(employee => 
      employee.phoneNumber.toLowerCase().startsWith(phoneNumber.toLowerCase())
    );
  }
}