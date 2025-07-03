const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const notificationRoutes = require('./routes/notifications');
const eventRoutes = require('./routes/eventRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//mongodb connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Dummy user route to fix Navbar.js 404 error
app.get('/api/user', (req, res) => {
  res.json({ name: 'Guest User', email: 'guest@example.com' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

