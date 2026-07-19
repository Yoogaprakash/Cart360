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
import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useBrandsQuery, useCreateBrand, useDeleteBrand } from "../api/useBrands";

export function BrandsPage() {
  const { data: brands, isLoading } = useBrandsQuery();
  const createBrand = useCreateBrand();
  const deleteBrand = useDeleteBrand();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    try {
      await createBrand.mutateAsync({ name });
      setOpen(false);
      setName("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Brands</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>New Brand</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands?.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell>{b.name}</TableCell>
                <TableCell><Chip size="small" label={b.isActive ? "Active" : "Inactive"} color={b.isActive ? "success" : "default"} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => deleteBrand.mutate(b.id)}>
                    <FiTrash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && brands?.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>No brands yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Brand</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name || createBrand.isPending}>Create</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
