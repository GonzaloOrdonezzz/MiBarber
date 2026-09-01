import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  Calendar, 
  CalendarDays,
  DollarSign, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Percent, 
  Users, 
  Clock,
  Sun,
  Moon,
  Flame,
  Check,
  BarChart3,
  Award,
  Activity
} from 'lucide-react';
import { api } from './services/api';

// Horas disponibles (07 a 22 hs) y minutos en saltos de 10 min
const HORAS = Array.from({ length: 16 }, (_, i) => String(i + 7).padStart(2, '0'));
const MINUTOS = ['00', '10', '20', '30', '40', '50'];
const MESES_ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function App() {
  const [activeTab, setActiveTab] = useState('semana'); // 'semana' | 'pagos' | 'estadisticas'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Sistema de Temas (Ivory & Leather / Espresso & Dark Leather)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('mibarber-theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mibarber-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Datos Semanales
  const [resumenSemanal, setResumenSemanal] = useState({
    totalCortes: 0,
    cantidadPagados: 0,
    cantidadNoPagados: 0,
    cantidadPendientes: 0,
    totalCobrado: 0,
    diezmo: 0,
    totalDeuda: 0,
    totalPendiente: 0,
    cortes: [],
    fechaInicio: '',
    fechaFin: ''
  });

  // Datos Pagos
  const [filtroPago, setFiltroPago] = useState('DEUDORES'); // 'TODOS' | 'DEUDORES' | 'PENDIENTES' | 'PAGADOS'
  const [listaPagos, setListaPagos] = useState([]);
  const [totalesGlobales, setTotalesGlobales] = useState({
    totalMesCobrado: 0,
    diezmoMes: 0,
    cantidadPagadosMes: 0,
    nombreMesActual: '',
    totalHistoricoCobrado: 0,
    diezmoHistorico: 0,
    totalHistoricoDeuda: 0,
    totalHistoricoPendiente: 0,
    diezmo: 0
  });

  // Datos Estadísticas & Heatmap
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [estadisticasMensuales, setEstadisticasMensuales] = useState([]);
  const [actividadAnual, setActividadAnual] = useState([]);
  const [metricaGrafico, setMetricaGrafico] = useState('INGRESOS'); // 'INGRESOS' | 'CORTES' | 'DIEZMO' | 'PENDIENTE'
  const [mesSeleccionadoGrafico, setMesSeleccionadoGrafico] = useState(null);

  // Estado Tooltip Heatmap
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, fecha: '', cantidad: 0 });

  // Estado Modal Formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [corteEnEdicion, setCorteEnEdicion] = useState(null);
  const [formData, setFormData] = useState({
    clienteNombre: '',
    fecha: '',
    horaParte: '14',
    minutoParte: '00',
    precio: '',
    estadoPago: 'PENDIENTE'
  });

  // Estado para el Planificador: Calendario Mensual Interactivo & Formulario Rápido
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [mesCalendario, setMesCalendario] = useState(() => new Date());
  const [quickForm, setQuickForm] = useState({
    clienteNombre: '',
    precio: '9000',
    horaParte: '14',
    minutoParte: '00',
    estadoPago: 'PENDIENTE'
  });
  const [guardandoTurno, setGuardandoTurno] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [cortesDiaSeleccionado, setCortesDiaSeleccionado] = useState([]);

  const [loading, setLoading] = useState(false);

  // Formatear fecha a YYYY-MM-DD
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formatear fecha larga en español (Ej: "Viernes, 28 de Agosto de 2026")
  const formatearFechaLarga = (fechaStr) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const str = fecha.toLocaleDateString('es-AR', opciones);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Formatear moneda
  const formatMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto || 0);
  };

  // Cargar turnos de un día específico
  const cargarCortesDia = async (fechaStr) => {
    if (!fechaStr) return;
    try {
      const data = await api.getCortesPorFecha(fechaStr);
      setCortesDiaSeleccionado(data);
    } catch (err) {
      console.error('Error al cargar turnos del día:', err);
    }
  };

  // Cargar actividad anual para el Heatmap
  const cargarActividad = async (anio) => {
    try {
      const data = await api.getActividadAnual(anio);
      setActividadAnual(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Cargar datos según pestaña
  const cargarDatosSemana = async (fechaObj) => {
    try {
      setLoading(true);
      const fechaStr = formatLocalDate(fechaObj);
      const [resumen, actividad] = await Promise.all([
        api.getResumenSemanal(fechaStr),
        api.getActividadAnual(fechaObj.getFullYear())
      ]);
      setResumenSemanal(resumen);
      setActividadAnual(actividad);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosPagos = async () => {
    try {
      setLoading(true);
      if (filtroPago === 'DEUDORES') {
        const data = await api.getDeudores();
        setListaPagos(data);
      } else if (filtroPago === 'PENDIENTES') {
        const data = await api.getPendientes();
        setListaPagos(data);
      } else if (filtroPago === 'PAGADOS') {
        const data = await api.getPagados();
        setListaPagos(data);
      } else {
        const data = await api.getCortes();
        setListaPagos(data);
      }
      const totales = await api.getTotales();
      setTotalesGlobales(totales);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async (anio) => {
    try {
      setLoading(true);
      const [dataMensual, dataActividad] = await Promise.all([
        api.getEstadisticasMensuales(anio),
        api.getActividadAnual(anio)
      ]);
      setEstadisticasMensuales(dataMensual);
      setActividadAnual(dataActividad);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'semana') {
      cargarDatosSemana(currentDate);
      cargarCortesDia(fechaSeleccionada);
    } else if (activeTab === 'pagos') {
      cargarDatosPagos();
    } else if (activeTab === 'estadisticas') {
      cargarEstadisticas(anioSeleccionado);
    }
  }, [activeTab, currentDate, filtroPago, anioSeleccionado, fechaSeleccionada]);

  // Generación de celdas para el Calendario Heatmap de 52-53 semanas (CSS Grid)
  const mapaActividad = useMemo(() => {
    const mapa = new Map();
    actividadAnual.forEach((item) => {
      mapa.set(item.fecha, item.cantidadCortes);
    });
    return mapa;
  }, [actividadAnual]);

  const anioActivoHeatmap = activeTab === 'semana' ? currentDate.getFullYear() : anioSeleccionado;

  const totalCortesAnual = useMemo(() => {
    return actividadAnual.reduce((acc, curr) => acc + curr.cantidadCortes, 0);
  }, [actividadAnual]);

  // Resumen anual consolidado para tarjetas KPI
  const resumenAnual = useMemo(() => {
    const totalCobrado = estadisticasMensuales.reduce((acc, curr) => acc + (curr.ingresosTotales || 0), 0);
    const totalCortes = estadisticasMensuales.reduce((acc, curr) => acc + (curr.cantidadCortes || 0), 0);
    const totalDiezmo = Math.round(totalCobrado * 0.10 * 100) / 100;
    const totalPendiente = estadisticasMensuales.reduce((acc, curr) => acc + (curr.totalPendiente || 0), 0);

    let mesPico = null;
    let maxIngreso = -1;
    estadisticasMensuales.forEach((stat) => {
      if (stat.ingresosTotales > maxIngreso && stat.ingresosTotales > 0) {
        maxIngreso = stat.ingresosTotales;
        mesPico = stat;
      }
    });

    return {
      totalCobrado,
      totalCortes,
      totalDiezmo,
      totalPendiente,
      mesPico
    };
  }, [estadisticasMensuales]);

  // Datos normalizados y calculados para las barras del histograma
  const datosHistograma = useMemo(() => {
    let maxValor = 0;
    const items = estadisticasMensuales.map((stat) => {
      let valor = 0;
      if (metricaGrafico === 'INGRESOS') valor = stat.ingresosTotales || 0;
      else if (metricaGrafico === 'CORTES') valor = stat.cantidadCortes || 0;

      if (valor > maxValor) maxValor = valor;

      return {
        ...stat,
        valor
      };
    });

    const now = new Date();
    const esAnioActual = anioSeleccionado === now.getFullYear();
    const mesActualNumero = now.getMonth() + 1;

    return items.map((item) => {
      const porcentaje = maxValor > 0 ? Math.max((item.valor / maxValor) * 100, item.valor > 0 ? 8 : 2) : 2;
      const esMesActual = esAnioActual && item.mes === mesActualNumero;
      const esMesPico = maxValor > 0 && item.valor === maxValor && item.valor > 0;
      return {
        ...item,
        porcentaje,
        esMesActual,
        esMesPico
      };
    });
  }, [estadisticasMensuales, metricaGrafico, anioSeleccionado]);

  // Mes actualmente seleccionado o activo en el histograma
  const mesActivo = useMemo(() => {
    if (mesSeleccionadoGrafico) {
      // Buscar la versión actualizada del mes seleccionado
      const actualizado = datosHistograma.find((d) => d.mes === mesSeleccionadoGrafico.mes);
      if (actualizado) return actualizado;
    }
    // Por defecto el mes actual si es el año en curso, o el mes con mayor actividad, o el primer mes
    const mesActual = datosHistograma.find((d) => d.esMesActual);
    if (mesActual) return mesActual;
    const mesConDatos = datosHistograma.find((d) => d.valor > 0);
    return mesConDatos || datosHistograma[0] || null;
  }, [mesSeleccionadoGrafico, datosHistograma]);

  const { diasHeatmap, mesesPosiciones, totalSemanas } = useMemo(() => {
    const anio = anioActivoHeatmap;
    const primerDia = new Date(anio, 0, 1, 12, 0, 0);
    const ultimoDia = new Date(anio, 11, 31, 12, 0, 0);

    // Ajustar para que la semana empiece en Domingo (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const offsetDomingo = primerDia.getDay();

    const lista = [];
    // Celdas de padding inicial
    for (let i = 0; i < offsetDomingo; i++) {
      lista.push({ key: `pad-start-${i}`, padding: true });
    }

    // Días reales del año
    let cursor = new Date(primerDia);
    while (cursor <= ultimoDia) {
      const fechaStr = formatLocalDate(cursor);
      const cantidad = mapaActividad.get(fechaStr) || 0;
      lista.push({
        key: fechaStr,
        fechaStr,
        fechaObj: new Date(cursor),
        cantidad,
        padding: false
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Padding final hasta completar la última columna de 7 días
    let padEndCount = 0;
    while (lista.length % 7 !== 0) {
      lista.push({ key: `pad-end-${padEndCount++}`, padding: true });
    }

    const semanas = Math.ceil(lista.length / 7);

    // Calcular la posición exacta de cada uno de los 12 meses
    const meses = [];
    let ultimoMesVisto = -1;

    lista.forEach((item, index) => {
      if (!item.padding && item.fechaObj) {
        const mesIndex = item.fechaObj.getMonth();
        if (mesIndex !== ultimoMesVisto) {
          const colIndex = Math.floor(index / 7) + 1; // 1-indexed para CSS Grid
          meses.push({
            mes: mesIndex,
            nombre: MESES_ABR[mesIndex],
            columnaInicio: colIndex
          });
          ultimoMesVisto = mesIndex;
        }
      }
    });

    return {
      diasHeatmap: lista,
      mesesPosiciones: meses,
      totalSemanas: semanas
    };
  }, [anioActivoHeatmap, mapaActividad]);

  // Nivel de intensidad (0: 0 cortes, 1: 1-3, 2: 4-7, 3: 8+)
  const calcularNivel = (cantidad) => {
    if (!cantidad || cantidad === 0) return 0;
    if (cantidad <= 3) return 1;
    if (cantidad <= 7) return 2;
    return 3;
  };

  // Generación de celdas para el Calendario Mensual Interactivo (Domingo a Sábado)
  const diasCalendarioMensual = useMemo(() => {
    const anio = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();

    const primerDia = new Date(anio, mes, 1);
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    // Offset Domingo (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const offsetDomingo = primerDia.getDay();

    const lista = [];

    // Celdas de padding inicial
    for (let i = 0; i < offsetDomingo; i++) {
      lista.push({ key: `pad-m-start-${i}`, padding: true });
    }

    // Días reales del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const cantidad = mapaActividad.get(fechaStr) || 0;
      const isToday = fechaStr === formatLocalDate(new Date());
      const isSelected = fechaStr === fechaSeleccionada;

      lista.push({
        key: fechaStr,
        numeroDia: dia,
        fechaStr,
        cantidad,
        isToday,
        isSelected,
        padding: false
      });
    }

    // Padding final para completar filas de 7 columnas
    let padEndCount = 0;
    while (lista.length % 7 !== 0) {
      lista.push({ key: `pad-m-end-${padEndCount++}`, padding: true });
    }

    return lista;
  }, [mesCalendario, mapaActividad, fechaSeleccionada]);

  // Cantidad de cortes en la fecha seleccionada
  const totalCortesDiaSeleccionado = useMemo(() => {
    return mapaActividad.get(fechaSeleccionada) || 0;
  }, [mapaActividad, fechaSeleccionada]);

  // Manejadores del Calendario Mensual
  const cambiarMesCalendario = (delta) => {
    const nuevoMes = new Date(mesCalendario);
    nuevoMes.setMonth(nuevoMes.getMonth() + delta);
    setMesCalendario(nuevoMes);
  };

  const irMesActualCalendario = () => {
    const hoy = new Date();
    setMesCalendario(hoy);
    const hoyStr = formatLocalDate(hoy);
    setFechaSeleccionada(hoyStr);
    setCurrentDate(hoy);
  };

  const seleccionarDiaCalendario = (dia) => {
    if (dia.padding) return;
    setFechaSeleccionada(dia.fechaStr);
    const [y, m, d] = dia.fechaStr.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, d));
  };

  const guardarTurnoRapido = async (e) => {
    e.preventDefault();
    if (!quickForm.clienteNombre.trim()) {
      alert('Por favor ingresá el nombre del cliente.');
      return;
    }
    if (!quickForm.precio || isNaN(quickForm.precio) || Number(quickForm.precio) <= 0) {
      alert('Por favor ingresá un precio válido.');
      return;
    }

    const payload = {
      clienteNombre: quickForm.clienteNombre.trim(),
      fecha: fechaSeleccionada,
      hora: `${quickForm.horaParte}:${quickForm.minutoParte}:00`,
      precio: parseFloat(quickForm.precio),
      estadoPago: quickForm.estadoPago || 'PENDIENTE'
    };

    try {
      setGuardandoTurno(true);
      await api.crearCorte(payload);
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3500);

      // Limpiar el nombre para registrar el siguiente turno manteniendo la fecha seleccionada
      setQuickForm((prev) => ({
        ...prev,
        clienteNombre: ''
      }));

      const [y, m, d] = fechaSeleccionada.split('-').map(Number);
      const fechaObj = new Date(y, m - 1, d);
      setCurrentDate(fechaObj);

      // Recargar turnos del día seleccionado, datos de la semana y mapa anual
      await Promise.all([
        cargarCortesDia(fechaSeleccionada),
        cargarDatosSemana(fechaObj),
        cargarActividad(fechaObj.getFullYear())
      ]);
    } catch (err) {
      alert('Error al registrar el turno: ' + (err.message || 'Verifique la conexión con el servidor'));
    } finally {
      setGuardandoTurno(false);
    }
  };

  // Manejo de Tooltip flotante
  const handleMouseEnter = (e, dia) => {
    if (dia.padding) return;
    const rect = e.target.getBoundingClientRect();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const fechaTexto = dia.fechaObj.toLocaleDateString('es-AR', opciones);
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      fecha: fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1),
      cantidad: dia.cantidad
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Navegación de semanas
  const cambiarSemana = (dias) => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setCurrentDate(nuevaFecha);
  };

  const irSemanaActual = () => {
    const hoy = new Date();
    setCurrentDate(hoy);
    setFechaSeleccionada(formatLocalDate(hoy));
  };

  // Cambiar estado de pago directamente
  const cambiarEstadoPagoCorte = async (corte, nuevoEstado) => {
    try {
      await api.cambiarEstadoPago(corte.id, nuevoEstado);
      if (activeTab === 'semana') {
        await Promise.all([
          cargarDatosSemana(currentDate),
          cargarCortesDia(fechaSeleccionada),
          cargarActividad(currentDate.getFullYear())
        ]);
      } else if (activeTab === 'pagos') {
        cargarDatosPagos();
      }
    } catch (err) {
      alert('Error al actualizar el estado de pago');
    }
  };

  // Alternar estado de pago en ciclo (1-click: PENDIENTE -> PAGADO -> NO_PAGADO -> PENDIENTE)
  const alternarPago = async (corte) => {
    let nuevoEstado = 'PAGADO';
    if (corte.estadoPago === 'PENDIENTE') {
      nuevoEstado = 'PAGADO';
    } else if (corte.estadoPago === 'PAGADO') {
      nuevoEstado = 'NO_PAGADO';
    } else {
      nuevoEstado = 'PENDIENTE';
    }
    await cambiarEstadoPagoCorte(corte, nuevoEstado);
  };

  // Abrir Modal Crear/Editar
  const abrirModalCrear = () => {
    setCorteEnEdicion(null);
    setFormData({
      clienteNombre: '',
      fecha: fechaSeleccionada || formatLocalDate(currentDate),
      horaParte: '14',
      minutoParte: '00',
      precio: '9000',
      estadoPago: 'PENDIENTE'
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (corte) => {
    setCorteEnEdicion(corte);
    let horaH = '14';
    let minM = '00';
    if (corte.hora) {
      const partes = corte.hora.split(':');
      horaH = partes[0] ? partes[0].padStart(2, '0') : '14';
      const minNum = parseInt(partes[1] || '0', 10);
      const minRedondeado = String(Math.round(minNum / 10) * 10).padStart(2, '0');
      minM = MINUTOS.includes(minRedondeado) ? minRedondeado : '00';
    }

    setFormData({
      clienteNombre: corte.clienteNombre,
      fecha: corte.fecha,
      horaParte: horaH,
      minutoParte: minM,
      precio: corte.precio,
      estadoPago: corte.estadoPago
    });
    setModalAbierto(true);
  };

  const guardarCorte = async (e) => {
    e.preventDefault();
    if (!formData.clienteNombre || !formData.fecha || !formData.precio) {
      alert('Por favor completá todos los campos requeridos.');
      return;
    }

    const payload = {
      clienteNombre: formData.clienteNombre,
      fecha: formData.fecha,
      hora: `${formData.horaParte}:${formData.minutoParte}:00`,
      precio: parseFloat(formData.precio),
      estadoPago: formData.estadoPago || 'PENDIENTE'
    };

    try {
      if (corteEnEdicion) {
        await api.actualizarCorte(corteEnEdicion.id, payload);
      } else {
        await api.crearCorte(payload);
      }
      setModalAbierto(false);

      const [y, m, d] = formData.fecha.split('-').map(Number);
      const fechaObj = new Date(y, m - 1, d);
      setCurrentDate(fechaObj);
      setFechaSeleccionada(formData.fecha);

      if (activeTab === 'semana') {
        await Promise.all([
          cargarDatosSemana(fechaObj),
          cargarCortesDia(formData.fecha),
          cargarActividad(fechaObj.getFullYear())
        ]);
      } else if (activeTab === 'pagos') {
        cargarDatosPagos();
      }
    } catch (err) {
      alert('Error al guardar el corte: ' + (err.message || 'Verifique la conexión con el servidor'));
    }
  };

  const eliminarCorte = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el corte de "${nombre}"?`)) {
      try {
        await api.eliminarCorte(id);
        if (activeTab === 'semana') {
          await Promise.all([
            cargarDatosSemana(currentDate),
            cargarCortesDia(fechaSeleccionada),
            cargarActividad(currentDate.getFullYear())
          ]);
        } else if (activeTab === 'pagos') {
          cargarDatosPagos();
        }
      } catch (err) {
        alert('Error al eliminar el corte');
      }
    }
  };

  // Componente de Renderizado del Mapa de Calor Anual
  const renderHeatmapSection = (titulo = `Mapa de Actividad Anual (${totalCortesAnual} cortes en ${anioActivoHeatmap})`) => (
    <section className="content-section">
      <div className="section-header">
        <h2 className="section-title">
          <Flame size={20} color="var(--accent-color)" />
          {titulo}
        </h2>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-wrapper">
          {/* Fila superior de nombres de meses alineados exactamente con cada columna */}
          <div className="heatmap-header-row">
            <div className="heatmap-corner-spacer" />
            <div
              className="heatmap-months-grid"
              style={{ gridTemplateColumns: `repeat(${totalSemanas}, 13px)` }}
            >
              {mesesPosiciones.map((item) => (
                <span
                  key={item.mes}
                  className="heatmap-month-label"
                  style={{ gridColumnStart: item.columnaInicio }}
                >
                  {item.nombre}
                </span>
              ))}
            </div>
          </div>

          <div className="heatmap-body">
            {/* Etiquetas de días de la semana (Dom a Sáb) */}
            <div className="heatmap-days-labels">
              <span>Dom</span>
              <span></span>
              <span>Mar</span>
              <span></span>
              <span>Jue</span>
              <span></span>
              <span>Sáb</span>
            </div>

            {/* Cuadrícula CSS Grid de columnas x 7 filas */}
            <div
              className="heatmap-grid"
              style={{ gridTemplateColumns: `repeat(${totalSemanas}, 13px)` }}
            >
              {diasHeatmap.map((dia) => (
                <div
                  key={dia.key}
                  className="heatmap-cell"
                  data-level={dia.padding ? '0' : calcularNivel(dia.cantidad)}
                  style={{ visibility: dia.padding ? 'hidden' : 'visible' }}
                  onMouseEnter={(e) => handleMouseEnter(e, dia)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (!dia.padding && dia.fechaStr) {
                      setFechaSeleccionada(dia.fechaStr);
                      setMesCalendario(new Date(dia.fechaObj));
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Leyenda y rangos */}
          <div className="heatmap-footer">
            <span>Pasa el cursor sobre un día para ver los detalles • Haz clic para seleccionar la fecha</span>
            <div className="heatmap-legend">
              <span>Menos</span>
              <div className="legend-cells">
                <div className="heatmap-cell" data-level="0" title="0 cortes" />
                <div className="heatmap-cell" data-level="1" title="1 a 3 cortes" />
                <div className="heatmap-cell" data-level="2" title="4 a 7 cortes" />
                <div className="heatmap-cell" data-level="3" title="8+ cortes" />
              </div>
              <span>Más</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // NUEVA SECCIÓN: CALENDARIO MENSUAL INTERACTIVO + FORMULARIO DE TURNOS (2 COLUMNAS)
  const renderMonthlyPlannerSection = () => {
    const nombreMesAnio = mesCalendario.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const tituloMes = nombreMesAnio.charAt(0).toUpperCase() + nombreMesAnio.slice(1);

    return (
      <section className="planner-split-container">
        {/* COLUMNA IZQUIERDA: CALENDARIO MENSUAL (MAPA DE CALOR) */}
        <div className="planner-column">
          <div className="planner-card">
            <div className="planner-card-header">
              <h3 className="planner-card-title">
                <CalendarDays size={20} color="var(--accent-color)" />
                Calendario Mensual ({tituloMes})
              </h3>

              <div className="month-nav-controls">
                <button
                  type="button"
                  className="month-nav-btn"
                  onClick={() => cambiarMesCalendario(-1)}
                  title="Mes Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="month-title-display">{tituloMes}</span>
                <button
                  type="button"
                  className="month-nav-btn"
                  onClick={() => cambiarMesCalendario(1)}
                  title="Mes Siguiente"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  className="month-nav-btn"
                  onClick={irMesActualCalendario}
                  style={{ marginLeft: '4px' }}
                  title="Ir al mes actual"
                >
                  Hoy
                </button>
              </div>
            </div>

            <div className="monthly-calendar-wrapper">
              <div className="monthly-weekdays-header">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                  <span key={d} className="monthly-weekday-label">{d}</span>
                ))}
              </div>

              <div className="monthly-days-grid">
                {diasCalendarioMensual.map((dia) => {
                  if (dia.padding) {
                    return <div key={dia.key} className="monthly-day-btn padding-cell" />;
                  }

                  const nivel = calcularNivel(dia.cantidad);

                  return (
                    <button
                      key={dia.key}
                      type="button"
                      className={`monthly-day-btn ${dia.isToday ? 'is-today' : ''} ${dia.isSelected ? 'selected' : ''}`}
                      data-level={nivel}
                      onClick={() => seleccionarDiaCalendario(dia)}
                      title={`${dia.fechaStr}: ${dia.cantidad} cortes realizados`}
                    >
                      <span className="monthly-day-number">{dia.numeroDia}</span>
                      {dia.cantidad > 0 ? (
                        <span className="monthly-day-cuts-badge">
                          <Scissors size={10} />
                          {dia.cantidad}
                        </span>
                      ) : (
                        <span style={{ height: '10px' }}></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="monthly-legend-bar">
                <span>💡 Clic en cualquier día para seleccionarlo</span>
                <div className="heatmap-legend">
                  <span>Menos</span>
                  <div className="legend-cells">
                    <div className="heatmap-cell" data-level="0" title="0 cortes" />
                    <div className="heatmap-cell" data-level="1" title="1 a 3 cortes" />
                    <div className="heatmap-cell" data-level="2" title="4 a 7 cortes" />
                    <div className="heatmap-cell" data-level="3" title="8+ cortes" />
                  </div>
                  <span>Más</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO RÁPIDO DE TURNOS Y TURNOS DEL DÍA */}
        <div className="planner-column">
          <div className="planner-card">
            <div className="planner-card-header">
              <h3 className="planner-card-title">
                <Plus size={20} color="var(--accent-color)" />
                Turnos & Reservas del Día
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {cortesDiaSeleccionado.length > 0 
                  ? `${cortesDiaSeleccionado.length} ${cortesDiaSeleccionado.length === 1 ? 'turno agendado' : 'turnos agendados'}`
                  : 'Sin turnos este día'}
              </span>
            </div>

            {mensajeExito && (
              <div className="success-alert-banner">
                <CheckCircle2 size={18} />
                <span>¡Turno guardado con éxito para el {formatearFechaLarga(fechaSeleccionada)}!</span>
              </div>
            )}

            {/* Banner de Fecha Seleccionada Dinámica */}
            <div className="selected-date-banner">
              <div className="selected-date-info">
                <span className="selected-date-label">📅 Fecha Seleccionada del Calendario</span>
                <span className="selected-date-value">
                  {formatearFechaLarga(fechaSeleccionada)}
                </span>
              </div>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setFechaSeleccionada(val);
                    const [y, m, d] = val.split('-').map(Number);
                    const nuevaFecha = new Date(y, m - 1, d);
                    setCurrentDate(nuevaFecha);
                    setMesCalendario(nuevaFecha);
                  }
                }}
                className="form-input"
                style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                title="Cambiar fecha manualmente"
              />
            </div>

            {/* Lista de Turnos Agendados para el Día Seleccionado */}
            <div className="planner-day-turnos-box">
              <div className="planner-day-turnos-title">
                <span>📋 Turnos del {fechaSeleccionada}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                  {cortesDiaSeleccionado.length} {cortesDiaSeleccionado.length === 1 ? 'corte' : 'cortes'}
                </span>
              </div>

              {cortesDiaSeleccionado.length > 0 ? (
                <div className="planner-day-turnos-list">
                  {cortesDiaSeleccionado.map((corte) => (
                    <div key={corte.id} className="planner-day-turno-item">
                      <div className="planner-day-turno-info">
                        <span className="planner-day-turno-time">
                          <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          {corte.hora ? corte.hora.substring(0, 5) : ''} hs
                        </span>
                        <span className="planner-day-turno-client">{corte.clienteNombre}</span>
                        <span className="planner-day-turno-price">{formatMoneda(corte.precio)}</span>
                      </div>

                      <div className="planner-day-turno-actions">
                        <button
                          className={`badge-status ${corte.estadoPago === 'PAGADO' ? 'pagado' : corte.estadoPago === 'PENDIENTE' ? 'pendiente' : 'no-pagado'}`}
                          onClick={() => alternarPago(corte)}
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                          title="Hacé clic para cambiar estado: Pendiente ➔ Pagado ➔ Debe"
                        >
                          {corte.estadoPago === 'PAGADO' ? 'PAGADO' : corte.estadoPago === 'PENDIENTE' ? 'PENDIENTE' : 'DEBE'}
                        </button>
                        <button
                          className="btn-action-icon"
                          onClick={() => abrirModalEditar(corte)}
                          title="Editar turno"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn-action-icon delete"
                          onClick={() => eliminarCorte(corte.id, corte.clienteNombre)}
                          title="Eliminar turno"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="planner-empty-turnos">
                  No hay turnos agendados para esta fecha. Completá el formulario para agendar uno:
                </p>
              )}
            </div>

            {/* Formulario de Reserva Rápida */}
            <form onSubmit={guardarTurnoRapido} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Nombre del Cliente */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Nombre del Cliente *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Marcos Silva"
                  required
                  value={quickForm.clienteNombre}
                  onChange={(e) => setQuickForm({ ...quickForm, clienteNombre: e.target.value })}
                />
              </div>

              {/* Selector de Horario (Intervalos de 10 min) */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Hora del Turno (Intervalos de 10 min) *</label>
                <div className="time-picker-grid">
                  <select
                    className="form-input"
                    value={quickForm.horaParte}
                    onChange={(e) => setQuickForm({ ...quickForm, horaParte: e.target.value })}
                    required
                  >
                    {HORAS.map((h) => (
                      <option key={h} value={h}>
                        {h} hs
                      </option>
                    ))}
                  </select>

                  <span className="time-separator">:</span>

                  <select
                    className="form-input"
                    value={quickForm.minutoParte}
                    onChange={(e) => setQuickForm({ ...quickForm, minutoParte: e.target.value })}
                    required
                  >
                    {MINUTOS.map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precio y Estado de Pago */}
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Precio ($ ARS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Ej. 9000"
                    required
                    value={quickForm.precio}
                    onChange={(e) => setQuickForm({ ...quickForm, precio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado del Turno</label>
                  <select
                    className="form-input"
                    value={quickForm.estadoPago}
                    onChange={(e) => setQuickForm({ ...quickForm, estadoPago: e.target.value })}
                  >
                    <option value="PENDIENTE">🟡 Pendiente (Turno por realizar)</option>
                    <option value="NO_PAGADO">🔴 Debe (No pagado)</option>
                    <option value="PAGADO">🟢 Pagado (Cobrado)</option>
                  </select>
                </div>
              </div>

              {/* Botón de Enviar */}
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem 1.25rem' }}
                  disabled={guardandoTurno}
                >
                  <Plus size={18} />
                  {guardandoTurno ? 'Guardando turno...' : 'Registrar Turno para esta Fecha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="app-container">
      {/* Header con marca MiBarber y selector de tema */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="brand-icon">
            <img src="/logoMiBarber.png" alt="MiBarber Logo" className="brand-img" onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; }} />
            <Scissors size={22} color="var(--accent-color)" style={{ display: 'none' }} />
          </div>
          <div>
            <h1 className="brand-title">MiBarber</h1>
            <span className="brand-subtitle">Panel de Gestión</span>
          </div>
        </div>

        <div className="header-right">
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'semana' ? 'active' : ''}`}
              onClick={() => setActiveTab('semana')}
            >
              <Calendar size={17} />
              Semana
            </button>
            <button 
              className={`nav-tab ${activeTab === 'pagos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pagos')}
            >
              <DollarSign size={17} />
              Pagos & Deudas
            </button>
            <button 
              className={`nav-tab ${activeTab === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setActiveTab('estadisticas')}
            >
              <TrendingUp size={17} />
              Estadísticas
            </button>
          </nav>

          {/* Theme Switcher Button */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a Modo Claro (Ivory)' : 'Cambiar a Modo Noche (Espresso)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={17} color="var(--accent-color)" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon size={17} color="var(--accent-color)" />
                <span>Noche</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* CONTENIDO 1: VISTA SEMANAL (PÁGINA PRINCIPAL) */}
      {activeTab === 'semana' && (
        <main>
          {/* Tarjetas de Métricas Semanales */}
          <div className="stats-grid">
            <div className="stat-card cobrado">
              <div className="stat-header">
                <span className="stat-title">Total Cobrado</span>
                <div className="stat-icon-wrapper">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(resumenSemanal.totalCobrado)}</div>
              <div className="stat-footer">{resumenSemanal.cantidadPagados} cortes cobrados</div>
            </div>

            <div className="stat-card turnos-pendientes">
              <div className="stat-header">
                <span className="stat-title">Turnos Pendientes</span>
                <div className="stat-icon-wrapper">
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-value">{resumenSemanal.cantidadPendientes || 0}</div>
              <div className="stat-footer">
                {resumenSemanal.cantidadPendientes === 1 ? '1 turno pendiente por hacer' : `${resumenSemanal.cantidadPendientes || 0} turnos pendientes por hacer`}
                {resumenSemanal.totalPendiente > 0 && ` (${formatMoneda(resumenSemanal.totalPendiente)})`}
              </div>
            </div>

            <div className="stat-card deuda">
              <div className="stat-header">
                <span className="stat-title">Por Cobrar (Debe)</span>
                <div className="stat-icon-wrapper">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(resumenSemanal.totalDeuda || 0)}</div>
              <div className="stat-footer">{resumenSemanal.cantidadNoPagados} clientes con deuda</div>
            </div>

            <div className="stat-card turnos">
              <div className="stat-header">
                <span className="stat-title">Total Turnos</span>
                <div className="stat-icon-wrapper">
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-value">{resumenSemanal.totalCortes}</div>
              <div className="stat-footer">Cortes agendados en la semana</div>
            </div>
          </div>

          {/* Nueva Sección: Calendario Mensual Interactivo y Formulario de Turnos */}
          {renderMonthlyPlannerSection()}

          {/* Barra de Controles y Navegación de Semana */}
          <div className="controls-bar">
            <div className="week-navigator">
              <button className="btn-icon" onClick={() => cambiarSemana(-7)} title="Semana Anterior">
                <ChevronLeft size={20} />
              </button>
              <button className="btn btn-secondary" onClick={irSemanaActual}>
                Esta semana
              </button>
              <button className="btn-icon" onClick={() => cambiarSemana(7)} title="Semana Siguiente">
                <ChevronRight size={20} />
              </button>
              <span className="week-label">
                {resumenSemanal.fechaInicio && resumenSemanal.fechaFin
                  ? `${resumenSemanal.fechaInicio} al ${resumenSemanal.fechaFin}`
                  : 'Cargando semana...'}
              </span>
            </div>

            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <Plus size={18} />
              Nuevo Corte
            </button>
          </div>

          {/* Tabla de Cortes de la Semana */}
          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <Calendar size={20} color="var(--accent-color)" />
                Cortes de la Semana
              </h2>
            </div>

            {resumenSemanal.cortes && resumenSemanal.cortes.length > 0 ? (
              <div className="table-responsive">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Precio</th>
                      <th>Estado de Pago</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenSemanal.cortes.map((corte) => (
                      <tr key={corte.id}>
                        <td style={{ fontWeight: 700 }}>{corte.clienteNombre}</td>
                        <td>{corte.fecha}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            {corte.hora ? corte.hora.substring(0, 5) : ''} hs
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
                          {formatMoneda(corte.precio)}
                        </td>
                        <td>
                          <button
                            className={`badge-status ${corte.estadoPago === 'PAGADO' ? 'pagado' : corte.estadoPago === 'PENDIENTE' ? 'pendiente' : 'no-pagado'}`}
                            onClick={() => alternarPago(corte)}
                            title="Hacé clic para cambiar estado: Pendiente ➔ Pagado ➔ Debe"
                          >
                            {corte.estadoPago === 'PAGADO' ? (
                              <>
                                <CheckCircle2 size={13} />
                                PAGADO
                              </>
                            ) : corte.estadoPago === 'PENDIENTE' ? (
                              <>
                                <Clock size={13} />
                                PENDIENTE
                              </>
                            ) : (
                              <>
                                <AlertCircle size={13} />
                                DEBE
                              </>
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-action-icon" 
                              onClick={() => abrirModalEditar(corte)}
                              title="Editar corte"
                            >
                              <Edit3 size={17} />
                            </button>
                            <button 
                              className="btn-action-icon delete" 
                              onClick={() => eliminarCorte(corte.id, corte.clienteNombre)}
                              title="Eliminar corte"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Scissors className="empty-icon" size={48} />
                <h3>No hay cortes registrados en esta semana</h3>
                <p style={{ marginTop: '0.5rem' }}>Hacé clic en "+ Nuevo Corte" para agendar tu primer turno.</p>
              </div>
            )}
          </section>
        </main>
      )}

      {/* CONTENIDO 2: VISTA DE PAGOS & DEUDORES */}
      {activeTab === 'pagos' && (
        <main>
          {/* Métricas de Pagos y Finanzas del Mes (Se renueva cada mes) */}
          <div className="stats-grid">
            <div className="stat-card deuda">
              <div className="stat-header">
                <span className="stat-title">Deuda Total (Quiénes deben)</span>
                <div className="stat-icon-wrapper">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(totalesGlobales.totalHistoricoDeuda || 0)}</div>
              <div className="stat-footer">Monto total adeudado por clientes</div>
            </div>

            <div className="stat-card cobrado">
              <div className="stat-header">
                <span className="stat-title">Total Cobrado ({totalesGlobales.nombreMesActual || 'Este Mes'})</span>
                <div className="stat-icon-wrapper">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(totalesGlobales.totalMesCobrado || 0)}</div>
              <div className="stat-footer">
                {totalesGlobales.cantidadPagadosMes !== undefined
                  ? `${totalesGlobales.cantidadPagadosMes} cortes cobrados en ${totalesGlobales.nombreMesActual || 'el mes'}`
                  : 'Ingresos cobrados este mes'}
              </div>
            </div>

            <div className="stat-card diezmo">
              <div className="stat-header">
                <span className="stat-title">10% Décima Parte ({totalesGlobales.nombreMesActual || 'Este Mes'})</span>
                <div className="stat-icon-wrapper">
                  <Percent size={20} />
                </div>
              </div>
              <div className="stat-value">
                {formatMoneda(totalesGlobales.diezmoMes !== undefined ? totalesGlobales.diezmoMes : ((totalesGlobales.totalMesCobrado || 0) * 0.10))}
              </div>
              <div className="stat-footer">10% de lo cobrado en {totalesGlobales.nombreMesActual || 'el mes actual'}</div>
            </div>

            <div className="stat-card turnos-pendientes">
              <div className="stat-header">
                <span className="stat-title">Turnos por Realizar</span>
                <div className="stat-icon-wrapper">
                  <Clock size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(totalesGlobales.totalHistoricoPendiente || 0)}</div>
              <div className="stat-footer">Monto agendado en turnos pendientes</div>
            </div>
          </div>

          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <DollarSign size={20} color="var(--accent-color)" />
                Control de Pagos y Turnos
              </h2>

              {/* Selector de Filtro */}
              <div className="nav-tabs">
                <button
                  className={`nav-tab ${filtroPago === 'DEUDORES' ? 'active' : ''}`}
                  onClick={() => setFiltroPago('DEUDORES')}
                >
                  <AlertCircle size={15} />
                  Quiénes me deben
                </button>
                <button
                  className={`nav-tab ${filtroPago === 'PENDIENTES' ? 'active' : ''}`}
                  onClick={() => setFiltroPago('PENDIENTES')}
                >
                  <Clock size={15} />
                  Turnos pendientes
                </button>
                <button
                  className={`nav-tab ${filtroPago === 'PAGADOS' ? 'active' : ''}`}
                  onClick={() => setFiltroPago('PAGADOS')}
                >
                  <CheckCircle2 size={15} />
                  Pagados
                </button>
                <button
                  className={`nav-tab ${filtroPago === 'TODOS' ? 'active' : ''}`}
                  onClick={() => setFiltroPago('TODOS')}
                >
                  Todos
                </button>
              </div>
            </div>

            {listaPagos.length > 0 ? (
              <div className="table-responsive">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones de Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaPagos.map((corte) => (
                      <tr key={corte.id}>
                        <td style={{ fontWeight: 700 }}>{corte.clienteNombre}</td>
                        <td>{corte.fecha}</td>
                        <td>{corte.hora ? corte.hora.substring(0, 5) : ''} hs</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
                          {formatMoneda(corte.precio)}
                        </td>
                        <td>
                          <span className={`badge-status ${corte.estadoPago === 'PAGADO' ? 'pagado' : corte.estadoPago === 'PENDIENTE' ? 'pendiente' : 'no-pagado'}`}>
                            {corte.estadoPago === 'PAGADO' ? (
                              <>
                                <CheckCircle2 size={13} />
                                PAGADO
                              </>
                            ) : corte.estadoPago === 'PENDIENTE' ? (
                              <>
                                <Clock size={13} />
                                PENDIENTE (POR HACER)
                              </>
                            ) : (
                              <>
                                <AlertCircle size={13} />
                                DEBE (NO PAGADO)
                              </>
                            )}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {corte.estadoPago !== 'PAGADO' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => cambiarEstadoPagoCorte(corte, 'PAGADO')}
                                title="Marcar como cobrado"
                              >
                                <Check size={14} /> Cobrado
                              </button>
                            )}
                            {corte.estadoPago !== 'NO_PAGADO' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                                onClick={() => cambiarEstadoPagoCorte(corte, 'NO_PAGADO')}
                                title="Marcar como deuda pendiente"
                              >
                                <AlertCircle size={14} /> Debe
                              </button>
                            )}
                            {corte.estadoPago !== 'PENDIENTE' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--warning)', borderColor: 'var(--warning-border)' }}
                                onClick={() => cambiarEstadoPagoCorte(corte, 'PENDIENTE')}
                                title="Marcar como turno pendiente por hacer"
                              >
                                <Clock size={14} /> Pendiente
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <CheckCircle2 className="empty-icon" size={48} color="var(--success)" />
                <h3>
                  {filtroPago === 'DEUDORES' && '¡Excelente! Nadie te debe dinero'}
                  {filtroPago === 'PENDIENTES' && 'No tenés turnos pendientes por realizar'}
                  {filtroPago === 'PAGADOS' && 'No hay cortes registrados como pagados'}
                  {filtroPago === 'TODOS' && 'No hay registros de turnos'}
                </h3>
              </div>
            )}
          </section>
        </main>
      )}

      {/* CONTENIDO 3: ESTADÍSTICAS MENSUALES & HISTOGRAMA INTERACTIVO */}
      {activeTab === 'estadisticas' && (
        <main>
          <div className="controls-bar">
            <span className="week-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--accent-color)" />
              Estadísticas y Rendimiento Anual ({anioSeleccionado})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn-icon" 
                onClick={() => setAnioSeleccionado(anioSeleccionado - 1)}
                title="Año anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '60px', textAlign: 'center' }}>
                {anioSeleccionado}
              </span>
              <button 
                className="btn-icon" 
                onClick={() => setAnioSeleccionado(anioSeleccionado + 1)}
                title="Año siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Tarjetas de Resumen y KPIs del Año Seleccionado */}
          <div className="stats-grid">
            <div className="stat-card cobrado">
              <div className="stat-header">
                <span className="stat-title">Ingresos Cobrados ({anioSeleccionado})</span>
                <div className="stat-icon-wrapper">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(resumenAnual.totalCobrado)}</div>
              <div className="stat-footer">Total acumulado en el año</div>
            </div>

            <div className="stat-card turnos">
              <div className="stat-header">
                <span className="stat-title">Total Cortes Realizados</span>
                <div className="stat-icon-wrapper">
                  <Scissors size={20} />
                </div>
              </div>
              <div className="stat-value">{resumenAnual.totalCortes} cortes</div>
              <div className="stat-footer">Volumen de clientes atendidos</div>
            </div>

            <div className="stat-card diezmo">
              <div className="stat-header">
                <span className="stat-title">10% Décima Parte Anual</span>
                <div className="stat-icon-wrapper">
                  <Percent size={20} />
                </div>
              </div>
              <div className="stat-value">{formatMoneda(resumenAnual.totalDiezmo)}</div>
              <div className="stat-footer">10% del total cobrado en {anioSeleccionado}</div>
            </div>

            <div className="stat-card deudores">
              <div className="stat-header">
                <span className="stat-title">Mes con Mayor Recaudación</span>
                <div className="stat-icon-wrapper">
                  <Award size={20} />
                </div>
              </div>
              <div className="stat-value">
                {resumenAnual.mesPico ? resumenAnual.mesPico.nombreMes : 'Sin datos'}
              </div>
              <div className="stat-footer">
                {resumenAnual.mesPico ? `${formatMoneda(resumenAnual.mesPico.ingresosTotales)} recaudados` : 'Aún no hay cortes'}
              </div>
            </div>
          </div>

          {/* SECCIÓN HISTOGRAMA / GRÁFICO INTERACTIVO */}
          <section className="content-section chart-section">
            <div className="chart-header">
              <div>
                <h2 className="section-title">
                  <BarChart3 size={20} color="var(--accent-color)" />
                  Histograma de Evolución Mensual ({anioSeleccionado})
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Tocá o pasá el cursor por cualquier mes para ver su desglose interactivo
                </p>
              </div>

              {/* Selector interactivo de métricas */}
              <div className="chart-metrics-selector">
                <button
                  className={`chart-metric-btn ${metricaGrafico === 'INGRESOS' ? 'active' : ''}`}
                  onClick={() => setMetricaGrafico('INGRESOS')}
                >
                  <DollarSign size={14} /> Ingresos ($)
                </button>
                <button
                  className={`chart-metric-btn ${metricaGrafico === 'CORTES' ? 'active' : ''}`}
                  onClick={() => setMetricaGrafico('CORTES')}
                >
                  <Scissors size={14} /> Cortes Realizados
                </button>
              </div>
            </div>

            {/* Cuadrícula de Columnas del Histograma */}
            <div className="histogram-scroll-wrapper">
              <div className="histogram-container">
                {datosHistograma.map((item) => {
                  const isHovered = mesActivo && mesActivo.mes === item.mes;
                  return (
                    <div
                      key={item.mes}
                      className={`histogram-bar-col ${isHovered ? 'active' : ''}`}
                      onClick={() => setMesSeleccionadoGrafico(item)}
                      onMouseEnter={() => setMesSeleccionadoGrafico(item)}
                    >
                      {/* Valor numérico en el tope de la columna */}
                      <span className="histogram-bar-val">
                        {metricaGrafico === 'CORTES'
                          ? (item.valor > 0 ? item.valor : '-')
                          : (item.valor > 0 ? formatMoneda(item.valor) : '-')}
                      </span>

                      {/* Pista y Barra con altura proporcional */}
                      <div className="histogram-bar-track">
                        <div
                          className={`histogram-bar-fill ${item.valor === 0 ? 'empty' : ''} ${item.esMesPico && metricaGrafico === 'INGRESOS' ? 'highlight' : ''}`}
                          style={{ height: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fila de nombres de meses */}
              <div className="histogram-labels-row">
                {datosHistograma.map((item) => {
                  const isHovered = mesActivo && mesActivo.mes === item.mes;
                  return (
                    <div
                      key={item.mes}
                      className={`histogram-label-item ${item.esMesActual ? 'current-month' : ''} ${isHovered ? 'active' : ''}`}
                      onClick={() => setMesSeleccionadoGrafico(item)}
                    >
                      <span>{item.nombreMes.substring(0, 3)}</span>
                      {item.esMesActual && <div className="current-dot" title="Mes Actual" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tarjeta de Detalle del Mes Seleccionado en el Histograma */}
            {mesActivo && (
              <div className="histogram-details-card">
                <div className="histogram-details-header">
                  <span className="histogram-details-badge">
                    📅 Detalle de {mesActivo.nombreMes} {anioSeleccionado}
                    {mesActivo.esMesActual && ' • Mes en Curso'}
                  </span>
                  {mesActivo.esMesPico && metricaGrafico === 'INGRESOS' && (
                    <span className="badge-pico">🏆 Mes con Mayor Recaudación del Año</span>
                  )}
                </div>

                <div className="histogram-details-grid">
                  <div className="histogram-details-item">
                    <span className="histogram-details-label">Ingresos Cobrados</span>
                    <span className="histogram-details-value" style={{ color: 'var(--success)' }}>
                      {formatMoneda(mesActivo.ingresosTotales)}
                    </span>
                  </div>

                  <div className="histogram-details-item">
                    <span className="histogram-details-label">Cortes Realizados</span>
                    <span className="histogram-details-value" style={{ color: 'var(--accent-color)' }}>
                      {mesActivo.cantidadCortes} cortes
                    </span>
                  </div>

                  <div className="histogram-details-item">
                    <span className="histogram-details-label">Promedio por Corte</span>
                    <span className="histogram-details-value">
                      {mesActivo.cantidadCortes > 0
                        ? formatMoneda(mesActivo.ingresosTotales / mesActivo.cantidadCortes)
                        : '$0'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Tabla de Resumen Detallado Mensual */}
          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <Calendar size={20} color="var(--accent-color)" />
                Resumen de Trabajo e Ingresos por Mes ({anioSeleccionado})
              </h2>
            </div>

            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th style={{ textAlign: 'center' }}>Cortes Realizados</th>
                    <th style={{ textAlign: 'right' }}>Ingresos Cobrados</th>
                    <th style={{ textAlign: 'right' }}>10% Décima Parte</th>
                    <th style={{ textAlign: 'right' }}>Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasMensuales.map((stat) => (
                    <tr 
                      key={stat.mes}
                      style={{
                        background: mesActivo && mesActivo.mes === stat.mes ? 'var(--card-hover-bg)' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setMesSeleccionadoGrafico(stat)}
                    >
                      <td style={{ fontWeight: 700 }}>
                        {stat.nombreMes}
                        {stat.mes === (new Date().getMonth() + 1) && anioSeleccionado === new Date().getFullYear() && (
                          <span style={{ fontSize: '0.68rem', marginLeft: '6px', color: 'var(--accent-color)', fontWeight: 800 }}>
                            (Actual)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          background: stat.cantidadCortes > 0 ? 'var(--accent-glow)' : 'transparent',
                          color: stat.cantidadCortes > 0 ? 'var(--accent-color)' : 'var(--text-dim)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          fontWeight: 700
                        }}>
                          {stat.cantidadCortes} cortes
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                        {formatMoneda(stat.ingresosTotales)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-color)' }}>
                        {formatMoneda(stat.ingresosTotales * 0.10)}
                      </td>
                      <td style={{ textAlign: 'right', color: stat.totalPendiente > 0 ? 'var(--danger)' : 'var(--text-dim)' }}>
                        {formatMoneda(stat.totalPendiente)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mapa de Calor Anual */}
          {renderHeatmapSection(`Mapa de Actividad Día a Día (${totalCortesAnual} cortes en ${anioSeleccionado})`)}
        </main>
      )}

      {/* TOOLTIP FLOTANTE DEL HEATMAP */}
      {tooltip.visible && (
        <div
          className="heatmap-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`
          }}
        >
          <strong>{tooltip.cantidad} {tooltip.cantidad === 1 ? 'corte realizado' : 'cortes realizados'}</strong>
          <span>{tooltip.fecha}</span>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CORTE */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {corteEnEdicion ? 'Editar Corte' : 'Registrar Nuevo Corte'}
              </h3>
              <button className="btn-action-icon" onClick={() => setModalAbierto(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={guardarCorte}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Juan Pérez"
                    required
                    value={formData.clienteNombre}
                    onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Fecha *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    />
                  </div>

                  {/* Selector de Hora en Intervalos de 10 Minutos */}
                  <div className="form-group">
                    <label className="form-label">Hora del Turno *</label>
                    <div className="time-picker-grid">
                      <select
                        className="form-input"
                        value={formData.horaParte}
                        onChange={(e) => setFormData({ ...formData, horaParte: e.target.value })}
                        required
                      >
                        {HORAS.map((h) => (
                          <option key={h} value={h}>
                            {h} hs
                          </option>
                        ))}
                      </select>

                      <span className="time-separator">:</span>

                      <select
                        className="form-input"
                        value={formData.minutoParte}
                        onChange={(e) => setFormData({ ...formData, minutoParte: e.target.value })}
                        required
                      >
                        {MINUTOS.map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio ($ ARS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Ej. 5000"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado de Pago</label>
                  <select
                    className="form-input"
                    value={formData.estadoPago}
                    onChange={(e) => setFormData({ ...formData, estadoPago: e.target.value })}
                  >
                    <option value="PENDIENTE">🟡 Pendiente (Todavía no hice el corte)</option>
                    <option value="NO_PAGADO">🔴 Debe (No pagado)</option>
                    <option value="PAGADO">🟢 Pagado (Cobrado)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {corteEnEdicion ? 'Actualizar' : 'Guardar Corte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
