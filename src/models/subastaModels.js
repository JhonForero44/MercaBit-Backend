const pool = require('../config/db');

// Función para crear una nueva subasta
const createSubasta = async (vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion) => {
  const query = `
    INSERT INTO subastas (vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING subasta_id, vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion, fecha_inicio, fecha_finalizacion, estado
  `;
  const values = [vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear subasta: ' + error.message);
  }
};

// Función para obtener todas las subastas
const getAllSubastas = async () => {
  const query = 'SELECT * FROM subastas';

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener subastas: ' + error.message);
  }
};

// Función para obtener una subasta por su ID
const getSubastaById = async (subasta_id) => {
  const query = 'SELECT * FROM subastas WHERE subasta_id = $1';
  const values = [subasta_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener subasta por ID: ' + error.message);
  }
};

// Función para actualizar una subasta
const updateSubasta = async (subasta_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion) => {
  const query = `
    UPDATE subastas
    SET titulo = $1, imagen_producto = $2, descripcion = $3, categoria_id = $4, precio_inicial = $5, precio_compra_inmediata = $6, duracion = $7
    WHERE subasta_id = $8
    RETURNING *;
  `;
  const values = [titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion, subasta_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar subasta: ' + error.message);
  }
};

// Función para eliminar una subasta
const deleteSubasta = async (subasta_id) => {
  const query = 'DELETE FROM subastas WHERE subasta_id = $1 RETURNING *';
  const values = [subasta_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar subasta: ' + error.message);
  }
};

module.exports = { createSubasta, getAllSubastas, getSubastaById, updateSubasta, deleteSubasta };
