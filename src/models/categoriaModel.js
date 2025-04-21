// models/categoriaModel.js
const db = require('../config/db');

const obtenerCategorias = async () => {
  const result = await db.query('SELECT * FROM categorias');
  return result.rows;
};

module.exports = {
  obtenerCategorias
};
