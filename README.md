# 💈 MiBarber — Panel de Gestión Semanal para Barberos

Aplicación web personal diseñada para que el barbero administre su trabajo semanal, controle ingresos y deudas, calcule su 10% (diezmo/ahorro) y consulte estadísticas mensuales de rendimiento.

---

## 🎨 Sistema de Temas Cohesivo

La aplicación cuenta con un selector de temas elegante basado en tonos cálidos y cuero (Leather & Espresso):

- **Modo Claro (Ivory & Warm Leather):**
  - Fondo Marfil: `#F8F6F0`
  - Tarjetas: `#FFFFFF`
  - Acentos Cuero: `#8C6B4A`
  - Textos: `#2C2C2C`

- **Modo Noche (Espresso & Dark Leather):**
  - Fondo Café Profundo: `#15110E`
  - Tarjetas Cuero Oscuro: `#211A15`
  - Acentos Caramelo / Cuero Luminoso: `#C89968`
  - Textos Marfil Claro: `#F5EFEB`

---

## ⚡ Funcionalidades Implementadas

### 1. 📅 Gestión de Cortes (Vista Semanal)
- **CRUD completo:** Registrar, modificar y eliminar cortes.
- **Selector de hora en intervalos de 10 minutos** (`:00`, `:10`, `:20`, `:30`, `:40`, `:50`).
- **Navegación semanal:** Avanzar o retroceder semanas, o volver a "Esta semana" con un clic.
- **Tarjetas de métricas en tiempo real:**
  - **Total Ganado (Semana):** Suma de cortes cobrados en la semana seleccionada.
  - **10% Décima Parte:** Cálculo automático del 10% del total cobrado semanalmente.
  - **Por Cobrar (Deuda):** Monto pendiente de cobro de clientes que aún deben.
  - **Total Turnos:** Cantidad de cortes agendados en la semana.
- **Acción rápida de pago:** Un solo clic en el badge para alternar entre `PAGADO` y `NO PAGADO`.

### 2. 💰 Control de Pagos & Deudas
- **Pestaña exclusiva de control financiero:**
  - **Quiénes me deben (Deudores):** Listado inmediato de clientes con pagos pendientes.
  - **Pagados:** Listado de cortes cobrados.
  - **Todos:** Historial completo.
- **Botón directo de cobro:** Cobrar o desmarcar con 1 clic.
- **Métricas globales:** Deuda total histórica y monto total histórico cobrado.

### 3. 📊 Estadísticas Mensuales
- **Selector de año.**
- **Desglose mes a mes:**
  - Cantidad de cortes realizados en el mes.
  - Ingresos cobrados.
  - 10% generado en cada mes.
  - Monto pendiente de cobro.

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Un solo clic (Recomendado)
Doble clic en el archivo:
- `iniciar-app.bat` (inicia automáticamente Backend y Frontend).

### Opción 2: Iniciar por separado
- Backend: Doble clic en `iniciar-backend.bat` (corre en `http://localhost:8080`).
- Frontend: Doble clic en `iniciar-frontend.bat` (corre en `http://localhost:5173`).

---

## 🌐 URLs de Acceso
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API REST (Backend):** [http://localhost:8080/api/cortes](http://localhost:8080/api/cortes)
- **Consola H2 (Base de Datos):** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:file:./data/barberiadb`
  - Usuario: `sa`
  - Contraseña: *(vacía)*
