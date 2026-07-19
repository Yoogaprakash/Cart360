import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { getErrorMessage } from "../../../lib/errorMessage";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Forgot your password?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email and we'll send you a reset code.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />

      <Button variant="contained" size="large" onClick={handleSubmit} disabled={isSubmitting || !email} fullWidth>
        {isSubmitting ? "Sending…" : "Send reset code"}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to sign in
        </Link>
      </Typography>
    </Stack>
  );
}
