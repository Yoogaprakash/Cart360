import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useUnitsQuery } from "../../units/api/useUnits";
import { useCreateProduct, useProductQuery, useUpdateProduct } from "../api/useProducts";

const schema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(100),
  barcode: z.string().optional(),
  hsnCode: z.string().optional(),
  unitId: z.string().min(1, "Select a unit"),
  gstPercent: z.coerce.number().min(0).max(100),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  openingStock: z.coerce.number().min(0),
  minStockLevel: z.coerce.number().min(0),
  trackInventory: z.boolean(),
  trackBatches: z.boolean(),
  isActive: z.boolean()
});

// z.coerce.number() makes the schema's *input* type "unknown" (anything coercible)
// while its *output* type (after parsing) is "number" — so the form's field values
// (input) and the submit handler's values (output) are deliberately different types.
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const defaultValues: FormInput = {
  name: "",
  sku: "",
  barcode: "",
  hsnCode: "",
  unitId: "",
  gstPercent: 18,
  purchasePrice: 0,
  sellingPrice: 0,
  mrp: 0,
  openingStock: 0,
  minStockLevel: 0,
  trackInventory: true,
  trackBatches: false,
  isActive: true
};

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: units, isLoading: unitsLoading } = useUnitsQuery();
  const { data: product, isLoading: productLoading } = useProductQuery(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(id ?? "");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? "",
        hsnCode: product.hsnCode ?? "",
        unitId: product.unitId,
        gstPercent: product.gstPercent,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        openingStock: product.openingStock,
        minStockLevel: product.minStockLevel,
        trackInventory: product.trackInventory,
        trackBatches: product.trackBatches,
        isActive: product.isActive
      });
    }
  }, [product, reset]);

  const onSubmit = async (values: FormOutput) => {
    setServerError(null);
    try {
      if (isEditMode) {
        await updateProduct.mutateAsync(values);
      } else {
        await createProduct.mutateAsync(values);
      }
      navigate("/app/products");
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to save the product."));
    }
  };

  if ((isEditMode && productLoading) || unitsLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {isEditMode ? "Edit Product" : "New Product"}
      </Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            {!units?.length && (
              <Alert severity="info">You don't have any units yet — create one from the Units page before adding products.</Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Product name" error={!!errors.name} helperText={errors.name?.message} fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => <TextField {...field} label="SKU" error={!!errors.sku} helperText={errors.sku?.message} fullWidth />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Barcode (optional)" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="hsnCode"
                  control={control}
                  render={({ field }) => <TextField {...field} label="HSN code (optional)" fullWidth />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Unit" error={!!errors.unitId} helperText={errors.unitId?.message} fullWidth>
                      {(units ?? []).map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.shortCode})
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="gstPercent"
                  control={control}
                  render={({ field }) => <TextField {...field} label="GST %" type="number" fullWidth />}
                />
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="purchasePrice"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Purchase price" type="number" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="sellingPrice"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Selling price" type="number" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="mrp" control={control} render={({ field }) => <TextField {...field} label="MRP" type="number" fullWidth />} />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="openingStock"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Opening stock" type="number" disabled={isEditMode} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="minStockLevel"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Minimum stock level" type="number" fullWidth />}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
              <Controller
                name="trackInventory"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Track inventory" />
                )}
              />
              <Controller
                name="trackBatches"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Track batches/expiry" />
                )}
              />
              {isEditMode && (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Active" />
                  )}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/app/products")}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || !units?.length}>
                {isSubmitting ? "Saving…" : isEditMode ? "Save changes" : "Create product"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
