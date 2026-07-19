import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useCreateCustomer, useCustomerQuery, useUpdateCustomer } from "../api/useCustomers";

const schema = z.object({
  name: z.string().min(1, "Customer name is required").max(200),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  creditLimit: z.coerce.number().min(0),
  notes: z.string().optional(),
  isActive: z.boolean()
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const defaultValues: FormInput = {
  name: "", gstNumber: "", phone: "", email: "", addressLine1: "", addressLine2: "",
  city: "", state: "", postalCode: "", creditLimit: 0, notes: "", isActive: true
};

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: customer, isLoading } = useCustomerQuery(id);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(id ?? "");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        gstNumber: customer.gstNumber ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        addressLine1: customer.addressLine1 ?? "",
        addressLine2: customer.addressLine2 ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
        postalCode: customer.postalCode ?? "",
        creditLimit: customer.creditLimit,
        notes: customer.notes ?? "",
        isActive: customer.isActive
      });
    }
  }, [customer, reset]);

  const onSubmit = async (values: FormOutput) => {
    setServerError(null);
    try {
      if (isEditMode) await updateCustomer.mutateAsync(values);
      else await createCustomer.mutateAsync(values);
      navigate("/app/customers");
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to save the customer."));
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {isEditMode ? "Edit Customer" : "New Customer"}
      </Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Customer name" error={!!errors.name} helperText={errors.name?.message} fullWidth />
            )} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Phone" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="email" control={control} render={({ field }) => (
                  <TextField {...field} label="Email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="gstNumber" control={control} render={({ field }) => <TextField {...field} label="GST number" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="creditLimit" control={control} render={({ field }) => <TextField {...field} label="Credit limit" type="number" fullWidth />} />
              </Grid>

              <Grid size={12}>
                <Controller name="addressLine1" control={control} render={({ field }) => <TextField {...field} label="Address line 1" fullWidth />} />
              </Grid>
              <Grid size={12}>
                <Controller name="addressLine2" control={control} render={({ field }) => <TextField {...field} label="Address line 2" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="state" control={control} render={({ field }) => <TextField {...field} label="State" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="postalCode" control={control} render={({ field }) => <TextField {...field} label="Postal code" fullWidth />} />
              </Grid>
              <Grid size={12}>
                <Controller name="notes" control={control} render={({ field }) => <TextField {...field} label="Notes" multiline rows={2} fullWidth />} />
              </Grid>
            </Grid>

            {isEditMode && (
              <Controller name="isActive" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Active" />
              )} />
            )}

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/app/customers")}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : isEditMode ? "Save changes" : "Create customer"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
