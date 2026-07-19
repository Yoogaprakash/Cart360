import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useAuth } from "../../../store/AuthContext";
import { useDeleteProduct, useProductsQuery } from "../api/useProducts";
import type { Product } from "../types";

export function ProductsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isFetching } = useProductsQuery({ page, pageSize, search: debouncedSearch || undefined });
  const deleteProduct = useDeleteProduct();

  const canEdit = hasPermission("Products", "edit");
  const canDelete = hasPermission("Products", "delete");

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        header: "Product",
        accessorKey: "name",
        cell: ({ row }) => (
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SKU: {row.original.sku}
            </Typography>
          </Stack>
        )
      },
      { header: "Unit", accessorKey: "unitName" },
      {
        header: "Selling Price",
        accessorKey: "sellingPrice",
        cell: ({ getValue }) => `₹${(getValue<number>() ?? 0).toFixed(2)}`
      },
      {
        header: "Stock",
        accessorKey: "currentStock",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography variant="body2">{row.original.currentStock}</Typography>
            {row.original.isLowStock && (
              <Tooltip title="Low stock">
                <span style={{ display: "flex" }}>
                  <FiAlertTriangle color="#EC4899" size={14} />
                </span>
              </Tooltip>
            )}
          </Stack>
        )
      },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ getValue }) => (
          <Chip size="small" label={getValue() ? "Active" : "Inactive"} color={getValue() ? "success" : "default"} />
        )
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
            {canEdit && (
              <IconButton size="small" onClick={() => navigate(`/app/products/${row.original.id}/edit`)}>
                <FiEdit2 size={15} />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size="small" color="error" onClick={() => deleteProduct.mutate(row.original.id)}>
                <FiTrash2 size={15} />
              </IconButton>
            )}
          </Stack>
        )
      }
    ],
    [canEdit, canDelete, navigate, deleteProduct]
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Products
        </Typography>
        {hasPermission("Products", "create") && (
          <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate("/app/products/new")}>
            New Product
          </Button>
        )}
      </Stack>

      <TextField
        placeholder="Search by name, SKU, or barcode…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
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
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
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
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover sx={{ opacity: isFetching ? 0.6 : 1 }}>
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
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(1);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Card>
    </Stack>
  );
}
