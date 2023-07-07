const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simulating database with in-memory storage
const users = [];

function register(req, res) {
  const { username, password } = req.body;
  console.log(req.body)

  // Check if user already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  // Create new user
  const newUser = new User(users.length + 1, username, password);
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
}

function login(req, res) {
  const { username, password } = req.body;

  // Check if user exists
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-key');

  res.json({ token });
}

module.exports = { register, login };
