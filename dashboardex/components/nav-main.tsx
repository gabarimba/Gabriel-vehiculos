"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Seccion } from "@/lib/autospeed"

export function NavMain({
  items,
  activeSection,
  onNavigate,
}: {
  items: { title: string; value: Seccion; icon: React.ReactNode }[]
  activeSection: Seccion
  onNavigate: (section: Seccion) => void
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.value}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={activeSection === item.value}
                aria-current={activeSection === item.value ? "page" : undefined}
                onClick={() => {
                  onNavigate(item.value)
                  if (isMobile) setOpenMobile(false)
                }}
                className="h-11 data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground"
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
