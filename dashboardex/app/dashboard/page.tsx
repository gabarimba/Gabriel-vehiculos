"use client"

import * as React from "react"
import {
  ArrowDownToLineIcon,
  CalendarDaysIcon,
  CarFrontIcon,
  SearchIcon,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable, EstadoBadge, VehicleDetail } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  buscarTexto,
  costoNumerico,
  estados,
  fecha,
  metricas,
  moneda,
  schema,
  secciones,
  workshop,
  type Seccion,
  type Vehiculo,
} from "@/lib/autospeed"
import data from "./data.json"

const initialData = schema.array().parse(data)
const descriptions: Record<Seccion, string> = {
  dashboard:
    "Un vistazo a tu taller. Cada vehículo, cada servicio, bajo control.",
  vehiculos:
    "Organiza los trabajos activos y consulta quién atiende cada vehículo.",
  clientes: "Conoce a tus clientes y consulta sus visitas al taller.",
  historial:
    "Consulta los vehículos entregados y los servicios de visitas anteriores.",
  reportes:
    "Actividad, ingresos estimados y distribución de los trabajos del taller.",
}

export default function Page() {
  const [section, setSection] = React.useState<Seccion>("dashboard")
  const [vehicles, setVehicles] = React.useState<Vehiculo[]>(initialData)
  const [clientSearch, setClientSearch] = React.useState("")
  const [selectedClient, setSelectedClient] = React.useState<number | null>(
    null
  )
  const [notes, setNotes] = React.useState<Record<number, string>>({})
  const [historySearch, setHistorySearch] = React.useState("")
  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === selectedClient) ?? null
  const summary = metricas(vehicles)
  function updateVehicle(vehicle: Vehiculo, note: string) {
    setVehicles((current) =>
      current.map((item) => (item.id === vehicle.id ? vehicle : item))
    )
    setNotes((current) => ({ ...current, [vehicle.id]: note }))
  }
  function exportReport() {
    const rows = [
      ["Indicador", "Valor"],
      ["Fecha de corte", workshop.fecha_demo],
      ["Vehículos en taller", summary.enTaller],
      ["Servicios completados este mes", summary.completados],
      ["Ingresos estimados MXN", summary.ingresos],
      ["Clientes recurrentes", summary.recurrentes],
    ]
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.map((row) => row.join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "autospeed-reporte-2026-09-04.csv"
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const previousServices = workshop.clientes
    .flatMap((client) =>
      client.historial.map((service) => ({
        ...service,
        cliente: client.nombre,
        clienteId: client.id,
      }))
    )
    .filter((service) =>
      buscarTexto(
        `${service.cliente} ${service.vehiculo} ${service.servicio}`
      ).includes(buscarTexto(historySearch))
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        activeSection={section}
        onNavigate={setSection}
      />
      <SidebarInset className="min-w-0">
        <SiteHeader title={secciones[section]} />
        <div className="@container/main flex flex-1 flex-col gap-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4 px-4 lg:px-6">
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
                AutoSpeed / Operación
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {section === "dashboard"
                  ? "Tu taller, en marcha"
                  : secciones[section]}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {descriptions[section]}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
              <CalendarDaysIcon className="size-4" />
              Corte demo: {fecha(workshop.fecha_demo)}
            </div>
          </div>
          {(section === "dashboard" || section === "reportes") && (
            <>
              <SectionCards data={vehicles} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </>
          )}
          {(section === "dashboard" ||
            section === "vehiculos" ||
            section === "historial") && (
            <DataTable
              key={section}
              data={vehicles}
              onDataChange={setVehicles}
              onSave={updateVehicle}
              notes={notes}
              mode={section}
            />
          )}
          {section === "clientes" && (
            <section
              className="space-y-4 px-4 lg:px-6"
              aria-label="Directorio de clientes"
            >
              <div className="relative max-w-md">
                <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  aria-label="Buscar clientes"
                  placeholder="Buscar por nombre, teléfono o correo…"
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 @5xl/main:grid-cols-3">
                {workshop.clientes
                  .filter((client) =>
                    buscarTexto(
                      `${client.nombre} ${client.telefono} ${client.email}`
                    ).includes(buscarTexto(clientSearch))
                  )
                  .map((client) => (
                    <Card
                      key={client.id}
                      className="rounded-xl [--card-spacing:--spacing(5)]"
                    >
                      <CardHeader>
                        <CardTitle className="font-sans text-base tracking-normal normal-case">
                          {client.nombre}
                        </CardTitle>
                        <CardDescription>
                          {client.telefono}
                          <br />
                          {client.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center justify-between gap-3">
                        <Badge variant="outline">
                          {client.historial.length
                            ? `${client.historial.length} visitas previas`
                            : "Primera visita"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client.id)}
                        >
                          Ver expediente
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              {!workshop.clientes.some((client) =>
                buscarTexto(
                  `${client.nombre} ${client.telefono} ${client.email}`
                ).includes(buscarTexto(clientSearch))
              ) && (
                <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  No se encontraron clientes.
                </p>
              )}
            </section>
          )}
          {section === "historial" && (
            <section
              className="space-y-4 px-4 lg:px-6"
              aria-label="Visitas anteriores"
            >
              <div>
                <h3 className="font-semibold">Visitas anteriores</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Servicios previos a las órdenes de la tabla ·{" "}
                  {previousServices.length} registros
                </p>
              </div>
              <Input
                className="max-w-md"
                aria-label="Buscar en visitas anteriores"
                placeholder="Buscar cliente, vehículo o servicio…"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
              />
              <div className="divide-y overflow-hidden rounded-xl border bg-card">
                {previousServices.map((service) => (
                  <button
                    key={`${service.clienteId}-${service.fecha}`}
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => setSelectedClient(service.clienteId)}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {service.servicio} · {service.vehiculo}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {service.cliente} · {service.mecanico}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {moneda(service.costo)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fecha(service.fecha)}
                      </p>
                    </div>
                  </button>
                ))}
                {!previousServices.length && (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No se encontraron servicios anteriores.
                  </p>
                )}
              </div>
            </section>
          )}
          {section === "reportes" && (
            <section
              className="space-y-4 px-4 lg:px-6"
              aria-label="Reportes del taller"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">Distribución de las órdenes</h3>
                <Button variant="outline" onClick={exportReport}>
                  <ArrowDownToLineIcon />
                  Exportar resumen
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
                {estados.map((status) => {
                  const items = vehicles.filter(
                    (vehicle) => vehicle.estado === status
                  )
                  return (
                    <Card
                      key={status}
                      className="rounded-xl [--card-spacing:--spacing(5)]"
                    >
                      <CardHeader>
                        <EstadoBadge estado={status} />
                        <CardTitle className="mt-2 font-sans text-3xl tabular-nums">
                          {items.length}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        {moneda(
                          items.reduce(
                            (sum, item) =>
                              sum + costoNumerico(item.costo_estimado),
                            0
                          )
                        )}{" "}
                        en costos estimados
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}
          <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 px-4 text-[11px] text-muted-foreground lg:px-6">
            <span className="flex items-center gap-2">
              <CarFrontIcon className="size-3.5" />
              AutoSpeed · Panel interno
            </span>
            <span>Datos ficticios · Los cambios se reinician al recargar</span>
          </footer>
        </div>
        <VehicleDetail
          item={selectedVehicle}
          note={selectedVehicle ? notes[selectedVehicle.id] : undefined}
          onClose={() => setSelectedClient(null)}
          onSave={updateVehicle}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
