const express = require('express');
const router = express.Router();
const subastaController = require('../controllers/subastaController');

// Ruta para crear una nueva subasta
router.post('/create', subastaController.crearSubasta);

// Ruta para obtener todas las subastas
router.get('/', subastaController.obtenerSubastas);

// Ruta para obtener una subasta por ID
router.get('/:id', subastaController.obtenerSubastaPorId);

// Ruta para actualizar una subasta
router.put('/:id', subastaController.actualizarSubasta);

// Ruta para eliminar una subasta
router.delete('/:id', subastaController.eliminarSubasta);

module.exports = router;
