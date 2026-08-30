const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = `${API_BASE_URL}/api/cortes`;

export const api = {
  // 1. Cortes
  async getCortes() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Error al cargar la lista de cortes');
    return res.json();
  },

  async getCorte(id) {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`Error al obtener corte ${id}`);
    return res.json();
  },

  async getCortesPorFecha(fechaStr) {
    const url = fechaStr ? `${API_BASE}/dia?fecha=${fechaStr}` : `${API_BASE}/dia`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener cortes por fecha');
    return res.json();
  },

  async crearCorte(corte) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corte),
    });
    if (!res.ok) throw new Error('Error al crear el corte');
    return res.json();
  },

  async actualizarCorte(id, corte) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corte),
    });
    if (!res.ok) throw new Error('Error al actualizar el corte');
    return res.json();
  },

  async eliminarCorte(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar el corte');
    return true;
  },

  // 2. Pagos
  async cambiarEstadoPago(id, estadoPago) {
    const res = await fetch(`${API_BASE}/${id}/pago`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estadoPago }),
    });
    if (!res.ok) throw new Error('Error al cambiar estado de pago');
    return res.json();
  },

  async getPendientes() {
    const res = await fetch(`${API_BASE}/pendientes`);
    if (!res.ok) throw new Error('Error al obtener cortes pendientes');
    return res.json();
  },

  async getDeudores() {
    const res = await fetch(`${API_BASE}/deudores`);
    if (!res.ok) throw new Error('Error al obtener deudores');
    return res.json();
  },

  async getPagados() {
    const res = await fetch(`${API_BASE}/pagados`);
    if (!res.ok) throw new Error('Error al obtener cortes pagados');
    return res.json();
  },

  // 3. Vista y Resumen Semanal
  async getResumenSemanal(fechaStr) {
    const url = fechaStr ? `${API_BASE}/semana?fecha=${fechaStr}` : `${API_BASE}/semana`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar resumen semanal');
    return res.json();
  },

  // 4. Estadísticas
  async getEstadisticasMensuales(anio) {
    const url = anio ? `${API_BASE}/estadisticas/mensuales?anio=${anio}` : `${API_BASE}/estadisticas/mensuales`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener estadísticas mensuales');
    return res.json();
  },

  async getActividadAnual(anio) {
    const url = anio ? `${API_BASE}/estadisticas/actividad-anual?anio=${anio}` : `${API_BASE}/estadisticas/actividad-anual`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener actividad anual');
    return res.json();
  },

  // 5. Totales
  async getTotales() {
    const res = await fetch(`${API_BASE}/totales`);
    if (!res.ok) throw new Error('Error al obtener totales');
    return res.json();
  }
};
