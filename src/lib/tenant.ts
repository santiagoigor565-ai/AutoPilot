import { env } from "@/lib/env";

export function getHostWithoutPort(host?: string | null) {
  if (!host) return "";
  return host.toLowerCase().split(":")[0] ?? "";
}

export function extractSubdomain(host: string) {
  const cleanHost = getHostWithoutPort(host);
  const rootWithoutPort = env.ROOT_DOMAIN.split(":")[0]?.toLowerCase() ?? "localhost";

  if (cleanHost === rootWithoutPort || cleanHost === `www.${rootWithoutPort}` || cleanHost === "localhost") {
    return null;
  }

  if (cleanHost.endsWith(`.${rootWithoutPort}`)) {
    const sub = cleanHost.slice(0, cleanHost.length - rootWithoutPort.length - 1);
    return sub || null;
  }

  if (cleanHost.endsWith(".localhost")) {
    return cleanHost.replace(".localhost", "");
  }

  return null;
}

export function isAppHost(host: string) {
  const subdomain = extractSubdomain(host);
  return subdomain === env.APP_SUBDOMAIN;
}

export function isAdminHost(host: string) {
  const subdomain = extractSubdomain(host);
  return subdomain === env.ADMIN_SUBDOMAIN;
}

export function isMarketingHost(host: string) {
  const cleanHost = getHostWithoutPort(host);
  const rootWithoutPort = env.ROOT_DOMAIN.split(":")[0]?.toLowerCase() ?? "localhost";
  return cleanHost === rootWithoutPort || cleanHost === `www.${rootWithoutPort}` || cleanHost === "localhost";
}
