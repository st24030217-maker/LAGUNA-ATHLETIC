# LAGUNA ATHLETIC - Control de Asistencia y Gestión del Plantel 2026

Plataforma oficial de **Laguna Athletic (Temporada 2026)** para control de asistencia, convocatorias, alineaciones tácticas, avisos por WhatsApp y seguimiento de estadísticas.

## Acceso para usuarios

La versión web se publica en:

**https://st24030217-maker.github.io/LAGUNA-ATHLETIC/**

En teléfonos compatibles, abre esa dirección desde Chrome o Safari y selecciona **Instalar aplicación** o **Agregar a pantalla de inicio** para descargarla como PWA.

## Modulos del Sistema

1. **Registro QR**: Registro instantaneo al llegar a la cancha.
2. **Convocatoria y 11 Titular**: Pizarra tactica interactiva (Formacion 4-3-3).
3. **Avisos WhatsApp**: Envio automatizado de avisos a jugadores y tutores (General, Por Grupo y Personalizado).
4. **Calendario del Club**: Programacion de entrenamientos, partidos oficiales y captura de goleo/asistencias.
5. **Justificaciones**: Gestion de ausencias y revision por el Director Tecnico.
6. **Estadisticas**: Graficos de % de asistencia y ranking de cumplimiento.
7. **Permisos por Rol**: Acceso diferenciado para Entrenador (DT), Jugadores y Directiva.

## Tecnologias

- **Frontend**: HTML5, CSS3 Modo Oscuro Premium, JavaScript ES6+
- **Librerias**: FontAwesome 6, Chart.js, QRCode.js
- **Assets**: Escudo oficial del club (`LAGUNA.jpg`) y video institucional

## Estructura

- La aplicación principal se sirve desde la raíz (`index.html` y `js/`).
- `frontend/` es un proyecto Vite/React independiente que construye la credencial 3D embebida por la aplicación principal.
- El flujo de GitHub Pages compila `frontend/` y publica ambos artefactos; por ello, `frontend/dist/` no se versiona.

## Seguridad y privacidad

No subas datos personales reales, documentos, teléfonos ni archivos médicos al repositorio. La instancia de Supabase debe ejecutar `supabase_secure_setup.sql` y conservar RLS habilitado.

---
*Unidos por la misma pasion · Laguna Athletic 2026*

