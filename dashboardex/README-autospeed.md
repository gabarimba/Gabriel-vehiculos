# AutoSpeed · Demo del taller

## Iniciar

Desde `C:\Users\Gabriel\dashboardex`:

```sh
npm run dev
```

Abre la dirección indicada en la terminal (normalmente http://localhost:3000).
Tanto `/` como `/dashboard` muestran el panel.

## Datos locales

- `app/dashboard/data.json`: 18 vehículos con cliente, placas, servicio, mecánico, ingreso, estado y costo estimado.
- `app/dashboard/workshop.json`: corte de demo del 4 de septiembre de 2026, actividad diaria de seis semanas, contactos ficticios, visitas anteriores y notas.
- Las métricas mensuales y la gráfica comparten el mismo resumen diario. Representan el acumulado al corte; la tabla contiene una muestra de órdenes. Los vehículos en taller y la distribución por estado se actualizan al editar las órdenes. Los clientes recurrentes tienen al menos una visita anterior además de su orden actual.
- Los cambios de estado, mecánico, costo, notas y orden de las filas duran mientras la página siga abierta, incluso al cambiar de sección. Recargar restaura los JSON originales.

## Funciones

- Cinco secciones navegables con título y selección activa; sidebar colapsable y menú móvil.
- Gráfica con rangos de 6 semanas, 4 semanas y 7 días.
- Tabla con búsqueda sin distinguir acentos, filtro por estado, ordenación por columnas (incluye costos numéricos y fechas), selección, columnas visibles y paginación.
- Reordenación con ratón, tacto o teclado desde el asa (espacio, flechas, espacio). Desactiva la ordenación de columnas con «Restablecer vista» para usar el orden manual.
- Sheet lateral al pulsar la fila o el nombre del vehículo: contacto, historial, notas y edición del servicio. Cancelar descarta los cambios sin guardar.
- CSV de filas filtradas o seleccionadas y exportación del resumen de reportes.
- Tema del sistema y atajo `d` de la plantilla. Atajo de sidebar: `Ctrl+B` / `Cmd+B`.

## Verificar

```sh
npm run typecheck
npm run lint
npm run build
```

No requiere base de datos, API ni autenticación. Conserva los componentes principales y las rutas existentes.
