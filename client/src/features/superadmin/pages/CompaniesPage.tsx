import { useState } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FiMoreVertical } from "react-icons/fi";
import { useCompaniesQuery, useCompanyActions } from "../api/useCompanies";
import type { CompanyListItem, TenantStatus } from "../types";

const STATUS_COLOR: Record<TenantStatus, "warning" | "success" | "error" | "default"> = {
  Pending: "warning",
  Active: "success",
  Suspended: "error",
  Rejected: "default"
};

export function CompaniesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useCompaniesQuery({ page, pageSize });
  const actions = useCompanyActions();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyListItem | null>(null);
  const [reasonDialog, setReasonDialog] = useState<"suspend" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openMenu = (event: React.MouseEvent<HTMLElement>, company: CompanyListItem) => {
    setMenuAnchor(event.currentTarget);
    setActiveCompany(company);
  };
  const closeMenu = () => setMenuAnchor(null);

  const handleReasonSubmit = async () => {
    if (!activeCompany || !reasonDialog) return;
    if (reasonDialog === "suspend") await actions.suspend.mutateAsync({ tenantId: activeCompany.id, reason });
    else await actions.reject.mutateAsync({ tenantId: activeCompany.id, reason });
    setReasonDialog(null);
    setReason("");
  };

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Companies
      </Typography>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {company.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {company.email}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{company.planName ?? "—"}</TableCell>
                  <TableCell>{company.userCount}</TableCell>
                  <TableCell>
                    <Chip size="small" label={company.status} color={STATUS_COLOR[company.status]} />
                  </TableCell>
                  <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => openMenu(e, company)}>
                      <FiMoreVertical size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No companies registered yet.
                </TableCell>
              </TableRow>
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        {activeCompany?.status === "Pending" && [
          <MenuItem key="approve" onClick={() => { actions.approve.mutate(activeCompany.id); closeMenu(); }}>
            Approve
          </MenuItem>,
          <MenuItem key="reject" onClick={() => { setReasonDialog("reject"); closeMenu(); }}>
            Reject
          </MenuItem>
        ]}
        {activeCompany?.status === "Active" && (
          <MenuItem onClick={() => { setReasonDialog("suspend"); closeMenu(); }}>Suspend</MenuItem>
        )}
        {activeCompany?.status === "Suspended" && (
          <MenuItem onClick={() => { actions.reactivate.mutate(activeCompany.id); closeMenu(); }}>Reactivate</MenuItem>
        )}
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            setConfirmDelete(true);
            closeMenu();
          }}
        >
          Delete permanently
        </MenuItem>
      </Menu>

      <Dialog open={reasonDialog !== null} onClose={() => setReasonDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{reasonDialog === "suspend" ? "Suspend company" : "Reject registration"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReasonDialog(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={!reason} onClick={handleReasonSubmit}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete "{activeCompany?.name}" permanently?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone. All products, invoices, customers, and other data belonging to this company will be
            permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (activeCompany) await actions.remove.mutateAsync(activeCompany.id);
              setConfirmDelete(false);
            }}
          >
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
