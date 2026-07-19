import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/AuthContext";
import { usePurchaseReturnsQuery } from "../api/useReturns";
import type { PurchaseReturn, ReturnStatus } from "../types";

const STATUS_COLOR: Record<ReturnStatus, "default" | "success" | "error"> = {
  Draft: "default", Completed: "success", Cancelled: "error"
};

export function PurchaseReturnsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching } = usePurchaseReturnsQuery({ page, pageSize });

  const columns = useMemo<ColumnDef<PurchaseReturn>[]>(
    () => [
      {
        header: "Return #",
        accessorKey: "returnNumber",
        cell: ({ row }) => (
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.returnNumber}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(row.original.returnDate).toLocaleDateString()}</Typography>
          </Stack>
        )
      },
      { header: "Purchase #", accessorKey: "purchaseNumber" },
      { header: "Supplier", accessorKey: "supplierName" },
      { header: "Grand Total", accessorKey: "grandTotal", cell: ({ getValue }) => `₹${(getValue<number>() ?? 0).toFixed(2)}` },
      { header: "Status", accessorKey: "status", cell: ({ getValue }) => { const s = getValue<ReturnStatus>(); return <Chip size="small" label={s} color={STATUS_COLOR[s]} />; } }
    ],
    []
  );

  const table = useReactTable({ data: data?.items ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Purchase Returns</Typography>
        {hasPermission("PurchaseReturns", "create") && (
          <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate("/app/purchase-returns/new")}>New Purchase Return</Button>
        )}
      </Stack>

      <Card>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>{hg.headers.map((h) => <TableCell key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableCell>)}</TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: "text.secondary" }}>No purchase returns found.</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover sx={{ opacity: isFetching ? 0.6 : 1 }}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {data && (
          <TablePagination
            component="div" count={data.totalCount} page={page - 1}
            onPageChange={(_, p) => setPage(p + 1)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Card>
    </Stack>
  );
}
