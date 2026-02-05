const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Debugging: Log the environment variable
console.log('Configured FRONTEND_URL:', process.env.FRONTEND_URL);

app.use(cors({
  origin: (origin, callback) => {
    // specific logic to allow no origin (mobile apps, curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean).map(url => url.replace(/\/$/, '')); // Normalize: remove trailing slashes

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.log(`CORS Blocked: Origin ${origin} not in`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// DB
connectDb();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Ward-level Waste Management API running' });
});

app.use('/api/households', require('./routes/households'));
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/collectors', require('./routes/collectors'));
app.use('/api/incentives', require('./routes/incentives'));
app.use('/api/route', require('./routes/route'));
app.use('/api/seed', require('./routes/seed'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Global error handler (simple)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

