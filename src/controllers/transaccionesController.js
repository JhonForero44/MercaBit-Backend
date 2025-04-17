// src/controllers/transaccionesController.js
const transaccionesModel = require('../models/transaccionesModel');

const obtenerComprasPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const compras = await transaccionesModel.obtenerComprasPorUsuario(usuario_id);
    res.json(compras);
  } catch (err) {
    console.error('Error al obtener compras:', err);
    res.status(500).json({ error: 'Error al obtener las compras del usuario.' });
  }
};

const obtenerVentasPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const ventas = await transaccionesModel.obtenerVentasPorUsuario(usuario_id);
    res.json(ventas);
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    res.status(500).json({ error: 'Error al obtener las ventas del usuario.' });
  }
};

module.exports = {
  obtenerComprasPorUsuario,
  obtenerVentasPorUsuario,
};
