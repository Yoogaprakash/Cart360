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

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await authApi.verifyEmail(email, code);
      navigate("/login", { state: { justVerified: true } });
    } catch (err) {
      setError(getErrorMessage(err, "Verification failed. Check the code and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setIsResending(true);
    try {
      await authApi.resendOtp(email, "EmailVerification");
      setInfo("A new code has been sent if that email is registered.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Verify your email
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the 6-digit code we sent to your email address.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {info && <Alert severity="success">{info}</Alert>}

      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
      <TextField
        label="Verification code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric", style: { letterSpacing: 6, fontSize: 20, textAlign: "center" } } }}
        fullWidth
      />

      <Button variant="contained" size="large" onClick={handleVerify} disabled={isSubmitting || code.length !== 6 || !email} fullWidth>
        {isSubmitting ? "Verifying…" : "Verify email"}
      </Button>

      <Button variant="text" onClick={handleResend} disabled={isResending || !email}>
        {isResending ? "Sending…" : "Resend code"}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to sign in
        </Link>
      </Typography>
    </Stack>
  );
}
