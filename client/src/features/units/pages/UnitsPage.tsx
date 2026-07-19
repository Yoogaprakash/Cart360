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
import { useCreateUnit, useDeleteUnit, useUnitsQuery } from "../api/useUnits";

export function UnitsPage() {
  const { data: units, isLoading } = useUnitsQuery();
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    try {
      await createUnit.mutateAsync({ name, shortCode });
      setOpen(false);
      setName("");
      setShortCode("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Units of Measure
        </Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>
          New Unit
        </Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Short Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units?.map((unit) => (
              <TableRow key={unit.id} hover>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.shortCode}</TableCell>
                <TableCell>
                  <Chip size="small" label={unit.isActive ? "Active" : "Inactive"} color={unit.isActive ? "success" : "default"} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => deleteUnit.mutate(unit.id)}>
                    <FiTrash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && units?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No units yet. Create one to start adding products.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Unit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" placeholder="e.g. Kilogram" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
            <TextField label="Short code" placeholder="e.g. kg" value={shortCode} onChange={(e) => setShortCode(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name || !shortCode || createUnit.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
