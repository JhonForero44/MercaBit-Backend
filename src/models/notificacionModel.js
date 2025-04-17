const pool = require('../config/db');

// Crear una nueva notificación
async function crearNotificacion(usuario_id, subasta_id, oferta_id, mensaje, tipo) {
    const { rows } = await pool.query(
        `INSERT INTO notificaciones (usuario_id, subasta_id, oferta_id, mensaje, tipo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [usuario_id, subasta_id, oferta_id || null, mensaje, tipo]
    );
    return rows[0];
}

// Verificar si existe una subasta
async function existeSubasta(subasta_id) {
    const { rows } = await pool.query(
        'SELECT 1 FROM subastas WHERE subasta_id = $1',
        [subasta_id]
    );
    return rows.length > 0;
}

// Verificar si existe una oferta
async function existeOferta(oferta_id) {
    const { rows } = await pool.query(
        'SELECT 1 FROM ofertas WHERE oferta_id = $1',
        [oferta_id]
    );
    return rows.length > 0;
}

// Obtener notificaciones por usuario
async function getNotificacionesPorUsuario(usuario_id) {
    const { rows } = await pool.query(
        `SELECT n.*, s.titulo AS titulo_subasta
         FROM notificaciones n
         LEFT JOIN subastas s ON n.subasta_id = s.subasta_id
         WHERE n.usuario_id = $1
         ORDER BY n.fecha_envio DESC`,
        [usuario_id]
    );
    return rows;
}

// Marcar una notificación como leída
async function marcarComoLeida(notificacion_id) {
    const { rows } = await pool.query(
        `UPDATE notificaciones 
         SET estado = 'leida' 
         WHERE notificacion_id = $1 
         RETURNING *`,
        [notificacion_id]
    );
    return rows[0];
}

// Marcar todas las notificaciones de un usuario como leídas
async function marcarTodasComoLeidas(usuario_id) {
    const result = await pool.query(
        `UPDATE notificaciones
         SET estado = 'leida'
         WHERE usuario_id = $1 AND estado = 'no_leida'
         RETURNING *`,
        [usuario_id]
    );
    return result.rows;
}


module.exports = {
    crearNotificacion,
    getNotificacionesPorUsuario,
    marcarComoLeida,
    marcarTodasComoLeidas,
    existeOferta,
    existeSubasta
};
