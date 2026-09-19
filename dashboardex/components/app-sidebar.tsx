"use client"

import * as React from "react"
import {
  CarFrontIcon,
  ChartNoAxesCombinedIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { secciones, type Seccion } from "@/lib/autospeed"

const icons = {
  dashboard: <LayoutDashboardIcon />,
  vehiculos: <CarFrontIcon />,
  clientes: <UsersIcon />,
  historial: <HistoryIcon />,
  reportes: <ChartNoAxesCombinedIcon />,
}
const items = (Object.keys(secciones) as Seccion[]).map((value) => ({
  value,
  title: secciones[value],
  icon: icons[value],
}))

export function AppSidebar({
  activeSection,
  onNavigate,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeSection: Seccion
  onNavigate: (section: Seccion) => void
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-4 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-auto hover:bg-transparent"
              onClick={() => onNavigate("dashboard")}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <WrenchIcon className="size-5!" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-xl font-bold tracking-tight">
                  AutoSpeed<span className="text-primary">.</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Control del taller
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <p className="px-6 pt-4 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Administración
        </p>
        <NavMain
          items={items}
          activeSection={activeSection}
          onNavigate={onNavigate}
        />
        <div className="mx-4 mt-auto rounded-xl border border-sidebar-border p-4 text-xs leading-relaxed text-muted-foreground">
          <WrenchIcon className="mb-3 size-5 text-primary" />
          <p className="mb-1 font-semibold text-sidebar-foreground">
            Todo tu taller, en un lugar.
          </p>
          Consulta servicios, da seguimiento a cada vehículo y organiza a tu
          equipo.
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold">
            AS
          </span>
          <div>
            <p className="text-sm font-medium">Administración</p>
            <p className="text-xs text-muted-foreground">
              AutoSpeed · Demo local
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
