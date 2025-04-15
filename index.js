// index.js
const express = require('express');
const app = express();
require('dotenv').config(); // Para leer las variables del .env

const PORT = process.env.PORT || 3000;

// Middleware para que el servidor entienda JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Bienvenido a Mercabit API');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
