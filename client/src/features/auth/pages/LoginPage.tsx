import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useAuth } from "../../../store/AuthContext";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: false }
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      navigate(user.role === "SuperAdmin" ? "/admin/dashboard" : "/app/dashboard");
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to sign in. Check your credentials and try again."));
    }
  };

  return (
    <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your Cart360 account
        </Typography>
      </Stack>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Email" type="email" autoComplete="email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Password" type="password" autoComplete="current-password" error={!!errors.password} helperText={errors.password?.message} fullWidth />
        )}
      />

      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              label="Remember me"
            />
          )}
        />
        <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        New to Cart360?{" "}
        <Link component={RouterLink} to="/register" underline="hover">
          Register your company
        </Link>
      </Typography>
    </Stack>
  );
}
