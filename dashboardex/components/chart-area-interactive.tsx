"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { fecha, workshop } from "@/lib/autospeed"

const chartConfig = {
  mantenimiento: { label: "Mantenimiento", color: "var(--chart-1)" },
  reparacion: { label: "Reparación", color: "var(--chart-2)" },
} satisfies ChartConfig
const ranges = [
  { value: "42", label: "6 semanas" },
  { value: "28", label: "4 semanas" },
  { value: "7", label: "7 días" },
]

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("42")
  const gradientId = React.useId().replace(/:/g, "")
  // Fixed demo snapshot: every range remains useful whenever the prototype is opened.
  const filteredData = workshop.actividad.slice(-Number(timeRange))
  const total = filteredData.reduce(
    (sum, day) => sum + day.mantenimiento + day.reparacion,
    0
  )
  return (
    <Card className="@container/card rounded-xl [--card-spacing:--spacing(5)]">
      <CardHeader className="gap-y-3 max-sm:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle className="font-sans text-base tracking-normal normal-case">
          Servicios realizados por día
        </CardTitle>
        <CardDescription className="text-xs">
          {total} servicios · {fecha(filteredData[0].fecha)} —{" "}
          {fecha(workshop.fecha_demo)}
        </CardDescription>
        <CardAction className="max-sm:col-start-1 max-sm:row-start-3 max-sm:justify-self-start">
          <ToggleGroup
            multiple={false}
            value={[timeRange]}
            onValueChange={(value) => setTimeRange(value[0] ?? timeRange)}
            variant="outline"
            className="hidden @[767px]/card:flex"
            aria-label="Rango de la gráfica"
          >
            {ranges.map((range) => (
              <ToggleGroupItem key={range.value} value={range.value}>
                {range.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value)
            }}
            items={ranges}
          >
            <SelectTrigger
              size="sm"
              className="w-36 @[767px]/card:hidden"
              aria-label="Rango de la gráfica"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ranges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={filteredData}
            margin={{ left: -20, right: 8 }}
          >
            <defs>
              {Object.entries(chartConfig).map(([key, config]) => (
                <linearGradient
                  key={key}
                  id={`${gradientId}-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={config.color}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={config.color}
                    stopOpacity={0.03}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={34}
              tickFormatter={(value: string) =>
                new Date(`${value}T12:00:00`).toLocaleDateString("es-MX", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => fecha(String(value))}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="reparacion"
              type="monotone"
              fill={`url(#${gradientId}-reparacion)`}
              stroke="var(--color-reparacion)"
              stackId="servicios"
              strokeWidth={2}
            />
            <Area
              dataKey="mantenimiento"
              type="monotone"
              fill={`url(#${gradientId}-mantenimiento)`}
              stroke="var(--color-mantenimiento)"
              stackId="servicios"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-chart-1" />
            Mantenimiento
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-chart-2" />
            Reparación
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
