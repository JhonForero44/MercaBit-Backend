const { createUser, getUserByEmail } = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
const registerUser = async (req, res) => {
  const { cedula, nombre_usuario, email, password } = req.body;

  if (!cedula || !nombre_usuario || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const newUser = await createUser(cedula, nombre_usuario, email, password);
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

// Iniciar sesión (login) de un usuario
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar el JWT
    const token = jwt.sign({ id: user.usuario_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener el perfil de usuario (requiere autenticación)
const getUserProfile = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email); // Usamos el email del token
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({
      nombre_usuario: user.nombre_usuario,
      email: user.email,
      foto_usuario: user.foto_usuario,
      saldo: user.saldo
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
