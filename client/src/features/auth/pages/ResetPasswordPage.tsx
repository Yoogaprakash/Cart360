import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { getErrorMessage } from "../../../lib/errorMessage";

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      navigate("/login", { state: { justReset: true } });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reset password. Check the code and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Reset your password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the code we sent to your email along with your new password.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
      <TextField
        label="Reset code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }}
        fullWidth
      />
      <TextField label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
      <TextField label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />

      <Button variant="contained" size="large" onClick={handleSubmit} disabled={isSubmitting || code.length !== 6 || !email || !newPassword} fullWidth>
        {isSubmitting ? "Resetting…" : "Reset password"}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to sign in
        </Link>
      </Typography>
    </Stack>
  );
}
