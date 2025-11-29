require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// carpeta para imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catalogodb';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB conectado'))
  .catch(err => console.error('MongoDB error', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`API escuchando en http://localhost:${PORT}`));
