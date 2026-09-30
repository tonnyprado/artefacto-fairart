/**
 * @typedef {import('pg').Pool} Pool
 * @typedef {import('../interfaces.js').RegistroArtistasLectura} RegistroArtistasLectura
 * @typedef {import('../../domain/modelos.js').Artista} Artista
 * @typedef {import('../../domain/modelos.js').Obra} Obra
 */

/**
 * Lee artistas y obras desde las vistas consigna.v_*.
 * @implements {RegistroArtistasLectura}
 */
export class PgRegistroArtistasLectura {
  /**
   * @param {Pool} pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * @param {string} edicion
   * @returns {Promise<Array<{id: string; nombre: string; correo: string}>>}
   */
  async seleccionadosSinInvitacion(edicion) {
    const r = await this.pool.query(`
      SELECT a.artista_id AS id, a.nombre, a.correo
      FROM consigna.v_artistas_seleccionados a
      WHERE NOT EXISTS (
        SELECT 1 FROM consigna.invitaciones i
        WHERE i.artista_id = a.artista_id AND i.edicion = $1
      )
      ORDER BY a.nombre
    `, [edicion]);
    return r.rows;
  }

  /**
   * @param {string} artistaId
   * @returns {Promise<Artista | null>}
   */
  async porId(artistaId) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.v_artistas_seleccionados WHERE artista_id = $1',
      [artistaId]
    );
    if (!r.rows.length) return null;
    const row = r.rows[0];
    return {
      id: row.artista_id,
      nombre: row.nombre,
      nombrePila: row.nombre_pila,
      apellido: row.apellido,
      rfc: row.rfc || '',
      folio: row.folio,
      paquete: row.paquete || '',
      correo: row.correo,
      telefono: row.telefono || '',
    };
  }

  /**
   * @param {string} artistaId
   * @returns {Promise<Obra[]>}
   */
  async obrasPostuladas(artistaId) {
    const r = await this.pool.query(
      `SELECT * FROM consigna.v_obras_postuladas
       WHERE artista_id = $1
       ORDER BY titulo`,
      [artistaId]
    );
    return r.rows.map(row => ({
      id: row.obra_id,
      artistaId: row.artista_id,
      titulo: row.titulo,
      tecnica: row.tecnica || '',
      medida: row.medida || '',
      gananciaRegistrada: parseFloat(row.ganancia_registrada) || 0,
    }));
  }
}
