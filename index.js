// index.js
const express = require('express');
const app = express();
require('dotenv').config(); 
const authRoutes = require('./src/routes/auth');
const subastaRouter = require('./src/routes/subasta');
const ofertaRouter = require('./src/routes/oferta');
const notificacionRoutes = require('./src/routes/notificacion');

const PORT = process.env.PORT || 3000;

// Middleware para que el servidor entienda JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Bienvenido a Mercabit API');
});

// Registro de rutas
app.use('/auth', authRoutes); 
app.use('/api/subastas', subastaRouter);
app.use('/api/ofertas', ofertaRouter);
app.use('/api/notificaciones', notificacionRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
