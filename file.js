// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const jwt = require('jsonwebtoken');  // Import jsonwebtoken for JWT-based authentication

const app = express();
const port = 4000;

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Initialize session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30000,
  }
}));



// Sample users for demonstration
const users = [
  {
    username: 'user1',
    password: 'password1',
    role: 'user'
  },
  {
    username: 'admin1',
    password: 'adminpassword1',
    role: 'admin'
  }
];

// Login form route
app.get('/login', (req, res) => {
  fs.readFile('login.html', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading login.html');
    } else {
      res.send(data);
    }
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Set the user's role in the session
    req.session.role = user.role;

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user.username, role: user.role }, 'Arkx_key');
    res.setHeader('Authorization', token);
    // Attach the token to the 'Authorization' header and redirect to dashboard
    //console.log(token);
    if (req.session.role === 'admin') {
      res.redirect('/admin');
    }else{
      res.redirect('/dashboard');
      console.log(token);
    }

  } else {
    res.status(401).send('Authentication failed');
  }
});

// Middleware to check JWT
const checkJWT = (req, res, next) => {
  // Extract the token from the 'Authorization' header
  const token = req.headers;
  //console.log(token)
  // If no token is provided, deny access
  if (!token) return res.status(401).send('Access Denied');

  try {
    // Verify the token using the secret key
    const verified = jwt.verify(token, 'Arkx_key');

    // Attach the verified payload to the request object
    req.user = verified;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // If verification fails, deny access
    res.status(400).send('Invalid Token');
  }
};

// Dashboard route
app.get('/dashboard', checkJWT ,(req, res) => {
  res.send('User Dashboard');
});

app.get('/admin', checkJWT,(req, res) => {
  res.send('Admin Dashboard');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
