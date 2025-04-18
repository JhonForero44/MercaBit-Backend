// src/models/transaccionesModel.js
const pool = require('../config/db'); // Asegúrate de que la ruta sea correcta

const obtenerComprasPorUsuario = async (usuario_id) => {
  const { rows } = await pool.query(`
    SELECT 
      t.transaccion_id,
      t.subasta_id,
      s.titulo,
      t.monto_total,
      t.fecha_pago
    FROM transacciones t
    JOIN subastas s ON t.subasta_id = s.subasta_id
    WHERE t.comprador_id = $1
    ORDER BY t.fecha_pago DESC
  `, [usuario_id]);

  return rows;
};

const obtenerVentasPorUsuario = async (usuario_id) => {
  const { rows } = await pool.query(`
    SELECT 
      t.transaccion_id,
      t.subasta_id,
      s.titulo,
      t.monto_total,
      t.fecha_pago
    FROM transacciones t
    JOIN subastas s ON t.subasta_id = s.subasta_id
    WHERE s.vendedor_id = $1
    ORDER BY t.fecha_pago DESC
  `, [usuario_id]);

  return rows;
};

// Función para registrar el pago en la transacción
async function registrarPago(transaccion_id, fecha_pago) {
  const { rows } = await pool.query(
    `UPDATE transacciones SET fecha_pago = $1 WHERE transaccion_id = $2 RETURNING *`,
    [fecha_pago, transaccion_id]
  );
  return rows[0];  // Devolvemos la transacción actualizada con la fecha de pago
}

module.exports = {
  obtenerComprasPorUsuario,
  obtenerVentasPorUsuario,
  registrarPago
};
