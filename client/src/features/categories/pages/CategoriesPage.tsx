import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
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
import { useCategoriesQuery, useCreateCategory, useDeleteCategory } from "../api/useCategories";

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategoriesQuery();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    try {
      await createCategory.mutateAsync({ name, parentCategoryId: parentCategoryId || null });
      setOpen(false);
      setName("");
      setParentCategoryId("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Categories</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>New Category</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories?.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.parentCategoryName ?? "—"}</TableCell>
                <TableCell><Chip size="small" label={c.isActive ? "Active" : "Inactive"} color={c.isActive ? "success" : "default"} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => deleteCategory.mutate(c.id)}>
                    <FiTrash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && categories?.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>No categories yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
            <TextField select label="Parent category (optional)" value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} fullWidth>
              <MenuItem value="">None</MenuItem>
              {categories?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name || createCategory.isPending}>Create</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
