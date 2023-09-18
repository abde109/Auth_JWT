// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for JWT-based authentication

const app = express();
const port = 4000;

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Initialize session middleware
app.use(session({
    secret: 'arkx',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 36000,
    }
}));



// Sample users for demonstration
const users = [{
        username: 'user1',
        password: 'password1',
        role: 'user'
    },
    {
        username: 'admin1',
        password: 'admin1',
        role: 'admin'
    }
];

// Login form route
app.get('/login', (req, res) => {
    fs.readFile('login.html', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading login.html');
        } else if (req.session.authorization) {
            if (req.session.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/dashboard');
            }
        } else {
            res.send(data);
        }
    });
});

// Login route
app.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Set the user's role in the session
        req.session.role = user.role;

        // Generate a JWT token for the user
        const token = jwt.sign({
            id: user.username,
            role: user.role
        }, 'Arkx_key');
        res.set('Authorization', token);

        req.session.authorization = token;
        // Attach the token to the 'Authorization' header and redirect to dashboard
        //console.log(token);
        if (req.session.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/dashboard');
        }

    } else {
        // res.status(401).send('Authentication failed');

        fs.readFile('./pages/wrongAuth.html', 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading wrongAuth.html');
            } else {
                res.send(data);
            }
        });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send('Error logging out');
        } else {
            // Redirect to the login page or any other desired destination after logout
            res.redirect('/login');
        }
    });
})

// app.post('/')

// Middleware to check JWT
const checkJWT = (req, res, next) => {
    // Extract the token from the 'Authorization' header
    const token = req.session.authorization;
    // If no token is provided, deny access
    
    if (!token) {
        fs.readFile('./pages/accessDenied.html', 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading accessDenied.html');
            } else {
                res.send(data);
            }
        });

    };

    try {
        // Verify the token using the secret key
        const verified = jwt.verify(token, 'Arkx_key');

        // Attach the verified payload to the request object
        req.user = verified;

        // Proceed to the next middleware or route handler
        console.log(verified);
        next();
    } catch (err) {
        // If verification fails, deny access
        // res.status(400).send('Invalid Token');

        fs.readFile('./pages/accessDenied.html', 'utf8', (err, data) => {
            if (err) {

                res.status(500).send('Error reading accessDenied.html');
            } else {
                res.send(data);
            }
        });
    }
};

// Dashboard route
app.get('/dashboard', checkJWT, (req, res) => {
    // res.send('User Dashboard');

    fs.readFile('./pages/userDashboard.html', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading userDahboard.html');
        } else if (req.session.authorization) {

            res.send(data);
        }
    });
});

app.get('/admin', checkJWT, (req, res) => {

    fs.readFile('./pages/adminDashboard.html', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading userDahboard.html');
        } else if (req.session.authorization) {

            res.send(data);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});