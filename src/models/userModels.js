// src/models/user.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Función para registrar un usuario
const createUser = async (cedula, nombre_usuario, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Encriptamos la contraseña
  const query = `
    INSERT INTO usuarios (cedula, nombre_usuario, email, password_hash) 
    VALUES ($1, $2, $3, $4) 
    RETURNING usuario_id, cedula, nombre_usuario, email, foto_usuario, fecha_registro, saldo
  `;
  const values = [cedula, nombre_usuario, email, hashedPassword];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Retornamos el usuario registrado
  } catch (error) {
    throw new Error('Error al crear usuario: ' + error.message);
  }
};

// Función para obtener un usuario por email
const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM usuarios WHERE email = $1';
  const values = [email];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Retornamos el primer usuario encontrado
  } catch (error) {
    throw new Error('Error al obtener usuario: ' + error.message);
  }
};

module.exports = { createUser, getUserByEmail };
