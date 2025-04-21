const CategoriaModel = require('../models/categoriaModel');

const listarCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaModel.obtenerCategorias();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

module.exports = {
  listarCategorias
};
