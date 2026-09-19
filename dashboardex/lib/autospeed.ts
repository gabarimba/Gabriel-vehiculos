import { z } from "zod"
import workshop from "@/app/dashboard/workshop.json"

export const estados = [
  "En proceso",
  "Esperando refacción",
  "Terminado",
  "Entregado",
] as const
export const schema = z.object({
  id: z.number(),
  cliente: z.string(),
  vehiculo: z.string(),
  placas: z.string(),
  servicio: z.string(),
  mecanico: z.string(),
  fecha_ingreso: z.string(),
  estado: z.enum(estados),
  costo_estimado: z.string(),
})
export type Vehiculo = z.infer<typeof schema>
export const secciones = {
  dashboard: "Dashboard",
  vehiculos: "Vehículos en Servicio",
  clientes: "Clientes",
  historial: "Historial de Servicios",
  reportes: "Reportes",
} as const
export type Seccion = keyof typeof secciones
export { workshop }
export const mecanicos = [
  "Carlos Ramírez",
  "Miguel Torres",
  "Ana Martínez",
  "Jorge Hernández",
]
export const moneda = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
export const costoNumerico = (value: string) =>
  Number(value.replace(/[^\d.]/g, ""))
// Parse date-only values at noon to avoid shifting a day in Mexico's time zones.
export const fecha = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
export const buscarTexto = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
export function metricas(data: Vehiculo[]) {
  const enTaller = data.filter((item) => item.estado !== "Entregado").length
  const mes = workshop.fecha_demo.slice(0, 7)
  const dias = workshop.actividad.filter((dia) => dia.fecha.startsWith(mes))
  return {
    enTaller,
    variacion: enTaller - workshop.vehiculos_ayer,
    completados: dias.reduce(
      (sum, dia) => sum + dia.mantenimiento + dia.reparacion,
      0
    ),
    ingresos: dias.reduce((sum, dia) => sum + dia.ingresos, 0),
    recurrentes: workshop.clientes.filter(
      (cliente) => cliente.historial.length > 0
    ).length,
  }
}
