import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useCreateWarehouse, useDeleteWarehouse, useWarehousesQuery } from "../api/useWarehouses";

export function WarehousesPage() {
  const { data: warehouses, isLoading } = useWarehousesQuery();
  const createWarehouse = useCreateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    try {
      await createWarehouse.mutateAsync({ name, code, address: address || null, isDefault });
      setOpen(false);
      setName(""); setCode(""); setAddress(""); setIsDefault(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Warehouses</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>New Warehouse</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses?.map((w) => (
              <TableRow key={w.id} hover>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.code}</TableCell>
                <TableCell>{w.address ?? "—"}</TableCell>
                <TableCell>{w.isDefault ? <Chip size="small" label="Default" color="primary" /> : "—"}</TableCell>
                <TableCell><Chip size="small" label={w.isActive ? "Active" : "Inactive"} color={w.isActive ? "success" : "default"} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => deleteWarehouse.mutate(w.id)}>
                    <FiTrash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && warehouses?.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>No warehouses yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Warehouse</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
            <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
            <TextField label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
            <FormControlLabel control={<Switch checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />} label="Set as default warehouse" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name || !code || createWarehouse.isPending}>Create</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
