// src/routes/transacciones.routes.js
const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transaccionesController');

// Historial de compras del usuario
router.get('/compras/:usuario_id', transaccionesController.obtenerComprasPorUsuario);

// Historial de ventas del usuario
router.get('/ventas/:usuario_id', transaccionesController.obtenerVentasPorUsuario);

module.exports = router;
