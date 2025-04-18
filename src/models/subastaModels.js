const pool = require('../config/db');

// Función para crear una nueva subasta
const createSubasta = async (vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion) => {
  const query = `
    INSERT INTO subastas (vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING subasta_id, vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion, fecha_inicio, fecha_finalizacion, estado
  `;
  const values = [vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear subasta: ' + error.message);
  }
};

// Función para obtener todas las subastas
const getAllSubastas = async () => {
  const query = 'SELECT * FROM subastas';

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener subastas: ' + error.message);
  }
};

// Función para obtener una subasta por su ID
const getSubastaById = async (subasta_id) => {
  const query = 'SELECT * FROM subastas WHERE subasta_id = $1';
  const values = [subasta_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener subasta por ID: ' + error.message);
  }
};

// Función para actualizar una subasta
const updateSubasta = async (subasta_id, vendedor_id, titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion) => {
  const query = `
    UPDATE subastas
    SET titulo = $1,
        imagen_producto = $2,
        descripcion = $3,
        categoria_id = $4,
        precio_inicial = $5,
        precio_compra_inmediata = $6,
        duracion = $7
    WHERE subasta_id = $8
      AND vendedor_id = $9
      AND estado = 'activa'
      AND numero_ofertas = 0
    RETURNING *;
  `;
  const values = [titulo, imagen_producto, descripcion, categoria_id, precio_inicial, precio_compra_inmediata, duracion, subasta_id, vendedor_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar subasta: ' + error.message);
  }
};

//Funcion para obtener una subastas por usuario
const getAuctionsBySeller = async (vendedor_id) => {
  const query = `
    SELECT s.*, c.nombre AS nombre_categoria
    FROM subastas s
    JOIN categorias c ON s.categoria_id = c.categoria_id
    WHERE s.vendedor_id = $1
    ORDER BY s.fecha_inicio DESC;
  `;

  try {
    const result = await pool.query(query, [vendedor_id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener subastas del vendedor: ' + error.message);
  }
};

// FUncion para cancelar una subasta
const cancelarSubasta = async (subasta_id, vendedor_id) => {
  const query = `
    UPDATE subastas
    SET estado = 'cancelada'
    WHERE subasta_id = $1 AND vendedor_id = $2 AND estado = 'activa'
    RETURNING *;
  `;
  try {
    const result = await pool.query(query, [subasta_id, vendedor_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al cancelar subasta: ' + error.message);
  }
};

// Funcion para saber si hay ofertas
const tieneOfertas = async (subasta_id) => {
  const query = `SELECT COUNT(*) FROM ofertas WHERE subasta_id = $1 AND estado = 'activa'`;
  const result = await pool.query(query, [subasta_id]);
  return parseInt(result.rows[0].count) > 0;
};

// Funcion para finalizar subasta una vez terminada
async function finalizarSubasta(subasta_id) {
  const { rows: ofertaGanadora } = await pool.query(
    `SELECT * FROM ofertas 
     WHERE subasta_id = $1 AND es_mas_alta = true 
     ORDER BY cantidad DESC LIMIT 1`,
    [subasta_id]
  );

  if (ofertaGanadora.length === 0) {
    // Nadie ofertó, solo marcamos como finalizada sin ganador
    await pool.query(
      `UPDATE subastas 
       SET estado = 'finalizada' 
       WHERE subasta_id = $1`,
      [subasta_id]
    );
    return { mensaje: "Subasta finalizada sin ofertas" };
  }

  const ganadora = ofertaGanadora[0];

  // Actualizar subasta con el ganador
  await pool.query(
    `UPDATE subastas 
     SET estado = 'vendida', usuario_ganador_id = $1, precio_final = $2 
     WHERE subasta_id = $3`,
    [ganadora.usuario_id, ganadora.cantidad, subasta_id]
  );

  // Crear notificación para el ganador
  await pool.query(
    `INSERT INTO notificaciones (usuario_id, subasta_id, oferta_id, mensaje, tipo)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      ganadora.usuario_id,
      subasta_id,
      ganadora.oferta_id,
      "¡Felicidades! Has ganado la subasta.",
      "ganador_subasta"
    ]
  );

  // (Opcional) Crear transacción
  await pool.query(
    `INSERT INTO transacciones (comprador_id, subasta_id, monto_total)
     VALUES ($1, $2, $3)`,
    [ganadora.usuario_id, subasta_id, ganadora.cantidad]
  );

  return { mensaje: "Subasta finalizada con ganador", ganador: ganadora };
}

const obtenerSubastaPorId = async (subasta_id) => {
  const query = 'SELECT * FROM subastas WHERE subasta_id = $1';
  const values = [subasta_id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];  // Asegúrate de que se devuelve un objeto de subasta
  } catch (error) {
    throw new Error('Error al obtener subasta por ID: ' + error.message);
  }
};

// Función para registrar la transacción en la tabla de transacciones
async function registrarTransaccion(subasta_id, comprador_id, monto_total) {
  const { rows } = await pool.query(
    `INSERT INTO transacciones (comprador_id, subasta_id, monto_total) 
     VALUES ($1, $2, $3) RETURNING *`,
    [comprador_id, subasta_id, monto_total]
  );
  return rows[0];  // Devolvemos la transacción creada
}

// Función para cerrar la subasta como vendida y asignar al usuario ganador
async function cerrarSubastaComoVendida(subasta_id, usuario_ganador_id) {
  const { rows } = await pool.query(
    `UPDATE subastas SET estado = 'vendida', usuario_ganador_id = $1 
     WHERE subasta_id = $2 RETURNING *`,
    [usuario_ganador_id, subasta_id]
  );
  return rows[0];  // Devolvemos la subasta actualizada
}

module.exports = { createSubasta, getAllSubastas, getSubastaById, updateSubasta, cancelarSubasta, getAuctionsBySeller, tieneOfertas, finalizarSubasta, obtenerSubastaPorId, registrarTransaccion, cerrarSubastaComoVendida};