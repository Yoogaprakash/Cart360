import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useSuppliersQuery } from "../../suppliers/api/useSuppliers";
import { useProductsQuery } from "../../products/api/useProducts";
import { useMyCompanyQuery } from "../../company/api/useCompany";
import { useCreatePurchase } from "../api/usePurchases";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const itemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100)
});

const schema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  purchaseDate: z.string().min(1),
  referenceBillNumber: z.string().optional(),
  paidAmount: z.coerce.number().min(0),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one line item")
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const todayIso = () => new Date().toISOString().slice(0, 10);

export function PurchaseFormPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: suppliers } = useSuppliersQuery({ page: 1, pageSize: 200 });
  const { data: products } = useProductsQuery({ page: 1, pageSize: 500 });
  const { data: company } = useMyCompanyQuery();
  const createPurchase = useCreatePurchase();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      purchaseDate: todayIso(),
      referenceBillNumber: "",
      paidAmount: 0,
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0, discountPercent: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  const productById = useMemo(() => new Map((products?.items ?? []).map((p) => [p.id, p])), [products]);

  const isGstEnabled = company?.isGstEnabled ?? true;

  const totals = useMemo(() => {
    let subtotal = 0, discount = 0, cgst = 0, sgst = 0;
    for (const item of watchedItems ?? []) {
      const product = productById.get(item.productId);
      if (!product) continue;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discPct = Number(item.discountPercent) || 0;
      const lineSubtotal = qty * price;
      const lineDiscount = (lineSubtotal * discPct) / 100;
      const taxable = lineSubtotal - lineDiscount;
      subtotal += lineSubtotal;
      discount += lineDiscount;
      if (isGstEnabled) {
        cgst += (taxable * product.cgstPercent) / 100;
        sgst += (taxable * product.sgstPercent) / 100;
      }
    }
    const raw = subtotal - discount + cgst + sgst;
    const grandTotal = Math.round(raw);
    return { subtotal, discount, cgst, sgst, roundOff: grandTotal - raw, grandTotal };
  }, [watchedItems, productById, isGstEnabled]);

  const onSubmit = async (values: FormOutput) => {
    setServerError(null);
    try {
      const purchase = await createPurchase.mutateAsync({
        ...values,
        referenceBillNumber: values.referenceBillNumber || null
      });
      navigate(`/app/purchases/${purchase.id}`);
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to create the purchase."));
    }
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 960 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        New Purchase
      </Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="supplierId" control={control} render={({ field }) => (
                  <TextField {...field} select label="Supplier" error={!!errors.supplierId} helperText={errors.supplierId?.message} fullWidth>
                    {(suppliers?.items ?? []).map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="purchaseDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Purchase date" type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="referenceBillNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Reference bill number" fullWidth />
                )} />
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Line items</Typography>
              <Button
                size="small"
                startIcon={<FiPlus />}
                onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, discountPercent: 0 })}
              >
                Add item
              </Button>
            </Stack>
            {errors.items?.message && <Alert severity="error">{errors.items.message}</Alert>}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell width={110}>Qty</TableCell>
                  <TableCell width={130}>Unit Price</TableCell>
                  <TableCell width={110}>Discount %</TableCell>
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            select
                            size="small"
                            fullWidth
                            error={!!errors.items?.[index]?.productId}
                            onChange={(e) => {
                              f.onChange(e);
                              const product = productById.get(e.target.value);
                              if (product) {
                                setValue(`items.${index}.unitPrice`, product.purchasePrice);
                              }
                            }}
                          >
                            {(products?.items ?? []).map((p) => (
                              <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller name={`items.${index}.quantity`} control={control} render={({ field: f }) => (
                        <TextField {...f} type="number" size="small" fullWidth />
                      )} />
                    </TableCell>
                    <TableCell>
                      <Controller name={`items.${index}.unitPrice`} control={control} render={({ field: f }) => (
                        <TextField {...f} type="number" size="small" fullWidth />
                      )} />
                    </TableCell>
                    <TableCell>
                      <Controller name={`items.${index}.discountPercent`} control={control} render={({ field: f }) => (
                        <TextField {...f} type="number" size="small" fullWidth />
                      )} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" disabled={fields.length === 1} onClick={() => remove(index)}>
                        <FiTrash2 size={15} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="notes" control={control} render={({ field }) => (
                  <TextField {...field} label="Notes (optional)" multiline rows={3} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75} sx={{ p: 2, borderRadius: 2, backgroundColor: "action.hover" }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2">₹{totals.subtotal.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                    <Typography variant="body2">−₹{totals.discount.toFixed(2)}</Typography>
                  </Stack>
                  {isGstEnabled && (
                    <>
                      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">CGST</Typography>
                        <Typography variant="body2">₹{totals.cgst.toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">SGST</Typography>
                        <Typography variant="body2">₹{totals.sgst.toFixed(2)}</Typography>
                      </Stack>
                    </>
                  )}
                  <Divider />
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{totals.grandTotal.toFixed(2)}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="paidAmount" control={control} render={({ field }) => (
                  <TextField {...field} label="Amount paid now" type="number" helperText="Leave 0 if this is a credit purchase" fullWidth />
                )} />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/app/purchases")}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Create purchase"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
