const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use CORS middleware
app.use(cors());

// Open a database connection
const db = new sqlite3.Database('mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables if they don't exist
db.serialize(() => {
//   db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY AUTOINCREMENT, destination TEXT, start_date TEXT, end_date TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS reservations (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, trip_id INTEGER, reservation_date TEXT, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (trip_id) REFERENCES trips(id))');
});

// Add a new trip
app.post('/trips', (req, res) => {
  const { destination, start_date, end_date } = req.body;
  db.run('INSERT INTO trips (destination, start_date, end_date) VALUES (?, ?, ?)', [destination, start_date, end_date], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json(req.body);
    }
  });
});

// Get all trips
app.get('/trips', (req, res) => {
  db.all('SELECT * FROM trips', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Add a new reservation
app.post('/reservations', (req, res) => {
  const { user_id, trip_id, reservation_date } = req.body;
  db.run('INSERT INTO reservations (user_id, trip_id, reservation_date) VALUES (?, ?, ?)', [user_id, trip_id, reservation_date], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, user_id, trip_id, reservation_date });
    }
  });
});

// Get all reservations
app.get('/reservations', (req, res) => {
  db.all('SELECT * FROM reservations', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
