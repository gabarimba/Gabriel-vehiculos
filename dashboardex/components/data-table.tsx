"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowDownToLineIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CarFrontIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  ClockIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  PackageIcon,
  SearchIcon,
  WrenchIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buscarTexto,
  costoNumerico,
  estados,
  fecha,
  mecanicos,
  moneda,
  workshop,
  type Vehiculo,
} from "@/lib/autospeed"

export { schema } from "@/lib/autospeed"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})
const columnHelper = createColumnHelper<typeof features, Vehiculo>()
const columnLabels: Record<string, string> = {
  cliente: "Cliente",
  vehiculo: "Vehículo",
  placas: "Placas",
  servicio: "Servicio",
  mecanico: "Mecánico",
  fecha_ingreso: "Ingreso",
  estado: "Estado",
  costo_estimado: "Costo estimado",
}
const statusStyles = {
  "En proceso":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  "Esperando refacción":
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Terminado:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Entregado:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
}
const statusIcons = {
  "En proceso": WrenchIcon,
  "Esperando refacción": PackageIcon,
  Terminado: ClockIcon,
  Entregado: CircleCheckIcon,
}
export function EstadoBadge({ estado }: { estado: Vehiculo["estado"] }) {
  const Icon = statusIcons[estado]
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 text-[11px] whitespace-nowrap ${statusStyles[estado]}`}
    >
      <Icon className="size-3" />
      {estado}
    </Badge>
  )
}

function DraggableRow({
  row,
  onOpen,
  canDrag,
}: {
  row: Row<typeof features, Vehiculo>
  onOpen: (id: number) => void
  canDrag: boolean
}) {
  const {
    transform,
    transition,
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id: row.original.id, disabled: !canDrag })
  return (
    <TableRow
      ref={setNodeRef}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      className="relative z-0 cursor-pointer data-[dragging=true]:z-10 data-[dragging=true]:bg-muted data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={(event) => {
        if (
          !(event.target as HTMLElement).closest(
            "button, input, a, [role=checkbox], [role=menuitem]"
          )
        )
          onOpen(row.original.id)
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-3">
          {cell.column.id === "drag" ? (
            <Button
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="size-7 touch-none text-muted-foreground"
              disabled={!canDrag}
              aria-label={`Reordenar ${row.original.vehiculo}`}
              title={
                canDrag
                  ? "Arrastra para reordenar; con teclado, usa espacio y flechas"
                  : "Quita la ordenación para arrastrar"
              }
            >
              <GripVerticalIcon className="size-4" />
            </Button>
          ) : (
            <FlexRender cell={cell} />
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data,
  onDataChange,
  onSave,
  notes,
  mode = "dashboard",
}: {
  data: Vehiculo[]
  onDataChange: (data: Vehiculo[]) => void
  onSave: (item: Vehiculo, note: string) => void
  notes: Record<number, string>
  mode?: "dashboard" | "vehiculos" | "historial"
}) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [notice, setNotice] = React.useState("")
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const visibleData = React.useMemo(
    () =>
      data.filter((item) => {
        const inSection =
          mode === "vehiculos"
            ? item.estado !== "Entregado"
            : mode === "historial"
              ? item.estado === "Entregado"
              : true
        return (
          inSection &&
          buscarTexto(Object.values(item).join(" ")).includes(
            buscarTexto(query)
          )
        )
      }),
    [data, mode, query]
  )
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "drag",
          header: () => null,
          enableHiding: false,
          enableSorting: false,
        }),
        columnHelper.display({
          id: "select",
          enableHiding: false,
          enableSorting: false,
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={
                table.getIsSomePageRowsSelected() &&
                !table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Seleccionar toda la página"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`Seleccionar ${row.original.placas}`}
            />
          ),
        }),
        columnHelper.accessor("vehiculo", {
          header: "Vehículo",
          enableHiding: false,
          cell: ({ row }) => (
            <button
              className="text-left font-medium text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => setSelectedId(row.original.id)}
            >
              {row.original.vehiculo}
            </button>
          ),
        }),
        columnHelper.accessor("cliente", { header: "Cliente" }),
        columnHelper.accessor("placas", {
          header: "Placas",
          cell: ({ row }) => (
            <span className="rounded border bg-muted/40 px-2 py-1 font-mono text-xs">
              {row.original.placas}
            </span>
          ),
        }),
        columnHelper.accessor("servicio", { header: "Servicio" }),
        columnHelper.accessor("estado", {
          header: "Estado",
          filterFn: (row, columnId, value) => row.getValue(columnId) === value,
          cell: ({ row }) => <EstadoBadge estado={row.original.estado} />,
        }),
        columnHelper.accessor("mecanico", { header: "Mecánico" }),
        columnHelper.accessor("fecha_ingreso", {
          header: "Ingreso",
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
              {fecha(row.original.fecha_ingreso)}
            </span>
          ),
        }),
        columnHelper.accessor((row) => costoNumerico(row.costo_estimado), {
          id: "costo_estimado",
          header: "Costo estimado",
          cell: ({ row }) => (
            <span className="block text-right font-medium tabular-nums">
              {moneda(costoNumerico(row.original.costo_estimado))}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          enableHiding: false,
          enableSorting: false,
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={`Acciones de ${row.original.placas}`}
                  />
                }
              >
                <EllipsisVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSelectedId(row.original.id)}
                >
                  Ver detalle / editar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    []
  )
  const table = useTable({
    features,
    data: visibleData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      setSorting(updater)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })
  const rows = table.getRowModel().rows
  const selected = data.find((item) => item.id === selectedId) ?? null
  const status = String(
    columnFilters.find((filter) => filter.id === "estado")?.value ?? "todos"
  )
  const statusOptions = [
    { label: "Todos los estados", value: "todos" },
    ...estados
      .filter((value) =>
        mode === "vehiculos"
          ? value !== "Entregado"
          : mode === "historial"
            ? value === "Entregado"
            : true
      )
      .map((value) => ({ label: value, value })),
  ]
  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!sorting.length && over && active.id !== over.id) {
      const from = data.findIndex((item) => item.id === active.id)
      const to = data.findIndex((item) => item.id === over.id)
      if (from >= 0 && to >= 0) onDataChange(arrayMove(data, from, to))
    }
  }
  function exportRows() {
    const selection = table.getFilteredSelectedRowModel().rows
    const exportData = selection.length
      ? selection
      : table.getFilteredRowModel().rows
    const fields = Object.keys(columnLabels) as (keyof Vehiculo)[]
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`
    const csv = [
      Object.values(columnLabels).map(quote).join(","),
      ...exportData.map(({ original }) =>
        fields.map((key) => quote(String(original[key]))).join(",")
      ),
    ].join("\r\n")
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "autospeed-vehiculos.csv"
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`${exportData.length} vehículos exportados.`)
  }
  return (
    <section
      className="flex min-w-0 flex-col gap-4 px-4 lg:px-6"
      aria-label="Tabla de vehículos"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">
            {mode === "historial"
              ? "Vehículos entregados"
              : mode === "vehiculos"
                ? "Vehículos en servicio"
                : "Control de vehículos"}
          </h3>
          <Badge variant="secondary">
            {table.getFilteredRowModel().rows.length}
          </Badge>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Columns3Icon />
              Columnas
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide() && column.accessorFn)
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id]}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={exportRows}
            disabled={!table.getFilteredRowModel().rows.length}
          >
            <ArrowDownToLineIcon />
            Exportar CSV
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Buscar vehículos"
            placeholder="Buscar cliente, vehículo, placas o mecánico…"
            className="pl-9"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              table.setPageIndex(0)
            }}
          />
        </div>
        <Select
          items={statusOptions}
          value={status}
          onValueChange={(value) => {
            table
              .getColumn("estado")
              ?.setFilterValue(value === "todos" ? undefined : value)
            table.setPageIndex(0)
          }}
        >
          <SelectTrigger
            aria-label="Filtrar por estado"
            className="w-full sm:w-52"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(query || status !== "todos" || sorting.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("")
              table.resetColumnFilters()
              table.resetSorting()
              table.setPageIndex(0)
            }}
          >
            Restablecer vista
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Abre un vehículo para consultar o editar su servicio.{" "}
        {sorting.length
          ? "Restablece la vista para reordenar filas manualmente."
          : "Arrastra el asa de una fila para cambiar su orden."}
      </p>
      <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
        <DndContext
          id={sortableId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          accessibility={{
            screenReaderInstructions: {
              draggable:
                "Pulsa espacio para tomar una fila, usa las flechas para moverla y espacio para soltarla. Escape cancela.",
            },
            announcements: {
              onDragStart: () => "Fila seleccionada para mover.",
              onDragOver: ({ over }) =>
                over ? "Fila sobre una nueva posición." : "Fuera de la tabla.",
              onDragEnd: () => "Orden actualizado.",
              onDragCancel: () => "Movimiento cancelado.",
            },
          }}
        >
          <Table>
            <TableHeader className="bg-muted/60">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="flex items-center gap-1.5 py-3 text-xs font-medium hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <FlexRender header={header} />
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUpIcon className="size-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDownIcon className="size-3" />
                          ) : (
                            <ArrowUpDownIcon className="size-3 text-muted-foreground" />
                          )}
                        </button>
                      ) : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <SortableContext
                items={rows.map((row) => row.original.id)}
                strategy={verticalListSortingStrategy}
              >
                {rows.length ? (
                  rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      onOpen={setSelectedId}
                      canDrag={!sorting.length}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getVisibleLeafColumns().length}
                      className="h-40 text-center"
                    >
                      <CarFrontIcon className="mx-auto mb-2 size-7 text-muted-foreground" />
                      <p className="font-medium">No se encontraron vehículos</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Prueba con otro nombre o restablece los filtros.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <p className="text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} vehículos seleccionados
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-xs">
              Filas
            </Label>
            <Select
              value={String(pagination.pageSize)}
              items={[5, 10, 20].map((size) => ({
                label: String(size),
                value: String(size),
              }))}
              onValueChange={(value) => {
                if (value) table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger id="rows-per-page" size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span>
            Página {pagination.pageIndex + 1} de{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Primera página"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página anterior"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Página siguiente"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Última página"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {notice}
      </p>
      <VehicleDetail
        item={selected}
        note={selected ? notes[selected.id] : undefined}
        onClose={() => setSelectedId(null)}
        onSave={(item, note) => {
          onSave(item, note)
          table.setPageIndex(0)
          setNotice(`Servicio de ${item.vehiculo} actualizado en la demo.`)
        }}
      />
    </section>
  )
}

export function VehicleDetail({
  item,
  note,
  onClose,
  onSave,
}: {
  item: Vehiculo | null
  note?: string
  onClose: () => void
  onSave: (item: Vehiculo, note: string) => void
}) {
  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side="right"
        className="w-full! overflow-y-auto sm:max-w-lg!"
        showCloseButton={false}
      >
        {item && (
          <VehicleForm
            key={item.id}
            item={item}
            note={note}
            onSave={(updated, updatedNote) => {
              onSave(updated, updatedNote)
              onClose()
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function VehicleForm({
  item,
  note,
  onSave,
}: {
  item: Vehiculo
  note?: string
  onSave: (item: Vehiculo, note: string) => void
}) {
  const client = workshop.clientes.find(
    (customer) => customer.nombre === item.cliente
  )
  const [status, setStatus] = React.useState(item.estado)
  const [mechanic, setMechanic] = React.useState(item.mecanico)
  const [cost, setCost] = React.useState(
    String(costoNumerico(item.costo_estimado))
  )
  const [draftNote, setDraftNote] = React.useState(
    note ?? client?.notas ?? "Sin notas registradas."
  )
  return (
    <>
      <SheetHeader className="border-b p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CarFrontIcon className="size-5" />
          </span>
          <SheetClose render={<Button variant="ghost" size="sm" />}>
            Cerrar
          </SheetClose>
        </div>
        <SheetTitle className="font-sans text-xl tracking-tight normal-case">
          {item.vehiculo}
        </SheetTitle>
        <SheetDescription>
          Orden AS-{String(item.id).padStart(4, "0")} · {item.placas}
        </SheetDescription>
        <div className="mt-3">
          <EstadoBadge estado={item.estado} />
        </div>
      </SheetHeader>
      <form
        className="flex flex-1 flex-col gap-6 p-6"
        onSubmit={(event) => {
          event.preventDefault()
          const numericCost = Number(cost)
          if (!Number.isFinite(numericCost) || numericCost < 0) return
          onSave(
            {
              ...item,
              estado: status,
              mecanico: mechanic,
              costo_estimado: new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
                minimumFractionDigits: 2,
              }).format(numericCost),
            },
            draftNote
          )
        }}
      >
        <section className="space-y-3">
          <h3 className="font-semibold">Cliente y contacto</h3>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="font-medium">{item.cliente}</p>
            <p className="mt-2 text-muted-foreground">
              {client?.telefono ?? "Sin teléfono"}
            </p>
            <p className="break-all text-muted-foreground">
              {client?.email ?? "Sin correo"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Datos de contacto ficticios para esta demo.
            </p>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-semibold">Servicio actual</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Servicio</dt>
              <dd className="mt-1 font-medium">{item.servicio}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Fecha de ingreso
              </dt>
              <dd className="mt-1">{fecha(item.fecha_ingreso)}</dd>
            </div>
          </dl>
          <div className="space-y-2">
            <Label htmlFor="detail-status">Estado del servicio</Label>
            <Select
              value={status}
              items={estados.map((value) => ({ label: value, value }))}
              onValueChange={(value) => {
                if (value) setStatus(value as Vehiculo["estado"])
              }}
            >
              <SelectTrigger id="detail-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estados.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-mechanic">Mecánico asignado</Label>
            <Select
              value={mechanic}
              items={mecanicos.map((value) => ({ label: value, value }))}
              onValueChange={(value) => {
                if (value) setMechanic(value)
              }}
            >
              <SelectTrigger id="detail-mechanic" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mecanicos.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-cost">Costo estimado (MXN)</Label>
            <Input
              id="detail-cost"
              type="number"
              min="0"
              step="0.01"
              required
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-note">Notas del mecánico</Label>
            <textarea
              id="detail-note"
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-ring"
            />
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold">Historial de servicios anteriores</h3>
          {client?.historial.length ? (
            client.historial.map((service) => (
              <div key={service.fecha} className="rounded-xl border p-4">
                <div className="flex justify-between gap-3">
                  <p className="font-medium">{service.servicio}</p>
                  <span className="shrink-0 font-medium">
                    {moneda(service.costo)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {fecha(service.fecha)} · {service.mecanico}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {service.vehiculo}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Primera visita: este cliente aún no tiene servicios anteriores.
            </p>
          )}
        </section>
        <div className="mt-auto space-y-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Los cambios se conservan al navegar y se reinician al recargar la
            página.
          </p>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Guardar cambios
            </Button>
            <SheetClose render={<Button variant="outline" />}>
              Cancelar
            </SheetClose>
          </div>
        </div>
      </form>
    </>
  )
}
