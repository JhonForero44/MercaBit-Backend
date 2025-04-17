const Notificacion = require('../models/notificacionModel');

async function crearNotificacion(req, res) {
    try {
        const { usuario_id, subasta_id, oferta_id, mensaje, tipo } = req.body;

        if (!usuario_id || !subasta_id || !mensaje || !tipo) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        const subastaExiste = await SubastaModel.existeSubasta(subasta_id);
        if (!subastaExiste) {
            return res.status(400).json({ message: 'La subasta no existe' });
        }

        if (oferta_id) {
            const ofertaExiste = await OfertaModel.existeOferta(oferta_id);
            if (!ofertaExiste) {
                return res.status(400).json({ message: 'La oferta no existe' });
            }
        }

        const notificacion = await Notificacion.crearNotificacion(
            usuario_id,
            subasta_id,
            oferta_id,
            mensaje,
            tipo
        );

        res.json(notificacion);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear notificación', error: error.message });
    }
}

async function getNotificacionesPorUsuario(req, res) {
    try {
        const { usuario_id } = req.params;
        const notificaciones = await Notificacion.getNotificacionesPorUsuario(usuario_id);
        res.json(notificaciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
}

async function marcarComoLeida(req, res) {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.marcarComoLeida(id);
        res.json(notificacion);
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar como leída', error: error.message });
    }
}

async function marcarTodasComoLeidas(req, res) {
    try {
        const { usuario_id } = req.params;
        const notificaciones = await Notificacion.marcarTodasComoLeidas(usuario_id);
        res.json(notificaciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar todas como leídas', error: error.message });
    }
}

module.exports = {
    crearNotificacion,
    getNotificacionesPorUsuario,
    marcarComoLeida,
    marcarTodasComoLeidas,
};
