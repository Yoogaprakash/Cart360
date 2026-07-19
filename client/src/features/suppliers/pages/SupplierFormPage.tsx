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
import { useCreateSupplier, useSupplierQuery, useUpdateSupplier } from "../api/useSuppliers";

const schema = z.object({
  name: z.string().min(1, "Supplier name is required").max(200),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean()
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "", gstNumber: "", phone: "", email: "", addressLine1: "", addressLine2: "",
  city: "", state: "", postalCode: "", notes: "", isActive: true
};

export function SupplierFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: supplier, isLoading } = useSupplierQuery(id);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier(id ?? "");
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name, gstNumber: supplier.gstNumber ?? "", phone: supplier.phone ?? "", email: supplier.email ?? "",
        addressLine1: supplier.addressLine1 ?? "", addressLine2: supplier.addressLine2 ?? "", city: supplier.city ?? "",
        state: supplier.state ?? "", postalCode: supplier.postalCode ?? "", notes: supplier.notes ?? "", isActive: supplier.isActive
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      if (isEditMode) await updateSupplier.mutateAsync(values);
      else await createSupplier.mutateAsync(values);
      navigate("/app/suppliers");
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to save the supplier."));
    }
  };

  if (isEditMode && isLoading) {
    return <Stack sx={{ alignItems: "center", py: 8 }}><CircularProgress /></Stack>;
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{isEditMode ? "Edit Supplier" : "New Supplier"}</Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Supplier name" error={!!errors.name} helperText={errors.name?.message} fullWidth />
            )} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Phone" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
              )} /></Grid>
              <Grid size={12}><Controller name="gstNumber" control={control} render={({ field }) => <TextField {...field} label="GST number" fullWidth />} /></Grid>
              <Grid size={12}><Controller name="addressLine1" control={control} render={({ field }) => <TextField {...field} label="Address line 1" fullWidth />} /></Grid>
              <Grid size={12}><Controller name="addressLine2" control={control} render={({ field }) => <TextField {...field} label="Address line 2" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="state" control={control} render={({ field }) => <TextField {...field} label="State" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="postalCode" control={control} render={({ field }) => <TextField {...field} label="Postal code" fullWidth />} /></Grid>
              <Grid size={12}><Controller name="notes" control={control} render={({ field }) => <TextField {...field} label="Notes" multiline rows={2} fullWidth />} /></Grid>
            </Grid>

            {isEditMode && (
              <Controller name="isActive" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Active" />
              )} />
            )}

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/app/suppliers")}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? "Saving…" : isEditMode ? "Save changes" : "Create supplier"}</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
