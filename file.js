const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = 4000;

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for session management (you may need to configure this)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Middleware for authentication
const authenticateUser = (req, res, next) => {
  const userRole = req.session.role || 'guest';

  if (userRole === 'user') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

const authenticateAdmin = (req, res, next) => {
  const userRole = req.session.role || 'guest';

  if (userRole === 'admin') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Simple in-memory database (replace with a real database)
const users = [
  { username: 'user1', password: 'password1', role: 'user' },
  { username: 'admin1', password: 'adminpassword1', role: 'admin' }
];

// Login form
app.get('/login', (req, res) => {
    fs.readFile('login.html', 'utf8', (err, data) => {
        if (err) {
          // Handle error, e.g., send an error message
          res.status(500).send('Error reading login.html');
        } else {
          // Send the HTML content as the response
          res.send(data);
        }
      });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authenticate user based on username and password
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.role = user.role; // Set the user's role in the session
    res.redirect('/dashboard');
  } else {
    res.status(401).send('Authentication failed');
  }
});

// Dashboard routes
app.get('/dashboard', authenticateUser, (req, res) => {
  res.send('User Dashboard');
});

app.get('/admin/dashboard', authenticateAdmin, (req, res) => {
  res.send('Admin Dashboard');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
