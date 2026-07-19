import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useMyCompanyQuery, useUpdateMyCompany } from "../api/useCompany";

const schema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  logoUrl: z.string().optional(),
  signatureUrl: z.string().optional(),
  termsAndConditions: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankBranch: z.string().optional(),
  upiId: z.string().optional(),
  upiQrUrl: z.string().optional(),
  isGstEnabled: z.boolean(),
  invoicePrefix: z.string().min(1).max(20),
  quotationPrefix: z.string().min(1).max(20),
  purchasePrefix: z.string().min(1).max(20),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #6366F1"),
  currency: z.string().length(3, "Use a 3-letter currency code, e.g. INR"),
  language: z.string().min(1).max(10),
  timezone: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function CompanySettingsPage() {
  const { data: company, isLoading } = useMyCompanyQuery();
  const updateCompany = useUpdateMyCompany();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", gstNumber: "", panNumber: "", addressLine1: "", addressLine2: "",
      city: "", state: "", postalCode: "", country: "India", phone: "", email: "",
      logoUrl: "", signatureUrl: "", termsAndConditions: "",
      bankName: "", bankAccountNumber: "", bankIfsc: "", bankBranch: "", upiId: "", upiQrUrl: "",
      isGstEnabled: true,
      invoicePrefix: "INV-", quotationPrefix: "QUO-", purchasePrefix: "PUR-",
      themeColor: "#6366F1", currency: "INR", language: "en", timezone: "Asia/Kolkata"
    }
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        gstNumber: company.gstNumber ?? "",
        panNumber: company.panNumber ?? "",
        addressLine1: company.addressLine1 ?? "",
        addressLine2: company.addressLine2 ?? "",
        city: company.city ?? "",
        state: company.state ?? "",
        postalCode: company.postalCode ?? "",
        country: company.country,
        phone: company.phone ?? "",
        email: company.email,
        logoUrl: company.logoUrl ?? "",
        signatureUrl: company.signatureUrl ?? "",
        termsAndConditions: company.termsAndConditions ?? "",
        bankName: company.bankName ?? "",
        bankAccountNumber: company.bankAccountNumber ?? "",
        bankIfsc: company.bankIfsc ?? "",
        bankBranch: company.bankBranch ?? "",
        upiId: company.upiId ?? "",
        upiQrUrl: company.upiQrUrl ?? "",
        isGstEnabled: company.isGstEnabled,
        invoicePrefix: company.invoicePrefix,
        quotationPrefix: company.quotationPrefix,
        purchasePrefix: company.purchasePrefix,
        themeColor: company.themeColor,
        currency: company.currency,
        language: company.language,
        timezone: company.timezone
      });
    }
  }, [company, reset]);

  const isGstEnabled = watch("isGstEnabled");
  const logoUrl = watch("logoUrl");

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSavedMessage(false);
    try {
      await updateCompany.mutateAsync(values);
      setSavedMessage(true);
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to save company settings."));
    }
  };

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 900 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Company Settings
      </Typography>

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {savedMessage && <Alert severity="success" onClose={() => setSavedMessage(false)}>Company settings saved.</Alert>}

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Company Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Stack spacing={1} sx={{ alignItems: "center" }}>
                  <Avatar src={logoUrl || undefined} variant="rounded" sx={{ width: 72, height: 72 }}>
                    {company?.name?.[0]}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">Logo preview</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 9 }}>
                <Controller name="logoUrl" control={control} render={({ field }) => (
                  <TextField {...field} label="Logo URL" helperText="Paste a hosted image URL — file upload coming soon" fullWidth />
                )} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Company name" error={!!errors.name} helperText={errors.name?.message} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="email" control={control} render={({ field }) => (
                  <TextField {...field} label="Company email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Phone" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="panNumber" control={control} render={({ field }) => <TextField {...field} label="PAN number" fullWidth />} />
              </Grid>

              <Grid size={12}><Controller name="addressLine1" control={control} render={({ field }) => <TextField {...field} label="Address line 1" fullWidth />} /></Grid>
              <Grid size={12}><Controller name="addressLine2" control={control} render={({ field }) => <TextField {...field} label="Address line 2" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="state" control={control} render={({ field }) => <TextField {...field} label="State" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="postalCode" control={control} render={({ field }) => <TextField {...field} label="Postal code" fullWidth />} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>GST</Typography>
            <Controller name="isGstEnabled" control={control} render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Enable GST on invoices and quotations"
              />
            )} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              When disabled, every new invoice and quotation is billed with zero tax, regardless of each product's GST rate.
            </Typography>
            {isGstEnabled && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="gstNumber" control={control} render={({ field }) => <TextField {...field} label="GSTIN" fullWidth />} />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Bank &amp; UPI Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="bankName" control={control} render={({ field }) => <TextField {...field} label="Bank name" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="bankAccountNumber" control={control} render={({ field }) => <TextField {...field} label="Account number" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="bankIfsc" control={control} render={({ field }) => <TextField {...field} label="IFSC code" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="bankBranch" control={control} render={({ field }) => <TextField {...field} label="Branch" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="upiId" control={control} render={({ field }) => <TextField {...field} label="UPI ID" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Controller name="upiQrUrl" control={control} render={({ field }) => <TextField {...field} label="UPI QR code URL" fullWidth />} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Documents</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="invoicePrefix" control={control} render={({ field }) => <TextField {...field} label="Invoice prefix" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="quotationPrefix" control={control} render={({ field }) => <TextField {...field} label="Quotation prefix" fullWidth />} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><Controller name="purchasePrefix" control={control} render={({ field }) => <TextField {...field} label="Purchase prefix" fullWidth />} /></Grid>
              <Grid size={12}>
                <Controller name="termsAndConditions" control={control} render={({ field }) => (
                  <TextField {...field} label="Default terms & conditions (shown on invoices)" multiline rows={3} fullWidth />
                )} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Appearance &amp; Locale</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="themeColor" control={control} render={({ field }) => (
                  <TextField {...field} label="Theme color" error={!!errors.themeColor} helperText={errors.themeColor?.message} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="currency" control={control} render={({ field }) => (
                  <TextField {...field} label="Currency" error={!!errors.currency} helperText={errors.currency?.message} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="language" control={control} render={({ field }) => <TextField {...field} label="Language" fullWidth />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="timezone" control={control} render={({ field }) => <TextField {...field} label="Timezone" fullWidth />} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider />

        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
