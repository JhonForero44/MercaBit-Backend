const { createSubasta, getAllSubastas, getSubastaById, updateSubasta, deleteSubasta } = require('../models/subastaModels');

// Crear una nueva subasta
exports.crearSubasta = async (req, res) => {
  const { vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion } = req.body;

  if (!vendedor_id || !titulo || !imagen_producto || !descripcion || !categoria_id || !precio_inicial || !duracion) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const newSubasta = await createSubasta(vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion);
    res.status(201).json({ message: 'Subasta creada exitosamente', subasta: newSubasta });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear subasta', error: error.message });
  }
};

// Obtener todas las subastas
exports.obtenerSubastas = async (req, res) => {
  try {
    const subastas = await getAllSubastas();
    res.json(subastas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener subastas', error: error.message });
  }
};

// Obtener una subasta por ID
exports.obtenerSubastaPorId = async (req, res) => {
  const subasta_id = req.params.id;

  try {
    const subasta = await getSubastaById(subasta_id);
    if (!subasta) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }
    res.json(subasta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener subasta', error: error.message });
  }
};

// Actualizar una subasta
exports.actualizarSubasta = async (req, res) => {
  const subasta_id = req.params.id;
  const { titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion } = req.body;

  try {
    const updatedSubasta = await updateSubasta(subasta_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion);
    res.json({ message: 'Subasta actualizada exitosamente', subasta: updatedSubasta });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar subasta', error: error.message });
  }
};

// Eliminar una subasta
exports.eliminarSubasta = async (req, res) => {
  const subasta_id = req.params.id;

  try {
    const deletedSubasta = await deleteSubasta(subasta_id);
    res.json({ message: 'Subasta eliminada exitosamente', subasta: deletedSubasta });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar subasta', error: error.message });
  }
};
