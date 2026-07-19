import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useAuth } from "../../../store/AuthContext";
import { useQuotationsQuery } from "../api/useQuotations";
import type { Quotation, QuotationStatus } from "../types";

const STATUS_COLOR: Record<QuotationStatus, "default" | "warning" | "info" | "success" | "error"> = {
  Draft: "default",
  Sent: "info",
  Accepted: "success",
  Rejected: "error",
  Expired: "warning",
  Converted: "success"
};

export function QuotationsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isFetching } = useQuotationsQuery({ page, pageSize, search: debouncedSearch || undefined });

  const columns = useMemo<ColumnDef<Quotation>[]>(
    () => [
      {
        header: "Quotation #",
        accessorKey: "quotationNumber",
        cell: ({ row }) => (
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.quotationNumber}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(row.original.quotationDate).toLocaleDateString()}</Typography>
          </Stack>
        )
      },
      { header: "Customer", accessorKey: "customerName" },
      { header: "Grand Total", accessorKey: "grandTotal", cell: ({ getValue }) => `₹${(getValue<number>() ?? 0).toFixed(2)}` },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue<QuotationStatus>();
          return <Chip size="small" label={status} color={STATUS_COLOR[status]} />;
        }
      }
    ],
    []
  );

  const table = useReactTable({ data: data?.items ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Quotations</Typography>
        {hasPermission("Quotations", "create") && (
          <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate("/app/quotations/new")}>New Quotation</Button>
        )}
      </Stack>

      <TextField
        placeholder="Search by quotation number or customer…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        size="small"
        sx={{ maxWidth: 360 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> } }}
      />

      <Card>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No quotations found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => navigate(`/app/quotations/${row.original.id}`)}
                  sx={{ opacity: isFetching ? 0.6 : 1, cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data && (
          <TablePagination
            component="div"
            count={data.totalCount}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Card>
    </Stack>
  );
}
