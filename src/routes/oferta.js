// src/routes/oferta.js
const express = require('express');
const router = express.Router();
const ofertaController = require('../controllers/ofertasController');

// Crea una nueva oferta.
router.post('/', ofertaController.crearNuevaOferta);

// Obtiene todas las ofertas.
router.get('/', ofertaController.obtenerTodasLasOfertas);

// Obtiene las ofertas de una subasta específica.
router.get('/subasta/:subasta_id', ofertaController.obtenerOfertasDeSubasta);

// Obtiene el historial de ofertas de un usuario específico.
router.get('/usuario/:usuario_id', ofertaController.historialOfertasPorUsuario);

// Obtiene la oferta más alta de una subasta específica.
router.get('/subasta/:subasta_id/mas-alta', ofertaController.obtenerOfertaMasAltaDeSubasta);

// Elimina una oferta activa.
router.delete('/:oferta_id', ofertaController.eliminarOfertaActiva);

// Cambia el estado de una oferta.
router.put('/:oferta_id', ofertaController.cambiarEstadoOferta);

module.exports = router;
