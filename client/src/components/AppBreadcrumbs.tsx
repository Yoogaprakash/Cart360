import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Link as RouterLink, useLocation } from "react-router-dom";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function humanize(segment: string) {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppBreadcrumbs() {
  const location = useLocation();
  const allSegments = location.pathname.split("/").filter(Boolean);

  const crumbs = allSegments
    .map((segment, index) => ({
      label: segment,
      path: "/" + allSegments.slice(0, index + 1).join("/")
    }))
    // Drop "app"/"admin" (routing-only prefixes) and raw record IDs — a detail
    // page always has its own heading naming the record, so a bare GUID crumb
    // is redundant at best and unreadable at worst.
    .filter((crumb) => crumb.label !== "app" && crumb.label !== "admin" && !UUID_PATTERN.test(crumb.label));

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumbs sx={{ mb: 2 }}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return isLast ? (
          <Typography key={crumb.path} color="text.primary" sx={{ fontWeight: 600 }}>
            {humanize(crumb.label)}
          </Typography>
        ) : (
          <Link key={crumb.path} component={RouterLink} to={crumb.path} underline="hover" color="inherit">
            {humanize(crumb.label)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
