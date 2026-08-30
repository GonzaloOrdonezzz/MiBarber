import { supabase } from './supabase';

// Funciones de mapeo de base de datos Supabase a frontend
function mapCorteFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    clienteNombre: row.cliente_nombre,
    fecha: row.fecha,
    hora: typeof row.hora === 'string' ? row.hora.substring(0, 5) : row.hora,
    precio: Number(row.precio || 0),
    estadoPago: row.estado_pago || 'PENDIENTE',
    fechaPago: row.fecha_pago,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCorteToDB(corte) {
  const dbObj = {};
  if (corte.clienteNombre !== undefined) dbObj.cliente_nombre = corte.clienteNombre;
  if (corte.fecha !== undefined) dbObj.fecha = corte.fecha;
  if (corte.hora !== undefined) dbObj.hora = corte.hora.length === 5 ? corte.hora : corte.hora.substring(0, 5);
  if (corte.precio !== undefined) dbObj.precio = Number(corte.precio || 0);
  if (corte.estadoPago !== undefined) {
    dbObj.estado_pago = corte.estadoPago;
    if (corte.estadoPago === 'PAGADO') {
      dbObj.fecha_pago = new Date().toISOString();
    } else {
      dbObj.fecha_pago = null;
    }
  }
  return dbObj;
}

function getSemanaRange(fechaStr) {
  let d;
  if (fechaStr) {
    const [y, m, day] = fechaStr.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date();
  }

  const dayOfWeek = d.getDay(); // 0 = Domingo, ..., 6 = Sábado
  const inicio = new Date(d);
  inicio.setDate(d.getDate() - dayOfWeek);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);

  const format = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    fechaInicio: format(inicio),
    fechaFin: format(fin)
  };
}

export const api = {
  // 1. Cortes
  async getCortes() {
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (error) {
      console.error('Error getCortes:', error);
      throw new Error(error.message || 'Error al cargar cortes');
    }
    return (data || []).map(mapCorteFromDB);
  },

  async getCorte(id) {
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error getCorte ${id}:`, error);
      throw new Error(error.message || `Error al obtener corte ${id}`);
    }
    return mapCorteFromDB(data);
  },

  async getCortesPorFecha(fechaStr) {
    const fecha = fechaStr || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });

    if (error) {
      console.error('Error getCortesPorFecha:', error);
      throw new Error(error.message || 'Error al obtener cortes por fecha');
    }
    return (data || []).map(mapCorteFromDB);
  },

  async crearCorte(corte) {
    const hora = corte.hora ? (corte.hora.length === 5 ? corte.hora : corte.hora.substring(0, 5)) : '14:00';
    const payload = {
      cliente_nombre: corte.clienteNombre,
      fecha: corte.fecha,
      hora: hora,
      precio: Number(corte.precio || 0),
      estado_pago: corte.estadoPago || 'PENDIENTE',
      fecha_pago: corte.estadoPago === 'PAGADO' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('cortes')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error crearCorte:', error);
      throw new Error(error.message || 'Error al crear corte en Supabase');
    }
    return mapCorteFromDB(data);
  },

  async actualizarCorte(id, corte) {
    const payload = mapCorteToDB(corte);
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cortes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error actualizarCorte ${id}:`, error);
      throw new Error(error.message || 'Error al actualizar corte');
    }
    return mapCorteFromDB(data);
  },

  async eliminarCorte(id) {
    const { error } = await supabase
      .from('cortes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error eliminarCorte ${id}:`, error);
      throw new Error(error.message || 'Error al eliminar corte');
    }
    return true;
  },

  // 2. Pagos
  async cambiarEstadoPago(id, estadoPago) {
    const payload = {
      estado_pago: estadoPago,
      fecha_pago: estadoPago === 'PAGADO' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('cortes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error cambiarEstadoPago ${id}:`, error);
      throw new Error(error.message || 'Error al cambiar estado de pago');
    }
    return mapCorteFromDB(data);
  },

  async getPendientes() {
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .eq('estado_pago', 'PENDIENTE')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (error) {
      console.error('Error getPendientes:', error);
      throw new Error(error.message || 'Error al obtener cortes pendientes');
    }
    return (data || []).map(mapCorteFromDB);
  },

  async getDeudores() {
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .eq('estado_pago', 'NO_PAGADO')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (error) {
      console.error('Error getDeudores:', error);
      throw new Error(error.message || 'Error al obtener deudores');
    }
    return (data || []).map(mapCorteFromDB);
  },

  async getPagados() {
    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .eq('estado_pago', 'PAGADO')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (error) {
      console.error('Error getPagados:', error);
      throw new Error(error.message || 'Error al obtener cortes pagados');
    }
    return (data || []).map(mapCorteFromDB);
  },

  // 3. Vista y Resumen Semanal
  async getResumenSemanal(fechaStr) {
    const { fechaInicio, fechaFin } = getSemanaRange(fechaStr);

    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      console.error('Error getResumenSemanal:', error);
      throw new Error(error.message || 'Error al cargar resumen semanal');
    }

    const cortes = (data || []).map(mapCorteFromDB);
    const totalCortes = cortes.length;
    const cantidadPagados = cortes.filter(c => c.estadoPago === 'PAGADO').length;
    const cantidadNoPagados = cortes.filter(c => c.estadoPago === 'NO_PAGADO').length;
    const cantidadPendientes = cortes.filter(c => c.estadoPago === 'PENDIENTE').length;

    const totalCobrado = cortes
      .filter(c => c.estadoPago === 'PAGADO')
      .reduce((sum, c) => sum + c.precio, 0);

    const diezmo = Math.round(totalCobrado * 0.10 * 100) / 100;

    const totalDeuda = cortes
      .filter(c => c.estadoPago === 'NO_PAGADO')
      .reduce((sum, c) => sum + c.precio, 0);

    const totalPendiente = cortes
      .filter(c => c.estadoPago === 'PENDIENTE')
      .reduce((sum, c) => sum + c.precio, 0);

    return {
      fechaInicio,
      fechaFin,
      totalCortes,
      cantidadPagados,
      cantidadNoPagados,
      cantidadPendientes,
      totalCobrado,
      diezmo,
      totalDeuda,
      totalPendiente,
      cortes
    };
  },

  // 4. Estadísticas
  async getEstadisticasMensuales(anio) {
    const anioConsulta = anio || new Date().getFullYear();
    const inicioAnio = `${anioConsulta}-01-01`;
    const finAnio = `${anioConsulta}-12-31`;

    const { data, error } = await supabase
      .from('cortes')
      .select('*')
      .gte('fecha', inicioAnio)
      .lte('fecha', finAnio);

    if (error) {
      console.error('Error getEstadisticasMensuales:', error);
      throw new Error(error.message || 'Error al obtener estadísticas mensuales');
    }

    const cortes = (data || []).map(mapCorteFromDB);
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return nombresMeses.map((nombreMes, index) => {
      const mesNumero = index + 1;
      const mesStr = String(mesNumero).padStart(2, '0');
      const cortesMes = cortes.filter(c => {
        if (!c.fecha) return false;
        const [y, m] = c.fecha.split('-');
        return Number(y) === anioConsulta && m === mesStr;
      });

      const cantidadCortes = cortesMes.length;
      const ingresosTotales = cortesMes
        .filter(c => c.estadoPago === 'PAGADO')
        .reduce((sum, c) => sum + c.precio, 0);

      const totalPendiente = cortesMes
        .filter(c => c.estadoPago !== 'PAGADO')
        .reduce((sum, c) => sum + c.precio, 0);

      return {
        mes: mesNumero,
        nombreMes,
        anio: anioConsulta,
        cantidadCortes,
        ingresosTotales,
        totalPendiente
      };
    });
  },

  async getActividadAnual(anio) {
    const anioConsulta = anio || new Date().getFullYear();
    const inicioAnio = `${anioConsulta}-01-01`;
    const finAnio = `${anioConsulta}-12-31`;

    const { data, error } = await supabase
      .from('cortes')
      .select('fecha')
      .gte('fecha', inicioAnio)
      .lte('fecha', finAnio);

    if (error) {
      console.error('Error getActividadAnual:', error);
      throw new Error(error.message || 'Error al obtener actividad anual');
    }

    const conteoMap = new Map();
    (data || []).forEach(row => {
      if (row.fecha) {
        conteoMap.set(row.fecha, (conteoMap.get(row.fecha) || 0) + 1);
      }
    });

    const resultado = [];
    conteoMap.forEach((cantidadCortes, fecha) => {
      resultado.push({ fecha, cantidadCortes });
    });

    return resultado.sort((a, b) => a.fecha.localeCompare(b.fecha));
  },

  // 5. Totales
  async getTotales() {
    const { data, error } = await supabase
      .from('cortes')
      .select('precio, estado_pago');

    if (error) {
      console.error('Error getTotales:', error);
      throw new Error(error.message || 'Error al obtener totales');
    }

    const cortes = data || [];
    const totalHistoricoCobrado = cortes
      .filter(c => c.estado_pago === 'PAGADO')
      .reduce((sum, c) => sum + Number(c.precio || 0), 0);

    const totalHistoricoDeuda = cortes
      .filter(c => c.estado_pago === 'NO_PAGADO')
      .reduce((sum, c) => sum + Number(c.precio || 0), 0);

    const totalHistoricoPendiente = cortes
      .filter(c => c.estado_pago === 'PENDIENTE')
      .reduce((sum, c) => sum + Number(c.precio || 0), 0);

    const diezmo = Math.round(totalHistoricoCobrado * 0.10 * 100) / 100;

    return {
      totalHistoricoCobrado,
      totalHistoricoDeuda,
      totalHistoricoPendiente,
      diezmo
    };
  }
};
