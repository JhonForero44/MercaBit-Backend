const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); // Middleware para verificar el token
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController'); // Importar las funciones del controlador

// Ruta para registro
router.post('/register', registerUser);

// Ruta para login
router.post('/login', loginUser);

// Ruta protegida para obtener perfil de usuario
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;
