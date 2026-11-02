
import { useEffect, useState } from "react";
import "./App.css";

const readData = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

function App() {
  const [users, setUsers] = useState(() => readData("users", []));
  const [reports, setReports] = useState(() => readData("reports", []));
  const [tasks, setTasks] = useState(() => readData("tasks", []));
  const [resources, setResources] = useState(() => readData("resources", []));
  const [helpRequests, setHelpRequests] = useState(() =>
    readData("helpRequests", [])
  );

  const [loggedUser, setLoggedUser] = useState(() =>
    readData("loggedUser", null)
  );

  const [page, setPage] = useState(() =>
    readData("loggedUser", null) ? "dashboard" : "home"
  );

  const [message, setMessage] = useState("");

  const [registerData, setRegisterData] = useState({
    role: "user",
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [loginData, setLoginData] = useState({
    role: "user",
    email: "",
    password: "",
  });

  const [reportData, setReportData] = useState({
    type: "",
    location: "",
    details: "",
  });

  const [helpData, setHelpData] = useState({
    location: "",
    details: "",
  });

  const [taskData, setTaskData] = useState({
    description: "",
    location: "",
    volunteerEmail: "",
  });

  const [resourceData, setResourceData] = useState({
    name: "",
    quantity: "",
  });

  const [availability, setAvailability] = useState(
    loggedUser?.availability || "Available"
  );

  // Save application data in Local Storage
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem("helpRequests", JSON.stringify(helpRequests));
  }, [helpRequests]);

  useEffect(() => {
    if (loggedUser) {
      localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    } else {
      localStorage.removeItem("loggedUser");
    }
  }, [loggedUser]);

  // Navigation
  const goTo = (newPage) => {
    setMessage("");
    setPage(newPage);
  };

  // Registration
  const handleRegister = (e) => {
    e.preventDefault();

    const { role, name, email, mobile, password, confirmPassword } =
      registerData;

    if (name.trim().length < 3) {
      setMessage("Name must contain at least 3 characters.");
      return;
    }

    if (
      !email.toLowerCase().endsWith("@gmail.com") &&
      !email.toLowerCase().endsWith(".in")
    ) {
      setMessage("Email must end with @gmail.com or .in.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage("Enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      setMessage("This email is already registered.");
      return;
    }

    const newUser = {
      id: Date.now(),
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile,
      password,
      availability: role === "volunteer" ? "Available" : "",
    };

    setUsers((previous) => [...previous, newUser]);

    setRegisterData({
      role: "user",
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    });

    setMessage("Registration successful! Please login.");
    setTimeout(() => {
      setMessage("");
      setPage("login");
    }, 1200);
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();

    const { role, email, password } = loginData;

    const user = users.find(
      (item) =>
        item.role === role &&
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    // Default admin login
    if (
      role === "admin" &&
      email.toLowerCase() === "admin@gmail.com" &&
      password === "admin123"
    ) {
      const adminUser = {
        id: "admin",
        role: "admin",
        name: "Administrator",
        email: "admin@gmail.com",
        availability: "",
      };

      setLoggedUser(adminUser);
      setAvailability("Available");
      setPage("dashboard");
      setMessage("");
      return;
    }

    if (!user) {
      setMessage("Invalid role, email or password.");
      return;
    }

    const currentUser = {
      ...user,
      availability: user.availability || "Available",
    };

    setLoggedUser(currentUser);
    setAvailability(currentUser.availability);
    setLoginData({ role: "user", email: "", password: "" });
    setMessage("");
    setPage("dashboard");
  };

  // Logout
  const handleLogout = () => {
    setLoggedUser(null);
    setAvailability("Available");
    setPage("home");
    setMessage("");
  };

  // Submit disaster report
  const handleReport = (e) => {
    e.preventDefault();

    if (!loggedUser || loggedUser.role !== "user") return;

    const newReport = {
      id: Date.now(),
      type: reportData.type,
      location: reportData.location,
      details: reportData.details,
      status: "Reported",
      reportedBy: loggedUser.name,
      date: new Date().toLocaleString(),
    };

    setReports((previous) => [...previous, newReport]);

    setReportData({ type: "", location: "", details: "" });
    setMessage("Disaster report submitted successfully!");
  };

  // Submit emergency help request
  const handleHelpRequest = (e) => {
    e.preventDefault();

    if (!loggedUser) return;

    const newRequest = {
      id: Date.now(),
      name: loggedUser.name,
      email: loggedUser.email,
      location: helpData.location,
      details: helpData.details,
      status: "Pending",
      date: new Date().toLocaleString(),
    };

    setHelpRequests((previous) => [...previous, newRequest]);

    setHelpData({ location: "", details: "" });
    setMessage("Help request submitted successfully!");
  };

  // Update disaster report status
  const updateReportStatus = (id, status) => {
    setReports((previous) =>
      previous.map((report) =>
        report.id === id ? { ...report, status } : report
      )
    );
  };

  // Update volunteer availability
  const updateAvailability = () => {
    if (!loggedUser) return;

    const updatedUser = {
      ...loggedUser,
      availability,
    };

    setLoggedUser(updatedUser);

    setUsers((previous) =>
      previous.map((user) =>
        user.email === loggedUser.email ? updatedUser : user
      )
    );

    setMessage("Availability updated successfully!");
  };

  // Assign task to volunteer
  const handleAssignTask = (e) => {
    e.preventDefault();

    if (
      !taskData.description.trim() ||
      !taskData.location.trim() ||
      !taskData.volunteerEmail
    ) {
      setMessage("Please fill in all task details.");
      return;
    }

    const newTask = {
      id: Date.now(),
      description: taskData.description,
      location: taskData.location,
      volunteerEmail: taskData.volunteerEmail,
      status: "Assigned",
      date: new Date().toLocaleString(),
    };

    setTasks((previous) => [...previous, newTask]);

    setTaskData({
      description: "",
      location: "",
      volunteerEmail: "",
    });

    setMessage("Task assigned successfully!");
  };

  // Update volunteer task status
  const updateTaskStatus = (id, status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  // Add resource
  const handleAddResource = (e) => {
    e.preventDefault();

    if (
      !resourceData.name.trim() ||
      !resourceData.quantity ||
      Number(resourceData.quantity) <= 0
    ) {
      setMessage("Enter a valid resource name and quantity.");
      return;
    }

    const newResource = {
      id: Date.now(),
      name: resourceData.name,
      quantity: Number(resourceData.quantity),
    };

    setResources((previous) => [...previous, newResource]);

    setResourceData({ name: "", quantity: "" });
    setMessage("Resource added successfully!");
  };

  // Delete resource
  const deleteResource = (id) => {
    setResources((previous) =>
      previous.filter((resource) => resource.id !== id)
    );
  };

  const volunteers = users.filter((user) => user.role === "volunteer");

  // Reusable message
  const showMessage = () =>
    message && <p className="message">{message}</p>;

  // Home page
  const renderHome = () => (
    <>
      <section className="main-hero">
        <div className="hero-content">
          <span className="hero-label">EMERGENCY SUPPORT SYSTEM</span>
          <h1>Disaster Management System</h1>
          <p>
            Report emergencies, request assistance and connect with
            volunteers. Together, we can make communities safer.
          </p>

          <div className="hero-buttons">
            <button className="primary-button" onClick={() => goTo("register")}>
              Get Started
            </button>
            <button className="secondary-button" onClick={() => goTo("login")}>
              Login
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">🚨</div>
          <h3>Emergency Support</h3>
          <p>Quick reporting and coordinated assistance during disasters.</p>
        </div>
      </section>

      <section className="overview-section">
        <div className="section-heading">
          <div>
            <span className="small-heading">OUR SERVICES</span>
            <h2>How We Help</h2>
          </div>
          <p>Support for people and communities during emergencies.</p>
        </div>

        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon orange-icon">📢</div>
            <div>
              <h3>{reports.length}</h3>
              <p>Disaster Reports</p>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon green-icon">🤝</div>
            <div>
              <h3>{volunteers.length}</h3>
              <p>Registered Volunteers</p>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon blue-icon">📦</div>
            <div>
              <h3>{resources.length}</h3>
              <p>Available Resources</p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="info-card">
          <div className="info-icon">🚨</div>
          <h3>Report a Disaster</h3>
          <p>Submit information about floods, fires, earthquakes and other emergencies.</p>
        </div>

        <div className="info-card">
          <div className="info-icon">🆘</div>
          <h3>Request Help</h3>
          <p>Send an emergency assistance request to the management team.</p>
        </div>

        <div className="info-card">
          <div className="info-icon">🙋</div>
          <h3>Volunteer Support</h3>
          <p>Join our volunteer network and help people affected by disasters.</p>
        </div>
      </section>

      <section className="help-banner">
        <div>
          <span className="small-heading">NEED ASSISTANCE?</span>
          <h2>Be Prepared. Stay Safe.</h2>
          <p>Create an account to report emergencies and access support.</p>
        </div>
        <button className="help-button" onClick={() => goTo("register")}>
          Register Now
        </button>
      </section>

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <span className="small-heading">LATEST UPDATES</span>
            <h2>Recent Disaster Reports</h2>
          </div>
        </div>

        <div className="recent-reports">
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No reports available</h3>
              <p>Recently submitted disaster reports will appear here.</p>
            </div>
          ) : (
            reports.slice(-3).reverse().map((report) => (
              <div className="report-item" key={report.id}>
                <h4>{report.type}</h4>
                <p>Location: {report.location}</p>
                <p>Status: {report.status}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );

  // Login page
  const renderLogin = () => (
    <div className="auth-page">
      <div className="form-box">
        <h1>Disaster Management System</h1>
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <label>Login As</label>
          <select
            value={loginData.role}
            onChange={(e) =>
              setLoginData({ ...loginData, role: e.target.value })
            }
            required
          >
            <option value="">Select Role</option>
            <option value="user">User / Citizen</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email (@gmail.com or .in)"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            required
          />

          <button type="submit">Login</button>
          {showMessage()}
        </form>

        <p>
          Don't have an account?{" "}
          <a href="#" onClick={() => goTo("register")}>Register</a>
        </p>

        <a href="#" onClick={() => goTo("home")}>← Back to Home</a>
      </div>
    </div>
  );

  // Registration page
  const renderRegister = () => (
    <div className="auth-page">
      <div className="form-box">
        <h1>Disaster Management System</h1>
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <label>Register As</label>
          <select
            value={registerData.role}
            onChange={(e) =>
              setRegisterData({ ...registerData, role: e.target.value })
            }
            required
          >
            <option value="">Select Role</option>
            <option value="user">User / Citizen</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={registerData.name}
            onChange={(e) =>
              setRegisterData({ ...registerData, name: e.target.value })
            }
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email (@gmail.com or .in)"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            required
          />

          <label>Mobile Number</label>
          <input
            type="text"
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            value={registerData.mobile}
            onChange={(e) =>
              setRegisterData({ ...registerData, mobile: e.target.value })
            }
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
            required
          />

          <button type="submit">Register</button>
          {showMessage()}
        </form>

        <p>
          Already have an account?{" "}
          <a href="#" onClick={() => goTo("login")}>Login</a>
        </p>

        <a href="#" onClick={() => goTo("home")}>← Back to Home</a>
      </div>
    </div>
  );

  // User dashboard
  const renderUserDashboard = () => (
    <>
      <div className="dashboard-title">
        <span className="small-heading">USER DASHBOARD</span>
        <h1>Welcome, {loggedUser.name}!</h1>
        <p>Report disasters and request emergency assistance.</p>
      </div>

      <div className="action-grid">
        <div className="dashboard-card">
          <div className="card-icon red-card">🚨</div>
          <h3>Report a Disaster</h3>
          <p>Provide details about a disaster in your area.</p>

          <form onSubmit={handleReport}>
            <label>Disaster Type</label>
            <select
              value={reportData.type}
              onChange={(e) =>
                setReportData({ ...reportData, type: e.target.value })
              }
              required
            >
              <option value="">Select Disaster</option>
              <option>Flood</option>
              <option>Earthquake</option>
              <option>Cyclone</option>
              <option>Fire</option>
              <option>Landslide</option>
              <option>Heavy Rainfall</option>
              <option>Other</option>
            </select>

            <label>Location</label>
            <input
              placeholder="Enter location"
              value={reportData.location}
              onChange={(e) =>
                setReportData({ ...reportData, location: e.target.value })
              }
              required
            />

            <label>Details</label>
            <textarea
              placeholder="Describe the disaster"
              value={reportData.details}
              onChange={(e) =>
                setReportData({ ...reportData, details: e.target.value })
              }
              required
            />

            <button type="submit">Submit Report</button>
          </form>
        </div>

        <div className="dashboard-card">
          <div className="card-icon orange-card">🆘</div>
          <h3>Request Emergency Help</h3>
          <p>Submit a request for emergency assistance.</p>

          <form onSubmit={handleHelpRequest}>
            <label>Location</label>
            <input
              placeholder="Enter your location"
              value={helpData.location}
              onChange={(e) =>
                setHelpData({ ...helpData, location: e.target.value })
              }
              required
            />

            <label>Help Required</label>
            <textarea
              placeholder="Describe the help you need"
              value={helpData.details}
              onChange={(e) =>
                setHelpData({ ...helpData, details: e.target.value })
              }
              required
            />

            <button type="submit">Submit Help Request</button>
          </form>
        </div>

        <div className="dashboard-card">
          <div className="card-icon blue-card">📋</div>
          <h3>Disaster Information</h3>
          <p>View the disaster reports submitted by users.</p>

          {reports.length === 0 ? (
            <p>No disaster reports available.</p>
          ) : (
            reports.map((report) => (
              <div className="report-item" key={report.id}>
                <h4>{report.type}</h4>
                <p>Location: {report.location}</p>
                <p>{report.details}</p>
                <p>Status: {report.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showMessage()}
    </>
  );

  // Volunteer dashboard
  const renderVolunteerDashboard = () => {
    const myTasks = tasks.filter(
      (task) => task.volunteerEmail === loggedUser.email
    );

    return (
      <>
        <div className="dashboard-title">
          <span className="small-heading">VOLUNTEER DASHBOARD</span>
          <h1>Welcome, {loggedUser.name}!</h1>
          <p>Help your community during emergency situations.</p>
        </div>

        <div className="action-grid">
          <div className="dashboard-card">
            <div className="card-icon green-card">🙋</div>
            <h3>Volunteer Availability</h3>
            <p>Update your current availability status.</p>

            <div className="status-box">
              Current Status: <strong>{loggedUser.availability || "Available"}</strong>
            </div>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
            </select>

            <button onClick={updateAvailability}>Update Availability</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon orange-card">📍</div>
            <h3>Disaster Locations</h3>
            <p>View reported disaster locations.</p>

            <button onClick={() => goTo("volunteerReports")}>
              View Locations
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon blue-card">📋</div>
            <h3>Assigned Tasks</h3>
            <p>View and update your assigned tasks.</p>

            <button onClick={() => goTo("volunteerTasks")}>
              View Tasks ({myTasks.length})
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon purple-card">📦</div>
            <h3>Available Resources</h3>
            <p>Check the resources available for disaster support.</p>

            <button onClick={() => goTo("volunteerResources")}>
              View Resources
            </button>
          </div>
        </div>

        {showMessage()}
      </>
    );
  };

  // Volunteer disaster locations
  const renderVolunteerReports = () => (
    <>
      <div className="dashboard-title">
        <h1>Disaster Locations</h1>
        <p>Reports submitted by citizens.</p>
      </div>

      {reports.length === 0 ? (
        <p>No disaster reports available.</p>
      ) : (
        reports.map((report) => (
          <div className="report-item" key={report.id}>
            <h4>{report.type}</h4>
            <p>Location: {report.location}</p>
            <p>Details: {report.details}</p>
            <p>Status: {report.status}</p>
          </div>
        ))
      )}

      <button onClick={() => goTo("dashboard")}>Back to Dashboard</button>
    </>
  );

  // Volunteer tasks
  const renderVolunteerTasks = () => (
    <>
      <div className="dashboard-title">
        <h1>My Assigned Tasks</h1>
        <p>Update the progress of your tasks.</p>
      </div>

      {tasks.filter((task) => task.volunteerEmail === loggedUser.email).length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        tasks
          .filter((task) => task.volunteerEmail === loggedUser.email)
          .map((task) => (
            <div className="report-item" key={task.id}>
              <h4>{task.description}</h4>
              <p>Location: {task.location}</p>
              <p>Current Status: {task.status}</p>

              <label>Update Task Status</label>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
              >
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          ))
      )}

      <button onClick={() => goTo("dashboard")}>Back to Dashboard</button>
    </>
  );

  // Volunteer resources
  const renderVolunteerResources = () => (
    <>
      <div className="dashboard-title">
        <h1>Available Resources</h1>
        <p>Resources provided by the administration.</p>
      </div>

      {resources.length === 0 ? (
        <p>No resources available.</p>
      ) : (
        resources.map((resource) => (
          <div className="report-item" key={resource.id}>
            <h4>{resource.name}</h4>
            <p>Quantity: {resource.quantity}</p>
          </div>
        ))
      )}

      <button onClick={() => goTo("dashboard")}>Back to Dashboard</button>
    </>
  );

  // Admin dashboard
  const renderAdminDashboard = () => (
    <>
      <div className="dashboard-title">
        <span className="small-heading">ADMIN DASHBOARD</span>
        <h1>Welcome, {loggedUser.name}!</h1>
        <p>Manage disaster reports, volunteers, tasks and resources.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red-card">📢</div>
          <div>
            <h3>{reports.length}</h3>
            <p>Total Reports</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green-card">🙋</div>
          <div>
            <h3>{volunteers.length}</h3>
            <p>Total Volunteers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue-card">📋</div>
          <div>
            <h3>{tasks.length}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple-card">📦</div>
          <div>
            <h3>{resources.length}</h3>
            <p>Total Resources</p>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="dashboard-card">
          <div className="card-icon red-card">🚨</div>
          <h3>Reported Disasters</h3>
          <p>View reports and update their status.</p>

          <button onClick={() => goTo("adminReports")}>View Reports</button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon green-card">🙋</div>
          <h3>Volunteer Availability</h3>
          <p>View registered volunteers and their status.</p>

          <button onClick={() => goTo("adminVolunteers")}>
            View Volunteers
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon blue-card">📋</div>
          <h3>Assign Tasks</h3>
          <p>Assign tasks to registered volunteers.</p>

          <form onSubmit={handleAssignTask}>
            <input
              placeholder="Task Description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              required
            />

            <input
              placeholder="Task Location"
              value={taskData.location}
              onChange={(e) =>
                setTaskData({ ...taskData, location: e.target.value })
              }
              required
            />

            <select
              value={taskData.volunteerEmail}
              onChange={(e) =>
                setTaskData({ ...taskData, volunteerEmail: e.target.value })
              }
              required
            >
              <option value="">Select Volunteer</option>
              {volunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.email}>
                  {volunteer.name} ({volunteer.availability || "Available"})
                </option>
              ))}
            </select>

            <button type="submit">Assign Task</button>
          </form>
        </div>

        <div className="dashboard-card">
          <div className="card-icon purple-card">📦</div>
          <h3>Manage Resources</h3>
          <p>Add resources and manage available quantities.</p>

          <form onSubmit={handleAddResource}>
            <input
              placeholder="Resource Name"
              value={resourceData.name}
              onChange={(e) =>
                setResourceData({ ...resourceData, name: e.target.value })
              }
              required
            />

            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={resourceData.quantity}
              onChange={(e) =>
                setResourceData({ ...resourceData, quantity: e.target.value })
              }
              required
            />

            <button type="submit">Add Resource</button>
          </form>

          {resources.map((resource) => (
            <div className="report-item" key={resource.id}>
              <h4>{resource.name}</h4>
              <p>Quantity: {resource.quantity}</p>
              <button onClick={() => deleteResource(resource.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="dashboard-card">
          <div className="card-icon orange-card">🆘</div>
          <h3>Emergency Help Requests</h3>
          <p>View assistance requests submitted by citizens.</p>

          {helpRequests.length === 0 ? (
            <p>No help requests available.</p>
          ) : (
            helpRequests.map((request) => (
              <div className="report-item" key={request.id}>
                <h4>{request.name}</h4>
                <p>Location: {request.location}</p>
                <p>Details: {request.details}</p>
                <p>Status: {request.status}</p>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-icon blue-card">👥</div>
          <h3>Registered Accounts</h3>
          <p>View users and volunteers registered in the system.</p>

          <button onClick={() => goTo("adminAccounts")}>View Accounts</button>
        </div>
      </div>

      {showMessage()}
    </>
  );

  // Admin reports
  const renderAdminReports = () => (
    <>
      <div className="dashboard-title">
        <h1>Reported Disasters</h1>
        <p>Review reports and update their status.</p>
      </div>

      {reports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        reports.map((report) => (
          <div className="report-item" key={report.id}>
            <h4>{report.type}</h4>
            <p>Location: {report.location}</p>
            <p>Reported By: {report.reportedBy}</p>
            <p>Details: {report.details}</p>

            <label>Update Status</label>
            <select
              value={report.status}
              onChange={(e) =>
                updateReportStatus(report.id, e.target.value)
              }
            >
              <option>Reported</option>
              <option>Under Action</option>
              <option>Assistance Provided</option>
              <option>Resolved</option>
            </select>
          </div>
        ))
      )}

      <button onClick={() => goTo("dashboard")}>Back to Dashboard</button>
    </>
  );

  // Admin volunteers
  const renderAdminVolunteers = () => (
    <>
      <div className="dashboard-title">
        <h1>Volunteer Availability</h1>
        <p>View all registered volunteers.</p>
      </div>

      {volunteers.length === 0 ? (
        <p>No volunteers registered.</p>
      ) : (
        volunteers.map((volunteer) => (
          <div className="report-item" key={volunteer.id}>
            <h4>{volunteer.name}</h4>
            <p>Email: {volunteer.email}</p>
            <p>Availability: {volunteer.availability || "Available"}</p>
          </div>
        ))
      )}

      <button onClick={() => goTo("dashboard")}>Back to Dashboard</button>
    </>
  );

  // Admin accounts
  const renderAdminAccounts = () => (
    <>
      <div className="dashboard-title">
        <h1>Registered Accounts</h1>
        <p>All registered users and volunteers.</p>
      </div>

      {users.length === 0 ? (
        <p>No accounts registered.</p>
      ) : (
        users.map((user) => (
          <div className="report-item" key={user.id}>
            <h4>{user.name}</h4>
            <p>Role: {user.role}</p>
            <p>Email: {user.email}</p>
            <p>Mobile: {user.mobile || "Not provided"}</p>
          </div>
        ))
      )}

      <button onClick={() => goTo("dashboard")}>Back to Dashboard</button>
    </>
  );

  // Display dashboard based on role
  const renderDashboard = () => {
    if (!loggedUser) return renderHome();

    if (loggedUser.role === "user") return renderUserDashboard();

    if (loggedUser.role === "volunteer") {
      if (page === "volunteerReports") return renderVolunteerReports();
      if (page === "volunteerTasks") return renderVolunteerTasks();
      if (page === "volunteerResources") return renderVolunteerResources();

      return renderVolunteerDashboard();
    }

    if (loggedUser.role === "admin") {
      if (page === "adminReports") return renderAdminReports();
      if (page === "adminVolunteers") return renderAdminVolunteers();
      if (page === "adminAccounts") return renderAdminAccounts();

      return renderAdminDashboard();
    }

    return renderHome();
  };

  return (
    <>
      <header className="main-header">
        <div className="logo-area">
          <div className="logo-icon">🚨</div>
          <div>
            <h2>Disaster Management</h2>
            <span>Emergency Support System</span>
          </div>
        </div>

        <nav>
          <a href="#" onClick={() => goTo("home")}>Home</a>

          {!loggedUser && (
            <>
              <a href="#" onClick={() => goTo("login")}>Login</a>
              <a href="#" onClick={() => goTo("register")}>Register</a>
            </>
          )}

          {loggedUser && (
            <>
              <a href="#" onClick={() => goTo("dashboard")}>Dashboard</a>
              <a href="#" onClick={handleLogout}>Logout</a>
            </>
          )}
        </nav>
      </header>

      <main className="dashboard">
        {page === "home" && !loggedUser && renderHome()}
        {page === "login" && !loggedUser && renderLogin()}
        {page === "register" && !loggedUser && renderRegister()}

        {(page === "dashboard" ||
          page === "volunteerReports" ||
          page === "volunteerTasks" ||
          page === "volunteerResources" ||
          page === "adminReports" ||
          page === "adminVolunteers" ||
          page === "adminAccounts") &&
          renderDashboard()}
      </main>

      <footer>
        <div className="footer-content">
          <div>
            <h3>🚨 Disaster Management System</h3>
            <p>Working together for safer communities.</p>
          </div>

          <p>© 2026 Disaster Management System. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default App;

