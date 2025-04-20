const {
  crearOferta,
  obtenerOfertasPorSubasta,
  getAllOfertas,
  eliminarOferta,
  obtenerOfertasPorUsuario,
  obtenerOfertaMasAlta,
  actualizarEstadoOferta
} = require('../models/ofertaModels');

const { crearNotificacion } = require('../models/notificacionModel');

async function crearNuevaOferta(req, res) {
  const { subasta_id, cantidad } = req.body;
  const usuario_id = req.user.usuario_id;

  if (!subasta_id || !usuario_id || !cantidad) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    // 1. Obtener la oferta más alta actual para validar antes de crear la nueva
    const ofertaActual = await obtenerOfertaMasAlta(subasta_id);
    const montoActual = parseFloat(ofertaActual?.cantidad || 0);
    const montoNuevo = parseFloat(cantidad);

    if (montoNuevo <= montoActual) {
      return res.status(400).json({
        message: `La oferta debe ser mayor a la actual de $${montoActual}`,
      });
    }

    // 2. Crear la nueva oferta porque pasó la validación
    const nuevaOferta = await crearOferta(subasta_id, usuario_id, montoNuevo);

    // 3. Crear notificación al vendedor de la subasta
    const subasta = await obtenerSubastaPorId(subasta_id);
    const vendedor_id = subasta.vendedor_id;
    const mensajeVendedor = `Se ha realizado una nueva oferta de $${montoNuevo} en tu subasta: ${subasta.titulo}`;
    await crearNotificacion(vendedor_id, subasta_id, null, mensajeVendedor, 'nueva_oferta');

    // 4. Notificar al usuario cuya oferta fue superada, si existe
    if (ofertaActual.usuario_id && ofertaActual.usuario_id !== usuario_id) {
      const mensajeOfertaSuperada = `Tu oferta de $${montoActual} en la subasta "${subasta.titulo}" ha sido superada por una nueva oferta de $${montoNuevo}.`;
      await crearNotificacion(ofertaActual.usuario_id, subasta_id, ofertaActual.oferta_id, mensajeOfertaSuperada, 'oferta_superada');
    }

    res.status(201).json({ message: 'Oferta creada exitosamente', oferta: nuevaOferta });

  } catch (error) {
    res.status(500).json({ message: 'Error al crear oferta', error: error.message });
  }
}

// Obtener subastas por ID
async function obtenerSubastaPorId(subasta_id) {
  // Obtén la subasta usando el subasta_id
  const subasta = await Subasta.findByPk(subasta_id);
  return subasta;
}

// Obtener todas las ofertas de una subasta
async function obtenerOfertasDeSubasta(req, res) {
  try {
    const ofertas = await obtenerOfertasPorSubasta(req.params.subasta_id);
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ofertas', error: error.message });
  }
}

// Obtener todas las ofertas
async function obtenerTodasLasOfertas(req, res) {
  try {
    const ofertas = await getAllOfertas();
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ofertas', error: error.message });
  }
}

// Eliminar oferta (si está activa y es del usuario)
async function eliminarOfertaActiva(req, res) {
  const { oferta_id } = req.params;
  const usuario_id = req.user.usuario_id;

  try {
    const eliminada = await eliminarOferta(oferta_id, usuario_id);
    if (eliminada) {
      res.json({ message: 'Oferta eliminada con éxito' });
    } else {
      res.status(400).json({ message: 'No se pudo eliminar la oferta. Verifica el usuario o estado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar oferta', error: error.message });
  }
}

// Cambiar estado de una oferta
async function cambiarEstadoOferta(req, res) {
  const { oferta_id } = req.params;
  const { nuevoEstado } = req.body;

  try {
    const actualizada = await actualizarEstadoOferta(oferta_id, nuevoEstado);
    if (actualizada) {
      res.json({ message: 'Estado de la oferta actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Oferta no encontrada o no actualizada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado de la oferta', error: error.message });
  }
}

// Obtener la oferta más alta de una subasta
async function obtenerOfertaMasAltaDeSubasta(req, res) {
  try {
    const oferta = await obtenerOfertaMasAlta(req.params.subasta_id);
    res.json(oferta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la oferta más alta', error: error.message });
  }
}

// Historial de ofertas de un usuario
async function historialOfertasPorUsuario(req, res) {
  try {
    const ofertas = await obtenerOfertasPorUsuario(req.params.usuario_id);
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de ofertas', error: error.message });
  }
}

module.exports = {
  crearNuevaOferta,
  obtenerOfertasDeSubasta,
  obtenerTodasLasOfertas,
  eliminarOfertaActiva,
  cambiarEstadoOferta,
  obtenerOfertaMasAltaDeSubasta,
  historialOfertasPorUsuario
};
