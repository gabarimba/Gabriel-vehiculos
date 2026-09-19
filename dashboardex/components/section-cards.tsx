import {
  CarFrontIcon,
  CircleCheckIcon,
  WalletIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { metricas, moneda, workshop, type Vehiculo } from "@/lib/autospeed"

export function SectionCards({ data }: { data: Vehiculo[] }) {
  const resumen = metricas(data)
  const cards = [
    {
      title: "Vehículos en taller hoy",
      value: resumen.enTaller,
      icon: CarFrontIcon,
      badge: `${resumen.variacion >= 0 ? "+" : ""}${resumen.variacion} vs. ayer`,
      detail: "En proceso, en espera y terminados",
      footer: `${data.filter((v) => v.estado === "Esperando refacción").length} esperan refacción`,
    },
    {
      title: "Servicios completados este mes",
      value: resumen.completados,
      icon: CircleCheckIcon,
      badge: "Septiembre",
      detail: "Mantenimiento y reparación",
      footer: "Acumulado al corte de la demo",
    },
    {
      title: "Ingresos estimados del mes",
      value: moneda(resumen.ingresos),
      icon: WalletIcon,
      badge: "MXN",
      detail: "Estimación de servicios realizados",
      footer: "Importes de demostración",
    },
    {
      title: "Clientes recurrentes",
      value: resumen.recurrentes,
      icon: UsersIcon,
      badge: `${Math.round((resumen.recurrentes / workshop.clientes.length) * 100)}%`,
      detail: "Clientes con al menos una visita previa",
      footer: `De ${workshop.clientes.length} clientes registrados`,
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="@container/card rounded-xl bg-linear-to-t from-primary/5 to-card [--card-spacing:--spacing(5)]"
        >
          <CardHeader>
            <CardDescription className="max-w-44 text-xs font-medium">
              {card.title}
            </CardDescription>
            <CardTitle className="mt-2 font-sans text-3xl font-semibold tracking-tight tabular-nums">
              {card.value}
            </CardTitle>
            <CardAction>
              <card.icon className="size-5 text-primary" />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 text-xs">
            <Badge variant="outline" className="bg-background/60 text-xs">
              {card.icon === CarFrontIcon &&
                (resumen.variacion < 0 ? (
                  <TrendingDownIcon className="size-3" />
                ) : (
                  <TrendingUpIcon className="size-3" />
                ))}
              {card.badge}
            </Badge>
            <p className="font-medium">{card.detail}</p>
            <p className="text-muted-foreground">{card.footer}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
