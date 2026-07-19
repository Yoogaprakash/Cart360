import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { FiKey, FiPlus, FiTrash2 } from "react-icons/fi";
import { getErrorMessage } from "../../../lib/errorMessage";
import {
  useDeleteUser,
  useInviteUser,
  useSetUserPermissions,
  useUpdateUserStatus,
  useUsersQuery
} from "../api/useUsers";
import type { CompanyUser, UserPermission, UserRole } from "../types";

const MODULES = [
  "Invoices", "Quotations", "Products", "Categories", "Brands", "Units", "Customers", "Suppliers",
  "Purchases", "PurchaseReturns", "SalesReturns", "Inventory", "StockAdjustments", "Warehouses",
  "Expenses", "Income", "Reports"
];

const ACTIONS: { key: keyof Omit<UserPermission, "module">; label: string }[] = [
  { key: "canView", label: "View" },
  { key: "canCreate", label: "Create" },
  { key: "canEdit", label: "Edit" },
  { key: "canDelete", label: "Delete" },
  { key: "canPrint", label: "Print" },
  { key: "canExport", label: "Export" }
];

function defaultPermissions(): UserPermission[] {
  return MODULES.map((module) => ({
    module, canView: false, canCreate: false, canEdit: false, canDelete: false, canPrint: false, canExport: false
  }));
}

export function UsersPage() {
  const { data: users, isLoading } = useUsersQuery();
  const inviteUser = useInviteUser();
  const updateStatus = useUpdateUserStatus();
  const setPermissions = useSetUserPermissions();
  const deleteUser = useDeleteUser();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [permissionsUser, setPermissionsUser] = useState<CompanyUser | null>(null);
  const [permissions, setPermissionsState] = useState<UserPermission[]>([]);

  const resetInviteForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setRole("Employee"); setTemporaryPassword(""); setError(null);
  };

  const handleInvite = async () => {
    setError(null);
    try {
      await inviteUser.mutateAsync({
        firstName, lastName: lastName || null, email, phone: phone || null, role, temporaryPassword
      });
      setInviteOpen(false);
      resetInviteForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openPermissions = (user: CompanyUser) => {
    setPermissionsUser(user);
    const merged = defaultPermissions().map((def) => user.permissions.find((p) => p.module === def.module) ?? def);
    setPermissionsState(merged);
  };

  const permissionsRows = useMemo(() => permissions, [permissions]);

  const togglePermission = (module: string, key: keyof Omit<UserPermission, "module">) => {
    setPermissionsState((prev) => prev.map((p) => (p.module === module ? { ...p, [key]: !p[key] } : p)));
  };

  const handleSavePermissions = async () => {
    if (!permissionsUser) return;
    try {
      await setPermissions.mutateAsync({ id: permissionsUser.id, payload: { permissions } });
      setPermissionsUser(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Users</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setInviteOpen(true)}>Invite User</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : (users?.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>No team members yet.</TableCell></TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName} {user.lastName ?? ""}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Chip size="small" label={user.role} /></TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isActive}
                      onChange={(e) => updateStatus.mutate({ id: user.id, payload: { isActive: e.target.checked } })}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {user.role === "Employee" && (
                      <IconButton size="small" onClick={() => openPermissions(user)}>
                        <FiKey size={15} />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => deleteUser.mutate(user.id)}>
                      <FiTrash2 size={15} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth autoFocus />
            <TextField label="Last name (optional)" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} fullWidth>
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="CompanyUser">Company User (read-only)</MenuItem>
            </TextField>
            <TextField label="Temporary password" type="text" value={temporaryPassword} onChange={(e) => setTemporaryPassword(e.target.value)} fullWidth helperText="Share this with the user — they can change it after logging in." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={!firstName || !email || !temporaryPassword || inviteUser.isPending}>
            Send invite
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!permissionsUser} onClose={() => setPermissionsUser(null)} fullWidth maxWidth="md">
        <DialogTitle>Permissions — {permissionsUser?.firstName}</DialogTitle>
        <DialogContent>
          <Stack sx={{ pt: 1, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  {ACTIONS.map((a) => <TableCell key={a.key} align="center">{a.label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {permissionsRows.map((row) => (
                  <TableRow key={row.module}>
                    <TableCell>{row.module}</TableCell>
                    {ACTIONS.map((a) => (
                      <TableCell key={a.key} align="center">
                        <Checkbox size="small" checked={row[a.key]} onChange={() => togglePermission(row.module, a.key)} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPermissionsUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePermissions} disabled={setPermissions.isPending}>
            Save permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
