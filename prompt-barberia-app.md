# Prompt para el agente — App de Gestión de Barbería

Copiá y pegá esto tal cual en el agente (Antigravity) para arrancar el proyecto.

---

Quiero que me ayudes a construir desde cero una aplicación web personal para gestionar mi barbería. No es una app de reservas para clientes: es una herramienta para que YO (el barbero) administre mi propio trabajo semanal.

## Stack

- **Backend:** Java con Spring Boot
- **Frontend:** React
- **Base de datos:** PostgreSQL (si no está instalado, proponeme una alternativa simple como H2 para desarrollo local)

## Funcionalidades del MVP

### 1. Gestión de cortes (CRUD)
- Agregar un corte: cliente, fecha, hora, tipo de corte, precio
- Modificar un corte existente
- Eliminar un corte
- Ver los cortes agendados de la semana actual (vista semanal)

### 2. Gestión de pagos
- Cada corte tiene un estado de pago: **pagado** / **no pagado**
- Poder marcar un corte como pagado o no pagado
- Ver un listado o resumen de quiénes me deben (no pagaron) y quiénes ya pagaron
- Ver el total de dinero cobrado y el total pendiente de cobro
- Ver el **total ganado por semana** (suma de lo cobrado esa semana)
- Ver, junto a ese total semanal, un apartado con la **décima parte (10%)** de lo generado en la semana

### 3. Estadísticas
- Cantidad de cortes por mes (para ver en qué meses tuve más trabajo)
- Ingresos totales por mes
- (Opcional, si es fácil de agregar) tipo de corte más solicitado

## Cómo quiero trabajar

1. Antes de escribir código, quiero que me propongas el modelo de datos (entidades y relaciones) basado en esto, y me lo mostrés para que lo revise antes de seguir.
2. Después de que lo apruebe, armá la estructura del proyecto: carpeta `backend/` con el proyecto Spring Boot, carpeta `frontend/` con el proyecto React (usando Vite).
3. Construí el backend primero: entidades, repositorios, servicios y controladores REST para Cortes y Pagos. Probemos los endpoints antes de pasar al frontend.
4. Después construimos el frontend: primero la pantalla de gestión de cortes de la semana, después la vista de pagos (quién pagó / quién no), y por último las estadísticas mensuales.
5. Andá paso a paso, un bloque de funcionalidad por vez. No generes todo el proyecto de una sola vez: quiero poder revisar y entender cada parte antes de seguir con la siguiente.

Arrancá proponiéndome el modelo de datos (entidades, atributos y relaciones).
