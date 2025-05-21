const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); // Middleware para verificar el token
const { registerUser, loginUser, getUserProfile, verifyEmail, resetPassword, requestPasswordReset,  } = require('../controllers/userController'); // Importar las funciones del controlador
const jwt = require('jsonwebtoken');  

// Ruta para registro
router.post('/register', registerUser);

// Ruta para login
router.post('/login', loginUser);

// Ruta protegida para obtener perfil de usuario
router.get('/profile', authenticateToken, getUserProfile);

//Verificar registro
router.get('/verify', verifyEmail); 

// Ruta para pedir recuperación
router.post('/request-password-reset', requestPasswordReset); 

// Ruta para restablecer la contraseña
router.post('/reset-password', resetPassword);  

router.get('/reset-password', (req, res) => {
  const { token } = req.query;  // Obtener el token de la URL
  if (!token) {
    return res.status(400).send('Token no proporcionado');  // Si no hay token
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado:', decoded);  // Para ver los datos del token
    
    // Redirigir al usuario a la página de restablecimiento de contraseña en el puerto 8080
    res.redirect(`http://localhost:8080/reset-password?token=${token}`);  
  } catch (error) {
    console.error('Error al verificar el token:', error);  // Si hay un error al verificar el token
    return res.status(400).send('Token inválido o expirado');  // Mostrar un mensaje si el token es inválido o expiró
  }
});

module.exports = router;
