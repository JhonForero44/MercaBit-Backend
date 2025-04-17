// src/routes/notificacionesRoutes.js
const express = require('express');
const router = express.Router();
const NotificacionesController = require('../controllers/notificacionesController');

// Crear una nueva notificación
router.post('/', NotificacionesController.crearNotificacion);

// Obtener todas las notificaciones de un usuario
router.get('/usuario/:usuario_id', NotificacionesController.getNotificacionesPorUsuario);

// Marcar una notificación como leída
router.patch('/:id/leida', NotificacionesController.marcarComoLeida);

// Marcar todas las notificaciones como leídas para un usuario
router.patch('/usuario/:usuario_id/leidas', NotificacionesController.marcarTodasComoLeidas);

module.exports = router;