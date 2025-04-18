const { createSubasta, getAllSubastas, getSubastaById, updateSubasta, cancelarSubasta } = require('../models/subastaModels');

// Crear una nueva subasta
async function crearSubasta(req, res){
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
async function obtenerSubastas(req, res){
  try {
    const subastas = await getAllSubastas();
    res.json(subastas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener subastas', error: error.message });
  }
};

// Obtener una subasta por ID
async function obtenerSubastaPorId(req, res) {
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
}

//Obtener subasta por vendedor
async function obtenerSubastasPorVendedor(req, res){
  const vendedor_id = req.params.vendedorId;

  try {
    const subastas = await getAuctionsBySeller(vendedor_id);
    res.json(subastas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener subastas del vendedor', error: error.message });
  }
};

// Actualizar una subasta
async function actualizarSubasta(req, res){
  const subasta_id = req.params.id;
  const {
    vendedor_id,
    titulo,
    imagen_producto,
    descripcion,
    categoria_id,
    precio_inicial,
    precio_compra_inmediata,
    duracion
  } = req.body;

  if (!vendedor_id) {
    return res.status(400).json({ message: 'Falta el ID del vendedor' });
  }

  try {
    const updatedSubasta = await updateSubasta(subasta_id, vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion);

    if (!updatedSubasta) {
      return res.status(403).json({
        message: 'No puedes modificar esta subasta (puede no ser tuya, no estar activa o ya tener ofertas)'
      });
    }

    res.json({ message: 'Subasta actualizada exitosamente', subasta: updatedSubasta });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar subasta', error: error.message });
  }
};

//Cancelar una subasta
async function cancelar_Subasta (req, res) {
  const subasta_id = req.params.id;
  const usuario_id = req.usuario_id; // asumiendo que usás auth middleware

  try {
    const subasta = await getSubastaById(subasta_id);
    if (!subasta) return res.status(404).json({ message: 'Subasta no encontrada' });

    if (subasta.vendedor_id !== parseInt(usuario_id)) {
      return res.status(403).json({ message: 'No autorizado para cancelar esta subasta' });
    }

    if (subasta.estado !== 'activa') {
      return res.status(400).json({ message: 'Solo se pueden cancelar subastas activas' });
    }

    const ofertasActivas = await tieneOfertas(subasta_id);
    if (ofertasActivas) {
      return res.status(400).json({ message: 'No se puede cancelar una subasta con ofertas activas' });
    }

    const subastaCancelada = await cancelarSubasta(subasta_id);
    res.json({ message: 'Subasta cancelada exitosamente', subasta: subastaCancelada });

  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar subasta', error: error.message });
  }
};

// Función para finalizar la subasta
async function finalizar_Subasta(req, res) {
  const subasta_id = req.params.id;

  try {
    // Obtener la subasta por ID
    const subasta = await getSubastaById(subasta_id);

    if (!subasta) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    if (subasta.estado === 'finalizada') {
      return res.status(400).json({ message: 'La subasta ya está finalizada' });
    }

    // Cambiar el estado de la subasta a finalizada
    const updatedSubasta = await updateSubasta(subasta_id, subasta.titulo, subasta.imagen_producto, subasta.descripcion, subasta.categoria_id, subasta.precio_inicial, subasta.precio_compra_inmediata, subasta.duracion);

    // Si hay un ganador, crear la notificación
    if (subasta.usuario_ganador_id) {
      const mensaje = `¡Felicidades! Has ganado la subasta "${subasta.titulo}".`;
      await crearNotificacion(subasta.usuario_ganador_id, subasta.subasta_id, mensaje, 'ganador_subasta');
    }

    // También puedes agregar una notificación al vendedor si lo deseas
    const mensajeVendedor = `La subasta "${subasta.titulo}" ha sido finalizada.`;
    await crearNotificacion(subasta.vendedor_id, subasta.subasta_id, mensajeVendedor, 'vendedor_subasta');

    res.json({ message: 'Subasta finalizada exitosamente', subasta: updatedSubasta });
  } catch (error) {
    res.status(500).json({ message: 'Error al finalizar subasta', error: error.message });
  }
};

module.exports = {
  finalizar_Subasta,
  cancelar_Subasta,
  crearSubasta, 
  obtenerSubastas,
  obtenerSubastaPorId, 
  obtenerSubastasPorVendedor, 
  actualizarSubasta
};