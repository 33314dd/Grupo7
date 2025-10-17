const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas existentes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Importar rutas de favoritos
const favoriteRoutes = require('./routes/Favorites'); // ← Nota la F mayúscula
app.use('/api/favorites', favoriteRoutes); // ← AGREGAR ESTA LÍNEA

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

