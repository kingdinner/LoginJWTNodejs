// const express = require('express');
// const bodyParser = require('body-parser');
// const authRoutes = require('./routes/authRoutes');

// const app = express();
// const port = 3000;

// // Middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // Routes
// app.use('/auth', authRoutes);

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const SECRET_KEY = 'kingtest'; // Replace with your own secret key

// In-memory database (for demo purposes)
const users = [];

// Register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  
  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password' });
    }
    
    // Create a new user object
    const newUser = {
      username,
      password: hashedPassword,
    };
    
    // Save the user to the database
    users.push(newUser);
    
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login and generate JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find the user by username
  const user = users.find(user => user.username === username);
  
  // User not found
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  
  // Compare passwords
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error comparing passwords' });
    }
    
    if (!result) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '3h' });
    
    res.status(200).json({ token });
  });
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'You have accessed the protected route' });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    console.log(decoded)
    if (err) {
        console.log(err) 
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    req.user = decoded.username;
    next();
  });
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
