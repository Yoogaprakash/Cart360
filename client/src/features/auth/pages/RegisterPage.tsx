import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../api/authApi";
import { getErrorMessage } from "../../../lib/errorMessage";

const schema = z
  .object({
    companyName: z.string().min(1, "Company name is required").max(200),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a digit"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: "", firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" }
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authApi.register(values);
      navigate("/verify-email", { state: { email: values.email } });
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to register your company. Please try again."));
    }
  };

  return (
    <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Register your company
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start free — upgrade any time as your business grows
        </Typography>
      </Stack>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Controller
        name="companyName"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Company name" error={!!errors.companyName} helperText={errors.companyName?.message} fullWidth />
        )}
      />

      <Grid container spacing={2}>
        <Grid size={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="First name" error={!!errors.firstName} helperText={errors.firstName?.message} fullWidth />
            )}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => <TextField {...field} label="Last name" fullWidth />}
          />
        </Grid>
      </Grid>

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Work email" type="email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => <TextField {...field} label="Phone (optional)" fullWidth />}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Password" type="password" error={!!errors.password} helperText={errors.password?.message} fullWidth />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirm password"
            type="password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
          />
        )}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Creating your account…" : "Create account"}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        Already have an account?{" "}
        <Link component={RouterLink} to="/login" underline="hover">
          Sign in
        </Link>
      </Typography>
    </Stack>
  );
}
